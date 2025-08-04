import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, viewChild } from '@angular/core';
import { AssertInternalError, delay1Tick, Integer, MultiEvent } from '@pbkware/js-utils';
import { IntegerListSelectItemUiAction } from '@pbkware/ui-action';
import { ScanEditor, ScanFieldSetLoadErrorType, ScanFormula, StringId, Strings } from '@plxtra/motif-core';
import { SplitAreaSize } from 'angular-split';
import { CaptionLabelNgComponent, IntegerEnumInputNgComponent } from 'controls-ng-api';
import { ScanFormulaViewNgDirective } from '../../scan-formula-view-ng.directive';
import { ScanFieldEditorFrame } from '../field/internal-api';
import { ScanFieldEditorNgComponent } from '../field/ng-api';
import { ScanFieldEditorFramesGridNgComponent } from '../fields-grid/ng-api';
import { ScanFieldEditorFramesGridFrame } from '../internal-api';
import { ScanFieldSetEditorFrame } from '../scan-field-set-editor-frame';

@Component({
    selector: 'app-scan-field-set-editor',
    templateUrl: './scan-field-set-editor-ng.component.html',
    styleUrls: ['./scan-field-set-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ScanFieldSetEditorNgComponent extends ScanFormulaViewNgDirective implements OnDestroy, AfterViewInit {
    public gridSize: SplitAreaSize;
    public gridMinSize: SplitAreaSize;
    public splitterGutterSize = 3;
    public fieldsLabel: string;
    public criteriaCompatible: boolean;
    public criteriaNotCompatibleHeading = `${Strings[StringId.Incompatible]}: `;
    public criteriaNotCompatibleReason: string;

    private readonly _cdr = inject(ChangeDetectorRef);

    private readonly _fieldEditorFrameComponentSignal = viewChild.required<ScanFieldEditorNgComponent>('fieldEditorFrameComponent');
    private readonly _fieldEditorFramesGridComponentSignal = viewChild.required<ScanFieldEditorFramesGridNgComponent>('fieldsGrid');
    // @viewChild.required('addFieldLabel', { static: true }) private _addFieldLabelComponentSignal: CaptionLabelNgComponent;
    private readonly _addFieldControlComponentSignal = viewChild.required<IntegerEnumInputNgComponent>('addFieldControl');
    private readonly _addAttributeFieldLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('addAttributeFieldLabel');
    private readonly _addAttributeFieldControlComponentSignal = viewChild.required<IntegerEnumInputNgComponent>('addAttributeFieldControl');
    private readonly _addAltCodeFieldLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('addAltCodeFieldLabel');
    private readonly _addAltCodeFieldControlComponentSignal = viewChild.required<IntegerEnumInputNgComponent>('addAltCodeFieldControl');

    private readonly _addFieldUiAction: IntegerListSelectItemUiAction;
    private readonly _addAttributeFieldUiAction: IntegerListSelectItemUiAction;
    private readonly _addAltCodeFieldUiAction: IntegerListSelectItemUiAction;

    private _fieldEditorFrameComponent: ScanFieldEditorNgComponent;
    private _fieldEditorFramesGridComponent: ScanFieldEditorFramesGridNgComponent;
    private _addFieldControlComponent: IntegerEnumInputNgComponent;
    private _addAttributeFieldLabelComponent: CaptionLabelNgComponent;
    private _addAttributeFieldControlComponent: IntegerEnumInputNgComponent;
    private _addAltCodeFieldLabelComponent: CaptionLabelNgComponent;
    private _addAltCodeFieldControlComponent: IntegerEnumInputNgComponent;

    private _frame: ScanFieldSetEditorFrame | undefined;
    private _frameChangedEventSubscriptionId: MultiEvent.SubscriptionId;
    private _frameBeforeFieldsDeleteSubscriptionId: MultiEvent.SubscriptionId;
    private _fieldEditorFramesGridFrame: ScanFieldEditorFramesGridFrame;

    constructor() {
        super(++ScanFieldSetEditorNgComponent.typeInstanceCreateCount);

        this._addFieldUiAction = this.createAddFieldUiAction();
        this._addAttributeFieldUiAction = this.createAddAttributeFieldUiAction();
        this._addAltCodeFieldUiAction = this.createAddAltCodeFieldUiAction();
    }

    ngOnDestroy(): void {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._fieldEditorFrameComponent = this._fieldEditorFrameComponentSignal();
        this._fieldEditorFramesGridComponent = this._fieldEditorFramesGridComponentSignal();
        this._addFieldControlComponent = this._addFieldControlComponentSignal();
        this._addAttributeFieldLabelComponent = this._addAttributeFieldLabelComponentSignal();
        this._addAttributeFieldControlComponent = this._addAttributeFieldControlComponentSignal();
        this._addAltCodeFieldLabelComponent = this._addAltCodeFieldLabelComponentSignal();
        this._addAltCodeFieldControlComponent = this._addAltCodeFieldControlComponentSignal();

        delay1Tick(() => this.initialiseComponents());
    }

    public handleSplitterDragEnd() {
        //
    }

    override setEditor(value: ScanEditor | undefined) {
        super.setEditor(value);
        if (value === undefined) {
            this._fieldEditorFrameComponent.setFrame(undefined, false);
            this._fieldEditorFramesGridComponent.setList(undefined);
            if (this._frame !== undefined) {
                this._frame.unsubscribeChangedEvent(this._frameChangedEventSubscriptionId);
                this._frameChangedEventSubscriptionId = undefined;
                this._frame.unsubscribeBeforeFieldsDeleteEvent(this._frameBeforeFieldsDeleteSubscriptionId);
                this._frameBeforeFieldsDeleteSubscriptionId = undefined;
            }
            this._frame = undefined;
        } else {
            const criteriaAsFieldSet = value.criteriaAsFieldSet;
            if (criteriaAsFieldSet === undefined) {
                throw new AssertInternalError('SFSENC99551');
            } else {
                const frame = criteriaAsFieldSet as ScanFieldSetEditorFrame;
                this._frame = frame;
                this._frameChangedEventSubscriptionId = this._frame.subscribeChangedEvent(
                    (framePropertiesChanged, fieldCountChanged, modifierRoot) => this.processFrameChanged(
                        framePropertiesChanged, fieldCountChanged, modifierRoot
                    )
                );
                this._frameBeforeFieldsDeleteSubscriptionId = this._frame.subscribeBeforeFieldsDeleteEvent(
                    (idx, count) => this.processBeforeFieldsDelete(idx, count)
                );
                this._fieldEditorFramesGridComponent.setList(frame.fields);
                this.pushFrameProperties();
            }
        }
    }

    // override processScanEditorFieldChanges(fieldIds: ScanEditor.FieldId[], fieldChanger: ComponentBaseNgDirective.InstanceId) {
    //     if (fieldChanger !== this.instanceId) {
    //         if (fieldIds.includes(ScanEditor.FieldId.CriteriaAsFieldSet)) {
    //             const frame = this._frame;
    //             if (frame === undefined) {
    //                 throw new AssertInternalError('SFSENCPSEFC87743');
    //             } else {
    //                 // I do not think there is anything required to do here as subscriptions to Frame changes should handle this
    //             }
    //         }
    //     }
    // }

    private initialiseComponents() {
        this._fieldEditorFrameComponent.setRootComponentInstanceId(this.instanceId);
        // this._addFieldLabelComponent.initialise(this._addFieldUiAction);
        this._addFieldControlComponent.initialise(this._addFieldUiAction);
        this._addFieldControlComponent.openEventer = () => this.pushAddFieldFilter();
        this._addAttributeFieldLabelComponent.initialise(this._addAttributeFieldUiAction);
        this._addAttributeFieldControlComponent.initialise(this._addAttributeFieldUiAction);
        this._addAttributeFieldControlComponent.openEventer = () => this.pushAddAttributeFieldFilter();
        this._addAltCodeFieldLabelComponent.initialise(this._addAltCodeFieldUiAction);
        this._addAltCodeFieldControlComponent.initialise(this._addAltCodeFieldUiAction);
        this._addAltCodeFieldControlComponent.openEventer = () => this.pushAddAltCodeFieldFilter();

        this._fieldEditorFramesGridComponent.initialise();
        this._fieldEditorFramesGridFrame = this._fieldEditorFramesGridComponent.frame;
        this._fieldEditorFramesGridFrame.recordFocusedEventer = (index) => this.processFieldEditorFrameFocusChange(index);
    }

    private finalise() {
        this._fieldEditorFrameComponent.setFrame(undefined, true);
        this._addFieldUiAction.finalise();
        this._addAttributeFieldUiAction.finalise();
        this._addAltCodeFieldUiAction.finalise();
    }

    private createAddFieldUiAction() {
        const action = new IntegerListSelectItemUiAction(false);
        action.pushCaption(Strings[StringId.AddField]);
        action.pushPlaceholder(Strings[StringId.AddField]);
        action.pushTitle(Strings[StringId.ScanFieldSetEditor_AddAField]);
        const fieldDefinitions = ScanFieldEditorFrame.allDefinitions;

        this.pushElementsAndAddCommitHandlerToAddFieldUiAction(action, fieldDefinitions);

        return action;
    }

    private createAddAttributeFieldUiAction() {
        const action = new IntegerListSelectItemUiAction(false);
        action.pushCaption(Strings[StringId.AddAttributeField]);
        action.pushTitle(Strings[StringId.ScanFieldSetEditor_AddAnAttributeBasedField]);
        const fieldDefinitions = ScanFieldEditorFrame.allDefinitions.filter(
            (definition) => definition.scanFormulaFieldId === ScanFormula.FieldId.AttributeSubbed
        );

        this.pushElementsAndAddCommitHandlerToAddFieldUiAction(action, fieldDefinitions);

        return action;
    }

    private createAddAltCodeFieldUiAction() {
        const action = new IntegerListSelectItemUiAction(false);
        action.pushCaption(Strings[StringId.AddAltCodeField]);
        action.pushTitle(Strings[StringId.ScanFieldSetEditor_AddAnAltCodeBasedField]);
        const fieldDefinitions = ScanFieldEditorFrame.allDefinitions.filter(
            (definition) => definition.scanFormulaFieldId === ScanFormula.FieldId.AltCodeSubbed
        );

        this.pushElementsAndAddCommitHandlerToAddFieldUiAction(action, fieldDefinitions);

        return action;
    }

    private pushElementsAndAddCommitHandlerToAddFieldUiAction(
        action: IntegerListSelectItemUiAction,
        fieldDefinitions: readonly ScanFieldEditorFrame.Definition[],
    ) {
        const list = fieldDefinitions.map<IntegerListSelectItemUiAction.ItemProperties>(
            (definition) => ({
                    item: definition.id,
                    caption: definition.name,
                    title: '',
                }
            )
        );
        action.pushList(list, undefined);
        action.commitEvent = () => {
            const frame = this._frame;
            if (frame === undefined) {
                throw new AssertInternalError('SFSENCPEAACHTAFUA44487');
            } else {
                const idx = frame.addField(action.definedValue);
                this._fieldEditorFramesGridFrame.focusItem(idx);
                delay1Tick(() => action.pushValue(undefined));
            }
        }
    }

    private pushAddFieldFilter(): Promise<void> {
        const frame = this._frame;
        if (frame === undefined) {
            throw new AssertInternalError('SFSENCPAFF77743');
        } else {
            const alreadyAddedFields = frame.fields;
            const allDefinitions = ScanFieldEditorFrame.allDefinitions;
            const allDefinitionsCount = allDefinitions.length;

            const filterDefinitionIds = new Array<number>(allDefinitionsCount);
            let filterDefinitionIdCount = 0;
            for (let i = 0; i < allDefinitionsCount; i++) {
                const definition = allDefinitions[i];
                const name = definition.name;
                if (!alreadyAddedFields.has((fieldEditorFrame) => fieldEditorFrame.name === name)) {
                    filterDefinitionIds[filterDefinitionIdCount++] = definition.id;
                }
            }

            if (filterDefinitionIdCount === allDefinitionsCount) {
                this._addFieldUiAction.pushFilter(undefined);
            } else {
                filterDefinitionIds.length = filterDefinitionIdCount;
                this._addFieldUiAction.pushFilter(filterDefinitionIds);
            }
            return Promise.resolve(undefined);
        }
    }

    private pushAddAttributeFieldFilter(): Promise<void> {
        const frame = this._frame;
        if (frame === undefined) {
            throw new AssertInternalError('SFSENCPAAFF77743');
        } else {
            const alreadyAddedFields = frame.fields;
            const allDefinitions = ScanFieldEditorFrame.allDefinitions;
            const allDefinitionsCount = allDefinitions.length;

            const filterDefinitionIds = new Array<number>(allDefinitionsCount);
            let hasAtLeastOne = false;
            let filterDefinitionIdCount = 0;
            for (let i = 0; i < allDefinitionsCount; i++) {
                const definition = allDefinitions[i];
                if (definition.scanFormulaFieldId === ScanFormula.FieldId.AttributeSubbed) {
                    const name = definition.name;
                    if (alreadyAddedFields.has((fieldEditorFrame) => fieldEditorFrame.name === name)) {
                        hasAtLeastOne = true;
                    } else {
                        filterDefinitionIds[filterDefinitionIdCount++] = definition.id;
                    }
                }
            }

            if (hasAtLeastOne) {
                filterDefinitionIds.length = filterDefinitionIdCount;
                this._addFieldUiAction.pushFilter(filterDefinitionIds);
            } else {
                this._addFieldUiAction.pushFilter(undefined);
            }
            return Promise.resolve(undefined);
        }
    }

    private pushAddAltCodeFieldFilter(): Promise<void> {
        const frame = this._frame;
        if (frame === undefined) {
            throw new AssertInternalError('SFSENCPAACFF77743');
        } else {
            const alreadyAddedFields = frame.fields;
            const allDefinitions = ScanFieldEditorFrame.allDefinitions;
            const allDefinitionsCount = allDefinitions.length;

            const filterDefinitionIds = new Array<number>(allDefinitionsCount);
            let hasAtLeastOne = false;
            let filterDefinitionIdCount = 0;
            for (let i = 0; i < allDefinitionsCount; i++) {
                const definition = allDefinitions[i];
                if (definition.scanFormulaFieldId === ScanFormula.FieldId.AltCodeSubbed) {
                    const name = definition.name;
                    if (alreadyAddedFields.has((fieldEditorFrame) => fieldEditorFrame.name === name)) {
                        hasAtLeastOne = true;
                    } else {
                        filterDefinitionIds[filterDefinitionIdCount++] = definition.id;
                    }
                }
            }

            if (hasAtLeastOne) {
                filterDefinitionIds.length = filterDefinitionIdCount;
                this._addFieldUiAction.pushFilter(filterDefinitionIds);
            } else {
                this._addFieldUiAction.pushFilter(undefined);
            }
            return Promise.resolve(undefined);
        }
    }

    private pushFrameProperties() {
        const frame = this._frame;
        if (frame === undefined) {
            throw new AssertInternalError('SFSENCPFP77743');
        } else {
            let changed = false;
            const loadError = frame.loadError;

            let criteriaCompatible: boolean;
            if (loadError === undefined) {
                criteriaCompatible = true;
            } else {
                criteriaCompatible = false;
                let criteriaNotCompatibleReason = ScanFieldSetLoadErrorType.idToDisplay(loadError.typeId);
                const extra = loadError.extra;
                if (extra !== undefined) {
                    criteriaNotCompatibleReason += `: ${extra}`;
                }
                if (criteriaNotCompatibleReason !== this.criteriaNotCompatibleReason) {
                    this.criteriaNotCompatibleReason = criteriaNotCompatibleReason;
                    changed = true;
                }
            }

            if (criteriaCompatible !== this.criteriaCompatible) {
                this.criteriaCompatible = criteriaCompatible;
                changed = true;
            }

            if (changed) {
                this._cdr.markForCheck();
            }
        }
    }

    private processBeforeFieldsDelete(idx: Integer, count: Integer) {
        const activeFieldEditorFrame = this._fieldEditorFrameComponent.frame;
        if (activeFieldEditorFrame !== undefined) {
            const frame = this._frame;
            if (frame === undefined) {
                throw new AssertInternalError('SFSENCPBFD56081');
            } else {
                const fieldEditorFrames = frame.fields;

                for (let i = idx + count - 1; i >= idx; i--) {
                    const fieldEditorFrame = fieldEditorFrames.getAt(i);
                    if (fieldEditorFrame === activeFieldEditorFrame) {
                        this._fieldEditorFrameComponent.setFrame(undefined, false);
                        break;
                    }
                }
            }
        }
    }

    private processFrameChanged(framePropertiesChanged: boolean, fieldCountChanged: boolean, modifierRoot: ScanEditor.Modifier | undefined) {
        if (modifierRoot === this.instanceId) {
            if (this._scanEditor === undefined) {
                throw new AssertInternalError('SFSENCPFC77743');
            } else {
                this._scanEditor.flagCriteriaAsFieldSetChanged(modifierRoot);
            }
        }

        if (fieldCountChanged) {
            const promise = this.pushAddFieldFilter();
            AssertInternalError.throwErrorIfPromiseRejected(promise, 'SFSENCPFC66876');
        }

        if (framePropertiesChanged) {
            this.pushFrameProperties();
        }
    }

    private processFieldEditorFrameFocusChange(index: Integer | undefined) {
        if (index === undefined) {
            this._fieldEditorFrameComponent.setFrame(undefined, false);
        } else {
            const scanFieldEditorFrame = this._fieldEditorFramesGridFrame.getScanFieldEditorFrameAt(index);
            this._fieldEditorFrameComponent.setFrame(scanFieldEditorFrame, false);
        }
    }
}

export namespace ScanFieldSetEditorNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type Frame = ScanFieldSetEditorFrame;
}
