import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, inject, input, OnDestroy, OnInit, untracked, viewChild } from '@angular/core';
import { AssertInternalError, delay1Tick, EnumInfoOutOfOrderError, Integer, UnreachableCaseError } from '@pbkware/js-utils';
import { IntegerListSelectItemUiAction } from '@pbkware/ui-action';
import {
    ScanEditor,
    StringId,
    Strings
} from '@plxtra/motif-core';
import { ComponentBaseNgDirective } from '../../../../../../component/ng-api';
import { ExpandableCollapsibleLinedHeadingNgComponent } from '../../../../../expandable-collapsible-lined-heading/ng-api';
import { ScanEditorSectionNgDirective } from '../../scan-editor-section-ng.directive';
import { ConditionSetScanFormulaViewNgComponent, CriteriaZenithScanFormulaViewNgComponent, RankZenithScanFormulaViewNgComponent, ScanFieldSetEditorNgComponent } from '../view/ng-api';

@Component({
    selector: 'app-formula-scan-editor-section',
    templateUrl: './formula-scan-editor-section-ng.component.html',
    styleUrls: ['./formula-scan-editor-section-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ExpandableCollapsibleLinedHeadingNgComponent, CriteriaZenithScanFormulaViewNgComponent, ConditionSetScanFormulaViewNgComponent, ScanFieldSetEditorNgComponent, RankZenithScanFormulaViewNgComponent]
})
export class FormulaScanEditorSectionNgComponent extends ScanEditorSectionNgDirective implements OnInit, OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    readonly formulaField = input.required<FormulaScanEditorSectionNgComponent.FormulaField>();

    public sectionHeadingText: string;
    public genericSelectorCaption: string;
    public genericSelectorWidth: string;

    protected override _sectionHeadingComponent: ExpandableCollapsibleLinedHeadingNgComponent;

    private readonly _cdr = inject(ChangeDetectorRef);

    private readonly _sectionHeadingComponentSignal = viewChild.required<ExpandableCollapsibleLinedHeadingNgComponent>('sectionHeading');
    private readonly _zenithCriteriaViewComponentSignal = viewChild<CriteriaZenithScanFormulaViewNgComponent>('zenithCriteriaView');
    private readonly _conditionSetCriteriaViewComponentSignal = viewChild<ConditionSetScanFormulaViewNgComponent>('conditionSetCriteriaView');
    private readonly _scanFieldSetEditorComponentSignal = viewChild<ScanFieldSetEditorNgComponent>('scanFieldSetEditor');
    private readonly _rankViewComponentSignal = viewChild<RankZenithScanFormulaViewNgComponent>('rankView');

    private readonly _viewUiAction: IntegerListSelectItemUiAction;

    private _zenithCriteriaViewComponent: CriteriaZenithScanFormulaViewNgComponent | undefined;
    private _conditionSetCriteriaViewComponent: ConditionSetScanFormulaViewNgComponent | undefined;
    private _scanFieldSetEditorComponent: ScanFieldSetEditorNgComponent | undefined;
    private _rankViewComponent: RankZenithScanFormulaViewNgComponent | undefined;

    private _formulaField: FormulaScanEditorSectionNgComponent.FormulaField;
    private _viewId: FormulaScanEditorSectionNgComponent.ViewId;

    constructor() {
        super(++FormulaScanEditorSectionNgComponent.typeInstanceCreateCount);

        this._viewUiAction = this.createViewUiAction();

        effect(() => {
            const formulaField = this.formulaField();
            untracked(() => {
                this.setFormulaField(formulaField);
            });
        });
    }

    public isZenithView() { return this._viewId === FormulaScanEditorSectionNgComponent.ViewId.Zenith; }
    public isFieldSetView() { return this._viewId === FormulaScanEditorSectionNgComponent.ViewId.FieldSet; }
    public isConditionSetView() { return this._viewId === FormulaScanEditorSectionNgComponent.ViewId.ConditionSet; }

    ngOnInit() {
        this.pushValues();
    }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._sectionHeadingComponent = this._sectionHeadingComponentSignal();
        this._zenithCriteriaViewComponent = this._zenithCriteriaViewComponentSignal();
        this._conditionSetCriteriaViewComponent = this._conditionSetCriteriaViewComponentSignal();
        this._scanFieldSetEditorComponent = this._scanFieldSetEditorComponentSignal();
        this._rankViewComponent = this._rankViewComponentSignal();

        delay1Tick(() => {
            this.setViewId(FormulaScanEditorSectionNgComponent.ViewId.FieldSet); // get this from settings
            this.initialiseComponents();
        });
    }

    override setEditor(value: ScanEditor | undefined) {
        super.setEditor(value);
        if (this._zenithCriteriaViewComponent !== undefined) {
            this._zenithCriteriaViewComponent.setEditor(value);
        }
        if (this._scanFieldSetEditorComponent !== undefined) {
            this._scanFieldSetEditorComponent.setEditor(value);
        }
        if (this._conditionSetCriteriaViewComponent !== undefined) {
            this._conditionSetCriteriaViewComponent.setEditor(value);
        }
        if (this._rankViewComponent !== undefined) {
            this._rankViewComponent.setEditor(value);
        }
        this.pushValues();
    }

    areAllControlValuesOk() {
        return (
            true // todo
        );
    }

    cancelAllControlsEdited() {
        // No controls to cancel
    }

    protected finalise() {
        this._viewUiAction.finalise();
    }

    protected override processExpandCollapseRestoreStateChanged() {
        // future use
    }

    protected override processFieldChanges(fieldIds: ScanEditor.FieldId[], fieldChanger: ComponentBaseNgDirective.InstanceId) {
        const scanEditor = this.scanEditor;
        if (scanEditor !== undefined && fieldChanger !== this.instanceId) {
        // let criteriaChanged = false;
        // let criteriaChanged = false;
        // for (const fieldId of changedFieldIds) {
        //     switch (fieldId) {
        //         case Scan.FieldId.Criteria:
        //             criteriaChanged = true;
        //             break;
        //         case Scan.FieldId.CriteriaAsZenithText:
        //             criteriaChanged = true;
        //             break;
        //     }
        // }
        }
    }

    protected override processLifeCycleStateChange(): void {
        // possible future use
    }

    protected override processModifiedStateChange(): void {
        // possible future use
    }

    private initialiseComponents() {
        super.initialiseSectionHeadingComponent();

        if (this._formulaField === 'Criteria') {
            const sectionHeadingGenericSelectorComponent = this._sectionHeadingComponent.genericSelectorComponent;
            if (sectionHeadingGenericSelectorComponent === undefined) {
                throw new AssertInternalError('FSESNGIC33992');
            } else {
                sectionHeadingGenericSelectorComponent.initialise(this._viewUiAction);
            }
        }
    }

    private createViewUiAction() {
        const action = new IntegerListSelectItemUiAction();
        action.pushCaption(Strings[StringId.ScanCriteriaCaption_View]);
        action.pushTitle(Strings[StringId.ScanCriteriaDescription_View]);
        const ids = FormulaScanEditorSectionNgComponent.View.getAllIds();
        const list = ids.map<IntegerListSelectItemUiAction.ItemProperties>(
            (id) => ({
                    item: id,
                    caption: FormulaScanEditorSectionNgComponent.View.idToDisplay(id),
                    title: FormulaScanEditorSectionNgComponent.View.idToDescription(id),
                })
        );
        action.pushList(list, undefined);
        action.commitEvent = () => { this.setViewId(action.definedValue); }
        return action;
    }

    private pushValues() {
        if (this.scanEditor === undefined) {
            this._viewUiAction.pushValue(FormulaScanEditorSectionNgComponent.ViewId.FieldSet);
        // } else {
        //     if (this._scan.targetTypeId === Scan.TargetTypeId.Custom) {
        //         this._viewUiAction.pushValue(CriteriaScanPropertiesSectionNgComponent.ViewId.Default);
        //     } else {
        //         this._viewUiAction.pushValue(CriteriaScanPropertiesSectionNgComponent.ViewId.Default);
        //     }
        }
    }

    private setFormulaField(value: FormulaScanEditorSectionNgComponent.FormulaField) {
        if (value !== this._formulaField) {
            this._formulaField = value;
            switch (value) {
                case 'Criteria':
                    this.sectionHeadingText = Strings[StringId.Criteria];
                    this.genericSelectorWidth = '10em';
                    this.genericSelectorCaption = Strings[StringId.View] + ':';
                    break;
                case 'Rank':
                    this.sectionHeadingText = Strings[StringId.Rank];
                    break;
                default:
                    throw new UnreachableCaseError('ZSFVNC66674', value);
            }
            this._cdr.markForCheck();
        }
    }

    private setViewId(value: FormulaScanEditorSectionNgComponent.ViewId) {
        if (value !== this._viewId) {
            this._viewId = value;
            this._cdr.markForCheck();
        }
    }
}

export namespace FormulaScanEditorSectionNgComponent {
    export const enum FormulaFieldEnum {
        Criteria,
        Rank,
    }
    export type FormulaField = keyof typeof FormulaFieldEnum;

    export const enum ViewId {
        FieldSet,
        ConditionSet,
        Zenith,
    }

    export namespace View {
        export type Id = ViewId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly displayId: StringId;
            readonly descriptionId: StringId;
        }

        type InfosObject = { [id in keyof typeof ViewId]: Info };

        const infosObject: InfosObject = {
            FieldSet: {
                id: ViewId.FieldSet,
                name: 'FieldSet',
                displayId: StringId.ScanCriteriaViewDisplay_FieldSet,
                descriptionId: StringId.ScanCriteriaViewDescription_FieldSet,
            },
            ConditionSet: {
                id: ViewId.ConditionSet,
                name: 'ConditionSet',
                displayId: StringId.ScanCriteriaViewDisplay_ConditionSet,
                descriptionId: StringId.ScanCriteriaViewDescription_ConditionSet,
            },
            Zenith: {
                id: ViewId.Zenith,
                name: 'Zenith',
                displayId: StringId.ScanCriteriaViewDisplay_Zenith,
                descriptionId: StringId.ScanCriteriaViewDescription_Zenith,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index as ViewId);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError(
                    'FormulaScanEditorSectionNgComponent.ViewId', outOfOrderIdx, infos[outOfOrderIdx].name
                );
            }
        }

        export function getAllIds() {
            return infos.map(info => info.id).filter((viewId) => viewId !== ViewId.ConditionSet); // ConditionSet not fully implemented
        }

        export function idToDisplayId(id: Id): StringId {
            return infos[id].displayId;
        }

        export function idToDisplay(id: Id): string {
            return Strings[idToDisplayId(id)];
        }

        export function idToDescriptionId(id: Id): StringId {
            return infos[id].descriptionId;
        }

        export function idToDescription(id: Id): string {
            return Strings[idToDescriptionId(id)];
        }
    }
}

FormulaScanEditorSectionNgComponent.View.initialise();
