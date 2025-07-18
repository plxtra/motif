import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, OnDestroy, viewChild } from '@angular/core';
import { AssertInternalError, delay1Tick, HtmlTypes, Integer, MultiEvent, UnreachableCaseError } from '@pbkware/js-utils';
import {
    AllowedSourcedFieldsColumnLayoutDefinition,
    ButtonUiAction,
    CommandRegisterService,
    DataIvemId,
    InternalCommand,
    ScanEditor,
    StringId,
    Strings,
    UiComparableList
} from '@plxtra/motif-core';
import { SplitAreaSize } from 'angular-split';
import { CommandRegisterNgService, ToastNgService } from 'component-services-ng-api';
import { ButtonInputNgComponent } from 'controls-ng-api';
import { RevColumnLayoutOrReferenceDefinition } from 'revgrid';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';
import { ScanTestNgComponent } from '../../test/ng-api';
import {
    FormulaScanEditorSectionNgComponent,
    GeneralScanEditorSectionNgComponent,
    ScanEditorAttachedNotificationChannelsNgComponent
} from '../section/ng-api';

@Component({
    selector: 'app-scan-editor',
    templateUrl: './scan-editor-ng.component.html',
    styleUrls: ['./scan-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ScanEditorNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    @HostBinding('style.visibility') visibility = HtmlTypes.Visibility.Hidden;

    editGridColumnsEventer: ScanEditorNgComponent.EditTargetsMultiSymbolGridColumnsEventer | undefined;
    popoutTargetsMultiSymbolListEditorEventer: ScanEditorNgComponent.PopoutTargetsMultiSymbolListEditorEventer | undefined;

    public criteriaFieldId = ScanEditor.FieldId.Criteria;
    public rankFieldId = ScanEditor.FieldId.Rank;
    public sectionsSize: SplitAreaSize;
    public sectionsMinSize: SplitAreaSize;
    public testSize: null | number = null;
    public splitterGutterSize = 3;
    public rankDisplayed: boolean;

    private readonly _generalSectionComponentSignal = viewChild.required<GeneralScanEditorSectionNgComponent>('generalSection');
    private readonly _criteriaSectionComponentSignal = viewChild.required<FormulaScanEditorSectionNgComponent>('criteriaSection');
    private readonly _rankSectionComponentSignal = viewChild.required<FormulaScanEditorSectionNgComponent>('rankSection');
    private readonly _notificationChannelsSectionComponentSignal = viewChild.required<ScanEditorAttachedNotificationChannelsNgComponent>('notificationChannelsSection');
    private readonly _testComponentSignal = viewChild.required<ScanTestNgComponent>('test');
    private readonly _applyButtonComponentSignal = viewChild.required<ButtonInputNgComponent>('applyButton');
    private readonly _revertButtonComponentSignal = viewChild.required<ButtonInputNgComponent>('revertButton');
    private readonly _deleteButtonComponentSignal = viewChild.required<ButtonInputNgComponent>('deleteButton');
    private readonly _testButtonComponentSignal = viewChild.required<ButtonInputNgComponent>('testButton');

    private readonly _applyUiAction: ButtonUiAction;
    private readonly _revertUiAction: ButtonUiAction;
    private readonly _deleteUiAction: ButtonUiAction;
    private readonly _testUiAction: ButtonUiAction;

    private _generalSectionComponent: GeneralScanEditorSectionNgComponent;
    private _criteriaSectionComponent: FormulaScanEditorSectionNgComponent;
    private _rankSectionComponent: FormulaScanEditorSectionNgComponent;
    private _notificationChannelsSectionComponent: ScanEditorAttachedNotificationChannelsNgComponent;
    private _testComponent: ScanTestNgComponent;
    private _applyButtonComponent: ButtonInputNgComponent;
    private _revertButtonComponent: ButtonInputNgComponent;
    private _deleteButtonComponent: ButtonInputNgComponent;
    private _testButtonComponent: ButtonInputNgComponent;

    private _scanEditor: ScanEditor | undefined;
    private _scanEditorFieldChangesSubscriptionId: MultiEvent.SubscriptionId;
    private _scanEditorLifeCycleStateChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _scanEditorModifiedStateChangeSubscriptionId: MultiEvent.SubscriptionId;

    private _resizeObserver: ResizeObserver;
    private _splitterDragged = false;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private readonly _cdr: ChangeDetectorRef,
        commandRegisterNgService: CommandRegisterNgService,
        private readonly _toastNgService: ToastNgService,
    ) {
        super(elRef, ++ScanEditorNgComponent.typeInstanceCreateCount);

        const commandRegisterService = commandRegisterNgService.service;

        this._applyUiAction = this.createApplyUiAction(commandRegisterService);
        this._revertUiAction = this.createRevertUiAction(commandRegisterService);
        this._deleteUiAction = this.createDeleteUiAction(commandRegisterService);
        this._testUiAction = this.createTestUiAction(commandRegisterService);
    }

    ngOnDestroy(): void {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._generalSectionComponent = this._generalSectionComponentSignal();
        this._criteriaSectionComponent = this._criteriaSectionComponentSignal();
        this._rankSectionComponent = this._rankSectionComponentSignal();
        this._notificationChannelsSectionComponent = this._notificationChannelsSectionComponentSignal();
        this._testComponent = this._testComponentSignal();
        this._applyButtonComponent = this._applyButtonComponentSignal();
        this._revertButtonComponent = this._revertButtonComponentSignal();
        this._deleteButtonComponent = this._deleteButtonComponentSignal();
        this._testButtonComponent = this._testButtonComponentSignal();

        delay1Tick(() => {
            this.initialiseComponents();
            this._resizeObserver = new ResizeObserver(() => this.updateWidths());
            this._resizeObserver.observe(this.rootHtmlElement);
            this._testComponent.displayedChangedEventer = () => {
                this._splitterDragged = false;
                this.updateTestDisplayed();
                delay1Tick(() => this.updateWidths());
            }
            this.updateTestDisplayed();
            this.checkUpdateRankDisplayed();
        });
    }

    setEditor(scanEditor: ScanEditor | undefined) {
        this._generalSectionComponent.setEditor(scanEditor);
        this._criteriaSectionComponent.setEditor(scanEditor);
        this._rankSectionComponent.setEditor(scanEditor);
        this._notificationChannelsSectionComponent.setEditor(scanEditor);

        if (this._scanEditor !== undefined) {
            this._scanEditor.unsubscribeFieldChangesEvents(this._scanEditorFieldChangesSubscriptionId);
            this._scanEditorFieldChangesSubscriptionId = undefined;
            this._scanEditor.unsubscribeLifeCycleStateChangeEvents(this._scanEditorLifeCycleStateChangeSubscriptionId);
            this._scanEditorLifeCycleStateChangeSubscriptionId = undefined;
            this._scanEditor.unsubscribeModifiedStateChangeEvents(this._scanEditorModifiedStateChangeSubscriptionId);
            this._scanEditorModifiedStateChangeSubscriptionId = undefined;
        }

        this._scanEditor = scanEditor;

        let newVisibility: HtmlTypes.Visibility;
        if (scanEditor === undefined) {
            newVisibility = HtmlTypes.Visibility.Hidden;
        } else {
            this._scanEditorFieldChangesSubscriptionId = scanEditor.subscribeFieldChangesEvents(
                () => this.handleScanEditorFieldChangesEvent()
            )
            this._scanEditorLifeCycleStateChangeSubscriptionId = scanEditor.subscribeLifeCycleStateChangeEvents(
                () => this.handleScanEditorLifeCycleStateChangeEvent()
            )
            this._scanEditorModifiedStateChangeSubscriptionId = scanEditor.subscribeModifiedStateChangeEvents(
                () => this.handleScanEditorModifiedStateChangeEvent()
            )

            newVisibility = HtmlTypes.Visibility.Visible;
        }

        this.cancelAllControlsEdited();

        this.updateApplyButton();
        this.updateRevertButton();
        this.updateDeleteButton();
        this.updateTestButton();

        if (newVisibility !== this.visibility) {
            this.visibility = newVisibility;
            this._cdr.markForCheck();
        }
    }

    public handleSplitterDragEnd() {
        this._splitterDragged = true;
    }

    protected finalise() {
        this._generalSectionComponent.controlInputOrCommitEventer = undefined;
        this._generalSectionComponent.editGridColumnsEventer = undefined;
        this._generalSectionComponent.popoutTargetsMultiSymbolListEditorEventer = undefined;
        this._generalSectionComponent.rankDisplayedPossiblyChangedEventer = undefined;

        this._testComponent.displayedChangedEventer = undefined;
        this._resizeObserver.disconnect();

        this.setEditor(undefined);

        this._applyUiAction.finalise();
        this._revertUiAction.finalise();
        this._deleteUiAction.finalise();
        this._testUiAction.finalise();
    }

    private handleScanEditorFieldChangesEvent() {
        this.updateApplyButton();
        this.updateTestButton();
    }

    private handleScanEditorLifeCycleStateChangeEvent() {
        this.updateApplyButton();
        this.updateRevertButton();
        this.updateDeleteButton();
    }

    private handleScanEditorModifiedStateChangeEvent() {
        this.updateApplyButton();
        this.updateRevertButton();
    }

    private handleControlInputOrCommitEvent() {
        this.updateApplyButton();
        this.updateRevertButton();
        this.updateDeleteButton();
    }

    private createApplyUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.ScanEditor_Apply;
        const displayId = StringId.Apply;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.ScanEditorComponent_ApplyTitle]);
        action.pushUnselected();
        action.signalEvent = () => this.handleApplyUiActionSignalEvent();
        return action;
    }

    private createRevertUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.ScanEditor_Revert;
        const displayId = StringId.Revert;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushCaption(Strings[StringId.Revert]);
        action.pushTitle(Strings[StringId.ScanEditorComponent_RevertTitle]);
        action.pushUnselected();
        action.signalEvent = () => this.handleRevertUiActionSignalEvent();
        return action;
    }

    private createDeleteUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.ScanEditor_Delete;
        const displayId = StringId.Delete;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushCaption(Strings[StringId.Delete]);
        action.pushTitle(Strings[StringId.ScanEditorComponent_DeleteTitle]);
        action.pushUnselected();
        action.signalEvent = () => this.handleDeleteUiActionSignalEvent();
        return action;
    }

    private createTestUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.ScanEditor_Test;
        const displayId = StringId.Test;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.ScanEditorComponent_TestTitle]);
        action.pushUnselected();
        action.signalEvent = () => this.handleTestUiActionSignalEvent();
        return action;
    }

    private initialiseComponents() {
        this._generalSectionComponent.controlInputOrCommitEventer = () => { this.handleControlInputOrCommitEvent(); }
        this._generalSectionComponent.editGridColumnsEventer = (caption, allowedFieldsAndLayoutDefinition) => {
            if (this.editGridColumnsEventer !== undefined) {
                return this.editGridColumnsEventer(caption, allowedFieldsAndLayoutDefinition);
            } else {
                return Promise.resolve(undefined);
            }
        };
        this._generalSectionComponent.popoutTargetsMultiSymbolListEditorEventer = (caption, list, columnsEditCaption) => {
            if (this.popoutTargetsMultiSymbolListEditorEventer !== undefined) {
                this.popoutTargetsMultiSymbolListEditorEventer(caption, list, columnsEditCaption);
            }
        }
        this._generalSectionComponent.rankDisplayedPossiblyChangedEventer = () => { this.checkUpdateRankDisplayed(); }

        this._notificationChannelsSectionComponent.editGridColumnsEventer = (caption, allowedFieldsAndLayoutDefinition) => {
            if (this.editGridColumnsEventer !== undefined) {
                return this.editGridColumnsEventer(caption, allowedFieldsAndLayoutDefinition);
            } else {
                return Promise.resolve(undefined);
            }
        };

        this._applyButtonComponent.initialise(this._applyUiAction);
        this._revertButtonComponent.initialise(this._revertUiAction);
        this._deleteButtonComponent.initialise(this._deleteUiAction);
        this._testButtonComponent.initialise(this._testUiAction);
    }

    private handleApplyUiActionSignalEvent() {
        const editor = this._scanEditor;
        if (editor === undefined) {
            throw new AssertInternalError('SENCHAUASE20241');
        } else {
            const lifeCycleStateId = editor.lifeCycleStateId;
            const promise = editor.apply();
            promise.then(
                (result) => {
                    if (result.isErr()) {
                        let applyTypeErrorStringId: StringId;
                        switch (lifeCycleStateId) {
                            case ScanEditor.LifeCycleStateId.NotYetCreated:
                                applyTypeErrorStringId = StringId.ErrorCreating;
                                break;
                            case ScanEditor.LifeCycleStateId.ExistsDetailLoaded:
                                applyTypeErrorStringId = StringId.ErrorUpdating;
                                break;
                            case ScanEditor.LifeCycleStateId.Creating:
                            case ScanEditor.LifeCycleStateId.ExistsInitialDetailLoading:
                            case ScanEditor.LifeCycleStateId.Updating:
                            case ScanEditor.LifeCycleStateId.Deleted:
                            case ScanEditor.LifeCycleStateId.Deleting:
                                throw new AssertInternalError('SENCHAIASEE55716', lifeCycleStateId.toString());
                            default:
                                throw new UnreachableCaseError('SENCHAIASEU55716', lifeCycleStateId);
                        }
                        this._toastNgService.popup(`${Strings[applyTypeErrorStringId]} ${Strings[StringId.Scan]}: ${result.error}`);
                    }
                },
                (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'SENCHAIASER55716'); }
            );
        }
    }

    private handleRevertUiActionSignalEvent() {
        const editor = this._scanEditor;
        if (editor === undefined) {
            throw new AssertInternalError('SENCHRUASE20241');
        } else {
            this.cancelAllControlsEdited();
            editor.revert();
        }
    }

    private handleDeleteUiActionSignalEvent() {
        const editor = this._scanEditor;
        if (editor === undefined) {
            throw new AssertInternalError('SENCHDUASE20241');
        } else {
            const promise = editor.deleteScan();
            promise.then(
                (result) => {
                    if (result.isErr()) {
                        this._toastNgService.popup(`${Strings[StringId.ErrorDeleting]} ${Strings[StringId.Scan]}: ${result.error}`);
                    }
                },
                (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'SENCHDIASER55716'); }
            );
        }
    }

    private handleTestUiActionSignalEvent() {
        const editor = this._scanEditor;
        if (editor === undefined) {
            throw new AssertInternalError('SENCHTUASEE20241');
        } else {
            const targetTypeId = editor.targetTypeId;
            if (targetTypeId === undefined) {
                throw new AssertInternalError('SENCHTUASETT20241');
            } else {
                const maxMatchCount = editor.maxMatchCount;
                if (maxMatchCount === undefined) {
                    throw new AssertInternalError('SENCHTUASESM20241');
                } else {
                    const criteriaAsZenithEncoded = editor.criteriaAsZenithEncoded;
                    if (criteriaAsZenithEncoded === undefined) {
                        throw new AssertInternalError('SENCHTUASEC20241');
                    } else {
                        const rankAsZenithEncoded = editor.rankAsZenithEncoded;
                        this._testComponent.execute(
                            editor.name,
                            editor.description,
                            targetTypeId,
                            editor.targetMarkets,
                            editor.targetDataIvemIds,
                            maxMatchCount,
                            criteriaAsZenithEncoded,
                            rankAsZenithEncoded,
                        );
                    }
                }
            }
        }
    }

    private updateApplyButton() {
        const editor = this._scanEditor;
        const action = this._applyUiAction;
        if (editor === undefined) {
            action.pushCaption(Strings[StringId.Apply]);
            action.pushDisabled();
        } else {
            switch (editor.lifeCycleStateId) {
                case ScanEditor.LifeCycleStateId.NotYetCreated:
                    action.pushCaption(Strings[StringId.Create]);
                    if (editor.canCreateScan() && this.areAllControlValuesOk()) {
                        action.pushValidOrMissing();
                    } else {
                        action.pushDisabled();
                    }
                    break;
                case ScanEditor.LifeCycleStateId.Creating:
                case ScanEditor.LifeCycleStateId.ExistsInitialDetailLoading:
                    action.pushDisabled();
                    break;
                case ScanEditor.LifeCycleStateId.ExistsDetailLoaded:
                    if (!this.areAllControlValuesOk()) {
                        action.pushDisabled();
                    } else {
                        switch (editor.modifiedStateId) {
                            case ScanEditor.ModifiedStateId.Unmodified:
                                action.pushDisabled();
                                break;
                            case ScanEditor.ModifiedStateId.Modified:
                                action.pushCaption(Strings[StringId.Update]);
                                if (editor.canUpdateScan()) {
                                    action.pushValidOrMissing();
                                } else {
                                    action.pushDisabled();
                                }
                                break;
                            case ScanEditor.ModifiedStateId.Conflict:
                                action.pushCaption(Strings[StringId.Overwrite]);
                                if (editor.canUpdateScan()) {
                                    action.pushValidOrMissing();
                                } else {
                                    action.pushDisabled();
                                }
                                break;
                            default:
                                throw new UnreachableCaseError('SENCUABMD32221', editor.modifiedStateId);
                        }
                    }
                    break;
                case ScanEditor.LifeCycleStateId.Updating:
                case ScanEditor.LifeCycleStateId.Deleting:
                case ScanEditor.LifeCycleStateId.Deleted:
                    action.pushDisabled();
                    break;
                default:
                    throw new UnreachableCaseError('SENCUABLD32221', editor.lifeCycleStateId);
            }
        }
    }

    private updateRevertButton() {
        const editor = this._scanEditor;
        const action = this._revertUiAction;
        if (editor === undefined) {
            action.pushDisabled();
        } else {
            switch (editor.lifeCycleStateId) {
                case ScanEditor.LifeCycleStateId.NotYetCreated:
                case ScanEditor.LifeCycleStateId.ExistsDetailLoaded:
                    switch (editor.modifiedStateId) {
                        case ScanEditor.ModifiedStateId.Unmodified:
                            action.pushDisabled();
                            break;
                        case ScanEditor.ModifiedStateId.Modified:
                            action.pushCaption(Strings[StringId.Revert]);
                            action.pushValidOrMissing();
                            break;
                        case ScanEditor.ModifiedStateId.Conflict:
                            action.pushCaption(Strings[StringId.Revert]);
                            action.pushValidOrMissing();
                            break;
                        default:
                            throw new UnreachableCaseError('SENCUMBMD32221', editor.modifiedStateId);
                    }
                    break;
                case ScanEditor.LifeCycleStateId.Creating:
                case ScanEditor.LifeCycleStateId.ExistsInitialDetailLoading:
                case ScanEditor.LifeCycleStateId.Updating:
                case ScanEditor.LifeCycleStateId.Deleting:
                case ScanEditor.LifeCycleStateId.Deleted:
                    action.pushDisabled();
                    break;
                default:
                    throw new UnreachableCaseError('SENCUABLD32221', editor.lifeCycleStateId);
            }
        }
    }

    private updateDeleteButton() {
        const editor = this._scanEditor;
        const action = this._deleteUiAction;
        if (editor === undefined) {
            action.pushDisabled();
        } else {
            switch (editor.lifeCycleStateId) {
                case ScanEditor.LifeCycleStateId.ExistsDetailLoaded:
                    action.pushValidOrMissing();
                    break;
                case ScanEditor.LifeCycleStateId.NotYetCreated:
                case ScanEditor.LifeCycleStateId.Creating:
                case ScanEditor.LifeCycleStateId.ExistsInitialDetailLoading:
                case ScanEditor.LifeCycleStateId.Updating:
                case ScanEditor.LifeCycleStateId.Deleting:
                case ScanEditor.LifeCycleStateId.Deleted:
                    action.pushDisabled();
                    break;
                default:
                    throw new UnreachableCaseError('SENCUABLD32221', editor.lifeCycleStateId);
            }
        }
    }

    private updateTestButton() {
        const editor = this._scanEditor;
        const action = this._testUiAction;
        if (editor === undefined) {
            action.pushDisabled();
        } else {
            if (this.areAllControlValuesOk() && editor.sourceValid) {
                action.pushValidOrMissing();
            } else {
                action.pushDisabled();
            }
        }
    }

    private updateTestDisplayed() {
        if (this._testComponent.displayed) {
            this.testSize = null;
            this.splitterGutterSize = 3;
        } else {
            this.testSize = 0;
            this.splitterGutterSize = 0;
        }
    }

    private checkUpdateRankDisplayed() {
        const displayed = this._generalSectionComponent.rankDisplayed;
        if (displayed !== this.rankDisplayed) {
            this.rankDisplayed = displayed;
            this._cdr.markForCheck();
        }
    }

    private updateWidths() {
        const sectionsMinWidth = 15 * this._testComponent.emWidth;
        this.sectionsMinSize = sectionsMinWidth;

        if (!this._splitterDragged) {
            const totalWidth = this.rootHtmlElement.offsetWidth;
            const availableTotalWidth = totalWidth - this.splitterGutterSize;
            const testWidth = this._testComponent.approximateWidth;

            let calculatedSectionsWidth: Integer;
            if (availableTotalWidth >= (testWidth + this.sectionsMinSize)) {
                calculatedSectionsWidth = availableTotalWidth - testWidth;
            } else {
                calculatedSectionsWidth = sectionsMinWidth;
            }

            this.sectionsSize = calculatedSectionsWidth;
            this._cdr.markForCheck();
        }
    }

    private areAllControlValuesOk() {
        return (
            this._generalSectionComponent.areAllControlValuesOk()
            // this._criteriaSectionComponent.areAllControlValuesOk() &&
            // this._rankSectionComponent.areAllControlValuesOk() &&
            // this._notificationChannelsSectionComponent.areAllControlValuesOk()
        );
    }

    private cancelAllControlsEdited() {
        this._generalSectionComponent.cancelAllControlsEdited();
        this._criteriaSectionComponent.cancelAllControlsEdited();
        this._rankSectionComponent.cancelAllControlsEdited();
        this._notificationChannelsSectionComponent.cancelAllControlsEdited();
    }
}

export namespace ScanEditorNgComponent {
    export type EditTargetsMultiSymbolGridColumnsEventer = (
        this: void,
        caption: string,
        allowedFieldsAndLayoutDefinition: AllowedSourcedFieldsColumnLayoutDefinition
    ) => Promise<RevColumnLayoutOrReferenceDefinition | undefined>;
    export type PopoutTargetsMultiSymbolListEditorEventer = (
        this: void,
        caption: string,
        list: UiComparableList<DataIvemId>,
        columnsEditCaption: string
    ) => void;
}
