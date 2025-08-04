import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, viewChild } from '@angular/core';
import { delay1Tick } from '@pbkware/js-utils';
import { BooleanUiAction, StringUiAction } from '@pbkware/ui-action';
import {
    AllowedSourcedFieldsColumnLayoutDefinition,
    DataIvemId,
    ScanEditor,
    StringId,
    Strings,
    UiComparableList
} from '@plxtra/motif-core';
import {
    CaptionedCheckboxNgComponent,
    CaptionLabelNgComponent,
    CheckboxInputNgComponent, TextInputNgComponent
} from 'controls-ng-api';
import { RevColumnLayoutOrReferenceDefinition } from 'revgrid';
import { ComponentBaseNgDirective } from '../../../../../../component/ng-api';
import { ExpandableCollapsibleLinedHeadingNgComponent } from '../../../../../expandable-collapsible-lined-heading/ng-api';
import { ScanEditorSectionNgDirective } from '../../scan-editor-section-ng.directive';
import { ScanEditorTargetsNgComponent } from '../targets/ng-api';

@Component({
    selector: 'app-general-scan-editor-section',
    templateUrl: './general-scan-editor-section-ng.component.html',
    styleUrls: ['./general-scan-editor-section-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class GeneralScanEditorSectionNgComponent extends ScanEditorSectionNgDirective implements  OnInit, OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    public sectionHeadingText = Strings[StringId.General];
    public targetsRowHeading = Strings[StringId.Targets];
    public deleteStateText: string | undefined;
    public deletingOrDeleted = false;

    controlInputOrCommitEventer: GeneralScanEditorSectionNgComponent.ControlInputOrCommitEventer | undefined;
    editGridColumnsEventer: GeneralScanEditorSectionNgComponent.EditGridColumnsEventer | undefined;
    popoutTargetsMultiSymbolListEditorEventer: GeneralScanEditorSectionNgComponent.PopoutTargetsMultiSymbolListEditorEventer | undefined;
    rankDisplayedPossiblyChangedEventer: GeneralScanEditorSectionNgComponent.RankDisplayedPossiblyChangedEventer | undefined;

    protected override _sectionHeadingComponent: ExpandableCollapsibleLinedHeadingNgComponent;

    private readonly _cdr = inject(ChangeDetectorRef);

    private readonly _sectionHeadingComponentSignal = viewChild.required<ExpandableCollapsibleLinedHeadingNgComponent>('sectionHeading');
    private readonly _enabledLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('enabledLabel');
    private readonly _enabledControlComponentSignal = viewChild.required<CheckboxInputNgComponent>('enabledControl');
    private readonly _nameLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('nameLabel');
    private readonly _nameControlComponentSignal = viewChild.required<TextInputNgComponent>('nameControl');
    private readonly _descriptionLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('descriptionLabel');
    private readonly _descriptionControlComponentSignal = viewChild.required<TextInputNgComponent>('descriptionControl');
    private readonly _targetsComponentSignal = viewChild.required<ScanEditorTargetsNgComponent>('targetsComponent');
    private readonly _symbolListLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('symbolListLabel');
    private readonly _symbolListControlComponentSignal = viewChild.required<CheckboxInputNgComponent>('symbolListControl');
    private readonly _showRankControlComponentSignal = viewChild.required<CaptionedCheckboxNgComponent>('showRankControl');

    private readonly _enabledUiAction: BooleanUiAction;
    private readonly _nameUiAction: StringUiAction;
    private readonly _descriptionUiAction: StringUiAction;
    // private readonly _typeUiAction: ExplicitElementsEnumUiAction;
    private readonly _symbolListUiAction: BooleanUiAction;
    private readonly _showRankUiAction: BooleanUiAction;

    private _enabledLabelComponent: CaptionLabelNgComponent;
    private _enabledControlComponent: CheckboxInputNgComponent;
    private _nameLabelComponent: CaptionLabelNgComponent;
    private _nameControlComponent: TextInputNgComponent;
    private _descriptionLabelComponent: CaptionLabelNgComponent;
    private _descriptionControlComponent: TextInputNgComponent;
    private _targetsComponent: ScanEditorTargetsNgComponent;
    private _symbolListLabelComponent: CaptionLabelNgComponent;
    private _symbolListControlComponent: CheckboxInputNgComponent;
    private _showRankControlComponent: CaptionedCheckboxNgComponent;

    constructor() {
        super(++GeneralScanEditorSectionNgComponent.typeInstanceCreateCount);

        this._enabledUiAction = this.createEnabledUiAction();
        this._nameUiAction = this.createNameUiAction();
        this._descriptionUiAction = this.createDescriptionUiAction();
        // this._typeUiAction = this.createTypeUiAction();
        this._symbolListUiAction = this.createSymbolListUiAction();
        this._showRankUiAction = this.createShowRankUiAction();
        this.updateShowRankUiActionState();
    }

    get rankDisplayed() { return this._symbolListUiAction.definedValue && this._showRankUiAction.definedValue; }

    ngOnInit() {
        this.pushValues();
        this.pushDeleteState();
    }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._sectionHeadingComponent = this._sectionHeadingComponentSignal();
        this._enabledLabelComponent = this._enabledLabelComponentSignal();
        this._enabledControlComponent = this._enabledControlComponentSignal();
        this._nameLabelComponent = this._nameLabelComponentSignal();
        this._nameControlComponent = this._nameControlComponentSignal();
        this._descriptionLabelComponent = this._descriptionLabelComponentSignal();
        this._descriptionControlComponent = this._descriptionControlComponentSignal();
        this._targetsComponent = this._targetsComponentSignal();
        this._symbolListLabelComponent = this._symbolListLabelComponentSignal();
        this._symbolListControlComponent = this._symbolListControlComponentSignal();
        this._showRankControlComponent = this._showRankControlComponentSignal();

        delay1Tick(() => this.initialiseComponents());
    }

    override setEditor(value: ScanEditor | undefined) {
        super.setEditor(value);
        this.pushValues();
        this.pushDeleteState();
        this._targetsComponent.setEditor(value);
    }

    isDeleted() {
        const scanEditor = this.scanEditor;
        return scanEditor !== undefined && scanEditor.lifeCycleStateId === ScanEditor.LifeCycleStateId.Deleted;
    }

    areAllControlValuesOk() {
        return (
            this._enabledControlComponent.uiAction.isValueOk() &&
            this._nameControlComponent.uiAction.isValueOk() &&
            this._descriptionControlComponent.uiAction.isValueOk() &&
            this._symbolListControlComponent.uiAction.isValueOk() &&
            this._showRankControlComponent.uiAction.isValueOkOrDisabled() &&
            this._targetsComponent.areAllControlValuesOk()
        );
    }

    cancelAllControlsEdited() {
        this._enabledControlComponent.uiAction.cancelEdit();
        this._nameControlComponent.uiAction.cancelEdit();
        this._descriptionControlComponent.uiAction.cancelEdit();
        this._symbolListControlComponent.uiAction.cancelEdit();
        this._showRankControlComponent.uiAction.cancelEdit();
        this._targetsComponent.cancelAllControlsEdited();
    }

    protected finalise() {
        this._targetsComponent.controlInputOrCommitEventer = undefined;
        this._targetsComponent.editGridColumnsEventer = undefined;
        this._targetsComponent.popoutMultiSymbolListEditorEventer = undefined;

        this._enabledUiAction.finalise();
        this._nameUiAction.finalise();
        this._descriptionUiAction.finalise();
        // this._typeUiAction.finalise();
        this._symbolListUiAction.finalise();
        this._showRankUiAction.finalise();
    }

    protected override processExpandCollapseRestoreStateChanged() {
        // future
    }

    protected override processFieldChanges(fieldIds: ScanEditor.FieldId[], fieldChanger: ComponentBaseNgDirective.InstanceId) {
        const scanEditor = this.scanEditor;
        if (scanEditor !== undefined && fieldChanger !== this.instanceId) {
            for (const fieldId of fieldIds) {
                switch (fieldId) {
                    case ScanEditor.FieldId.Id:
                        if (scanEditor.existsOrUpdating && scanEditor.id !== undefined) {
                            this._sectionHeadingComponent.setGenericText(scanEditor.id)
                        }
                        break;
                    case ScanEditor.FieldId.Name:
                        this._nameUiAction.pushValue(scanEditor.name);
                        break;
                    case ScanEditor.FieldId.Description:
                        this._descriptionUiAction.pushValue(scanEditor.description);
                        break;
                    case ScanEditor.FieldId.Enabled:
                        this._enabledUiAction.pushValue(scanEditor.enabled);
                        break;
                    case ScanEditor.FieldId.SymbolListEnabled:
                        this.pushSymbolListEnabledValue(scanEditor.symbolListEnabled);
                        break;
                }
            }
        }
    }

    protected override processLifeCycleStateChange(): void {
        this.pushDeleteState();
    }

    protected override processModifiedStateChange(): void {
        // nothing to do
    }

    private initialiseComponents() {
        super.initialiseSectionHeadingComponent();

        this._enabledLabelComponent.initialise(this._enabledUiAction);
        this._enabledControlComponent.initialise(this._enabledUiAction);
        this._nameLabelComponent.initialise(this._nameUiAction);
        this._nameControlComponent.initialise(this._nameUiAction);
        this._descriptionLabelComponent.initialise(this._descriptionUiAction);
        this._descriptionControlComponent.initialise(this._descriptionUiAction);
        this._symbolListLabelComponent.initialise(this._symbolListUiAction);
        this._symbolListControlComponent.initialise(this._symbolListUiAction);
        this._showRankControlComponent.initialise(this._showRankUiAction);

        this._targetsComponent.controlInputOrCommitEventer = () => { this.notifyControlInputOrCommit() };
        this._targetsComponent.editGridColumnsEventer = (caption, allowedFieldsAndLayoutDefinition) => {
            if (this.editGridColumnsEventer !== undefined) {
                return this.editGridColumnsEventer(caption, allowedFieldsAndLayoutDefinition);
            } else {
                return Promise.resolve(undefined);
            }
        };
        this._targetsComponent.popoutMultiSymbolListEditorEventer = (caption, list, columnsEditCaption) => {
            if (this.popoutTargetsMultiSymbolListEditorEventer !== undefined) {
                this.popoutTargetsMultiSymbolListEditorEventer(caption, list, columnsEditCaption);
            }
        }
    }

    private createEnabledUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.ScanPropertiesCaption_Enabled]);
        action.pushTitle(Strings[StringId.ScanPropertiesTitle_Enabled]);
        action.commitOnAnyValidInput = true;
        action.inputEvent = () => { this.notifyControlInputOrCommit() };
        action.commitEvent = () => {
            const editor = this.scanEditor;
            if (editor !== undefined) {
                editor.beginFieldChanges(this.instanceId);
                editor.setEnabled(this._enabledUiAction.definedValue);
                editor.endFieldChanges();
                this.notifyControlInputOrCommit()
            }
        };
        return action;
    }

    private createNameUiAction() {
        const action = new StringUiAction(true);
        action.pushCaption(Strings[StringId.ScanPropertiesCaption_Name]);
        action.pushTitle(Strings[StringId.ScanPropertiesTitle_Name]);
        action.commitOnAnyValidInput = true;
        action.inputEvent = () => { this.notifyControlInputOrCommit() };
        action.commitEvent = () => {
            const editor = this.scanEditor;
            if (editor !== undefined) {
                editor.beginFieldChanges(this.instanceId);
                editor.setName(this._nameUiAction.definedValue);
                editor.endFieldChanges();
                this.notifyControlInputOrCommit()
            }
        };
        return action;
    }

    private createDescriptionUiAction() {
        const action = new StringUiAction(false);
        action.pushCaption(Strings[StringId.ScanPropertiesCaption_Description]);
        action.pushTitle(Strings[StringId.ScanPropertiesTitle_Description]);
        action.commitOnAnyValidInput = true;
        action.inputEvent = () => { this.notifyControlInputOrCommit() };
        action.commitEvent = () => {
            const editor = this.scanEditor;
            if (editor !== undefined) {
                editor.beginFieldChanges(this.instanceId);
                editor.setDescription(this._descriptionUiAction.definedValue);
                editor.endFieldChanges();
                this.notifyControlInputOrCommit()
            }
        };
        return action;
    }

    private createSymbolListUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.ScanPropertiesCaption_SymbolList]);
        action.pushTitle(Strings[StringId.ScanPropertiesTitle_SymbolList]);
        action.commitOnAnyValidInput = true;
        action.inputEvent = () => { this.notifyControlInputOrCommit() };
        action.commitEvent = () => {
            const value = this._symbolListUiAction.definedValue;
            const editor = this.scanEditor;
            if (editor !== undefined) {
                editor.beginFieldChanges(this.instanceId);
                editor.setSymbolListEnabled(value);
                editor.endFieldChanges();
                this.notifyControlInputOrCommit();
                this.notifyRankDisplayedPossiblyChanged();
            }

            this.updateShowRankUiActionState();
        };
        return action;
    }

    private createShowRankUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.ScanPropertiesCaption_ShowRank]);
        action.pushTitle(Strings[StringId.ScanPropertiesTitle_ShowRank]);
        action.commitOnAnyValidInput = true;
        action.inputEvent = () => { this.notifyControlInputOrCommit() };
        action.commitEvent = () => {
            this.notifyRankDisplayedPossiblyChanged();
        };
        action.pushValue(true);
        return action;
    }

    private pushValues() {
        const scanEditor = this.scanEditor;
        if (scanEditor === undefined) {
            this.deletingOrDeleted = false;

            this._enabledUiAction.pushValue(undefined);
            this._nameUiAction.pushValue(undefined);
            this._descriptionUiAction.pushValue(undefined);
            this.pushSymbolListEnabledValue(undefined);
        } else {
            this._enabledUiAction.pushValue(scanEditor.enabled);
            this._nameUiAction.pushValue(scanEditor.name);
            this._descriptionUiAction.pushValue(scanEditor.description);
            this.pushSymbolListEnabledValue(scanEditor.symbolListEnabled);
        }

    }

    private pushSymbolListEnabledValue(value: boolean | undefined) {
        this._symbolListUiAction.pushValue(value);
        this.updateShowRankUiActionState();
    }

    private pushDeleteState() {
        let newDeleteStateText: string | undefined;
        let deletingOrDeleted: boolean;

        const scanEditor = this.scanEditor;
        if (scanEditor === undefined) {
            newDeleteStateText = undefined;
            deletingOrDeleted = false;
        } else {
            switch (scanEditor.lifeCycleStateId) {
                case ScanEditor.LifeCycleStateId.Deleting:
                    newDeleteStateText = Strings[StringId.Deleting];
                    deletingOrDeleted = true;
                    break;
                case ScanEditor.LifeCycleStateId.Deleted:
                    newDeleteStateText = Strings[StringId.Deleted];
                    deletingOrDeleted = true;
                    break;
                default:
                    newDeleteStateText = undefined;
                    deletingOrDeleted = false;
            }
        }

        if (deletingOrDeleted !== this.deletingOrDeleted) {
            this.deletingOrDeleted = deletingOrDeleted;
            this._cdr.markForCheck();

            if (deletingOrDeleted) {
                this._enabledUiAction.pushReadonly();
                this._nameUiAction.pushReadonly();
                this._descriptionUiAction.pushReadonly();
                this._symbolListUiAction.pushReadonly();
            } else {
                this._enabledUiAction.pushValidOrMissing();
                this._nameUiAction.pushValidOrMissing();
                this._descriptionUiAction.pushValidOrMissing();
                this._symbolListUiAction.pushValidOrMissing();
            }
        }

        if (newDeleteStateText !== this.deleteStateText) {
            this.deleteStateText = newDeleteStateText;
            this._cdr.markForCheck();
        }
    }

    private updateShowRankUiActionState() {
        const symbolListEnabled = this._symbolListUiAction.value === true;
        if (symbolListEnabled) {
            this._showRankUiAction.pushValidOrMissing();
        } else {
            this._showRankUiAction.pushDisabled();
        }
    }

    private notifyControlInputOrCommit(): void {
        if (this.controlInputOrCommitEventer !== undefined) {
            this.controlInputOrCommitEventer();
        }
    }

    private notifyRankDisplayedPossiblyChanged() {
        if (this.rankDisplayedPossiblyChangedEventer !== undefined) {
            this.rankDisplayedPossiblyChangedEventer();
        }
    }
}

export namespace GeneralScanEditorSectionNgComponent {
    export type ControlInputOrCommitEventer = (this: void) => void;
    export type EditGridColumnsEventer = (
        this: void,
        caption: string,
        allowedFieldsAndLayoutDefinition: AllowedSourcedFieldsColumnLayoutDefinition,
    ) => Promise<RevColumnLayoutOrReferenceDefinition | undefined>;
    export type PopoutTargetsMultiSymbolListEditorEventer = (
        this: void,
        caption: string,
        list: UiComparableList<DataIvemId>,
        columnsEditCaption: string
    ) => void;
    export type RankDisplayedPossiblyChangedEventer = (this: void) => void;
}
