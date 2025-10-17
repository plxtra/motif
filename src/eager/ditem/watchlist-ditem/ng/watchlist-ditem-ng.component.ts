import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, ViewContainerRef, inject, viewChild } from '@angular/core';
import { AssertInternalError, Integer, JsonElement, ModifierKey, ModifierKeyId, UnreachableCaseError, delay1Tick } from '@pbkware/js-utils';
import { MappedListSelectItemsUiAction, UiAction } from '@pbkware/ui-action';
import {
    ColumnLayoutOrReference,
    DataIvemId,
    DataIvemIdUiAction,
    IconButtonUiAction,
    InternalCommand,
    MarketsService,
    RankedDataIvemIdList,
    RankedDataIvemIdListDefinition,
    StringId,
    Strings
} from '@plxtra/motif-core';
import {
    AdiNgService,
    FavouriteReferenceableColumnLayoutDefinitionsStoreNgService,
    MarketsNgService,
    SettingsNgService,
    SymbolsNgService,
    TextFormatterNgService,
    ToastNgService
} from 'component-services-ng-api';
import {
    NameableColumnLayoutEditorDialogNgComponent,
    OpenWatchlistDialogNgComponent,
    SaveWatchlistDialogNgComponent,
    WatchlistNgComponent
} from 'content-ng-api';
import { DataIvemIdSelectNgComponent, SvgButtonNgComponent } from 'controls-ng-api';
import { RevColumnLayout, RevReferenceableColumnLayoutDefinition } from 'revgrid';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { WatchlistDitemFrame } from '../watchlist-ditem-frame';
import { DataIvemIdSelectNgComponent as DataIvemIdSelectNgComponent_1 } from '../../../controls/market-ivem-id/data-ivem-id-select/ng/data-ivem-id-select-ng.component';
import { SvgButtonNgComponent as SvgButtonNgComponent_1 } from '../../../controls/boolean/button/icon/svg-button/ng/svg-button-ng.component';
import { WatchlistNgComponent as WatchlistNgComponent_1 } from '../../../content/watchlist/ng/watchlist-ng.component';

@Component({
    selector: 'app-watchlist-ditem',
    templateUrl: './watchlist-ditem-ng.component.html',
    styleUrls: ['./watchlist-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DataIvemIdSelectNgComponent_1, SvgButtonNgComponent_1, WatchlistNgComponent_1]
})
export class WatchlistDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    public watchlistCaption: string;
    public watchlistAbbreviatedDescription: string;
    public watchListFullDescription: string;

    private readonly _toastNgService = inject(ToastNgService);

    private readonly _symbolEditComponentSignal = viewChild.required<DataIvemIdSelectNgComponent>('symbolInput');
    private readonly _symbolButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('symbolButton');
    private readonly _deleteButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('deleteButton');
    private readonly _newButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('newButton');
    private readonly _openButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('openButton');
    private readonly _saveButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('saveButton');
    private readonly _columnsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('columnsButton');
    private readonly _autoSizeColumnWidthsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('autoSizeColumnWidthsButton');
    private readonly _symbolLinkButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('symbolLinkButton');
    private readonly _watchlistComponentSignal = viewChild.required<WatchlistNgComponent>('gridSource');
    private readonly _dialogContainerSignal = viewChild.required('dialogContainer', { read: ViewContainerRef });

    private readonly _symbolEditUiAction: DataIvemIdUiAction;
    private readonly _symbolApplyUiAction: IconButtonUiAction;
    private readonly _deleteSymbolUiAction: IconButtonUiAction;
    private readonly _newUiAction: IconButtonUiAction;
    private readonly _openUiAction: IconButtonUiAction;
    private readonly _saveUiAction: IconButtonUiAction;
    private readonly _favouriteLayoutsUiAction: MappedListSelectItemsUiAction<RevReferenceableColumnLayoutDefinition>;
    private readonly _columnsUiAction: IconButtonUiAction;
    private readonly _autoSizeColumnWidthsUiAction: IconButtonUiAction;
    private readonly _toggleSymbolLinkingUiAction: IconButtonUiAction;

    private readonly _marketsService: MarketsService;
    private readonly _frame: WatchlistDitemFrame;

    private _symbolEditComponent: DataIvemIdSelectNgComponent;
    private _symbolButtonComponent: SvgButtonNgComponent;
    private _deleteButtonComponent: SvgButtonNgComponent;
    private _newButtonComponent: SvgButtonNgComponent;
    private _openButtonComponent: SvgButtonNgComponent;
    private _saveButtonComponent: SvgButtonNgComponent;
    private _columnsButtonComponent: SvgButtonNgComponent;
    private _autoSizeColumnWidthsButtonComponent: SvgButtonNgComponent;
    private _symbolLinkButtonComponent: SvgButtonNgComponent;
    private _watchlistComponent: WatchlistNgComponent;
    private _dialogContainer: ViewContainerRef;

    private _layoutEditorComponent: NameableColumnLayoutEditorDialogNgComponent | undefined;

    private _modeId = WatchlistDitemNgComponent.ModeId.Input;
    private _forceOnNextCommit = false;

    constructor() {
        super(++WatchlistDitemNgComponent.typeInstanceCreateCount);

        const settingsNgService = inject(SettingsNgService);
        const marketsNgService = inject(MarketsNgService);
        const desktopAccessNgService = inject(DesktopAccessNgService);
        const symbolsNgService = inject(SymbolsNgService);
        const adiNgService = inject(AdiNgService);
        const textFormatterNgService = inject(TextFormatterNgService);
        const favouriteNamedColumnLayoutDefinitionReferencesNgService = inject(FavouriteReferenceableColumnLayoutDefinitionsStoreNgService);

        this._marketsService = marketsNgService.service;

        this._frame = new WatchlistDitemFrame(
            this,
            settingsNgService.service,
            this._marketsService,
            this.commandRegisterService,
            desktopAccessNgService.service,
            symbolsNgService.service,
            adiNgService.service,
            textFormatterNgService.service,
            favouriteNamedColumnLayoutDefinitionReferencesNgService.service,
            this._toastNgService.service,
            (rankedDataIvemIdList, rankedDataIvemIdListName) => this.handleGridSourceOpenedEvent(
                rankedDataIvemIdList,
                rankedDataIvemIdListName
            ),
            (newRecordIndex) => this.handleRecordFocusedEvent(newRecordIndex),
            (layout) => this.handleColumnLayoutSetEvent(layout),
            (dataIvemId) => this.handleDataIvemIdAcceptedEvent(dataIvemId),
        );
        this._symbolEditUiAction = this.createSymbolEditUiAction();
        this._symbolApplyUiAction = this.createSymbolApplyUiAction();
        this._deleteSymbolUiAction = this.createDeleteSymbolUiAction();
        this._newUiAction = this.createNewUiAction();
        this._openUiAction = this.createOpenUiAction();
        this._saveUiAction = this.createSaveUiAction();
        this._columnsUiAction = this.createColumnsUiAction();
        this._autoSizeColumnWidthsUiAction = this.createAutoSizeColumnWidthsUiAction();
        this._toggleSymbolLinkingUiAction = this.createToggleSymbolLinkingUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());

        if (this._frame.dataIvemId !== undefined) {
            this._forceOnNextCommit = true;
        }

        this.pushSymbol();
        this.pushSymbolLinkSelectState();
    }

    get ditemFrame() { return this._frame; }

    protected get stateSchemaVersion() { return WatchlistDitemNgComponent.stateSchemaVersion; }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._symbolEditComponent = this._symbolEditComponentSignal();
        this._symbolButtonComponent = this._symbolButtonComponentSignal();
        this._deleteButtonComponent = this._deleteButtonComponentSignal();
        this._newButtonComponent = this._newButtonComponentSignal();
        this._openButtonComponent = this._openButtonComponentSignal();
        this._saveButtonComponent = this._saveButtonComponentSignal();
        this._columnsButtonComponent = this._columnsButtonComponentSignal();
        this._autoSizeColumnWidthsButtonComponent = this._autoSizeColumnWidthsButtonComponentSignal();
        this._symbolLinkButtonComponent = this._symbolLinkButtonComponentSignal();
        this._watchlistComponent = this._watchlistComponentSignal();
        this._dialogContainer = this._dialogContainerSignal();

        delay1Tick(() => this.initialise());
    }

    public isInputMode() {
        return this._modeId === WatchlistDitemNgComponent.ModeId.Input;
    }

    public isDialogMode() {
        switch (this._modeId) {
            case WatchlistDitemNgComponent.ModeId.LayoutDialog:
            case WatchlistDitemNgComponent.ModeId.OpenDialog:
            case WatchlistDitemNgComponent.ModeId.SaveDialog:
                return true;
            case WatchlistDitemNgComponent.ModeId.Input:
                return false;
            default:
                throw new UnreachableCaseError('WDNCISM65311', this._modeId);
        }
    }

    public isOpenDialogMode() {
        return this._modeId === WatchlistDitemNgComponent.ModeId.OpenDialog;
    }

    public isSaveDialogMode() {
        return this._modeId === WatchlistDitemNgComponent.ModeId.SaveDialog;
    }

    public getStatusText(): string | undefined {
        // TODO:MED Will need to get the status.
        // return OverallStatus.toDisplay(this._itemFrame.overallStatus);
        return undefined;
    }

    public override processSymbolLinkedChanged() {
        this.pushSymbolLinkSelectState();
    }

    protected override initialise() {
        const componentStateElement = this.getInitialComponentStateJsonElement();
        const frameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        this._frame.initialise(frameElement, this._watchlistComponent.frame);

        this._symbolEditComponent.focus();

        this.pushDeleteButtonState(this._frame.recordFocused);

        this.initialiseComponents();

        super.initialise();
    }

    protected override finalise() {
        this._symbolEditUiAction.finalise();
        this._symbolApplyUiAction.finalise();
        this._deleteSymbolUiAction.finalise();
        this._newUiAction.finalise();
        this._openUiAction.finalise();
        this._saveUiAction.finalise();
        this._columnsUiAction.finalise();
        this._autoSizeColumnWidthsUiAction.finalise();
        this._toggleSymbolLinkingUiAction.finalise();

        this._frame.finalise();
        super.finalise();
    }

    protected constructLoad(element: JsonElement | undefined) {
        const frameElement = this.tryGetChildFrameJsonElement(element);
        this._frame.constructLoad(frameElement);
    }

    protected save(element: JsonElement) {
        const frameElement = this.createChildFrameJsonElement(element);
        this._frame.save(frameElement);
    }

    private handleRecordFocusedEvent(currentRecordIndex: Integer | undefined) {
        this.pushDeleteButtonState(currentRecordIndex !== undefined);
    }

    private handleSymbolCommitEvent(typeId: UiAction.CommitTypeId) {
        this.commitSymbol(typeId);
    }

    private handleSymbolInputEvent() {
        if (this._symbolEditUiAction.inputtedText === '') {
            this._symbolApplyUiAction.pushDisabled();
        } else {
            // if (!this._symbolEditUiAction.inputtedParseDetails.success) {
            //     this._symbolApplyUiAction.pushDisabled();
            // } else {
            //     if (this._symbolEditUiAction.isInputtedSameAsCommitted()) {
            //         this._symbolApplyUiAction.pushDisabled();
            //     } else {
                    this._symbolApplyUiAction.pushUnselected();
            //     }
            // }
        }
    }

    private handleSymbolApplyUiActionSignalEvent() {
        this.commitSymbol(UiAction.CommitTypeId.Explicit);
    }

    private handleDeleteSymbolUiActionEvent() {
        this._frame.deleteFocusedRecord();
    }

    private handleNewUiActionSignalEvent(downKeys: ModifierKey.IdSet) {
        const keepView = ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Shift);
        const openPromise = this._frame.newEmpty(keepView);
        openPromise.then(
            (result) => {
                if (result.isErr()) {
                    this._toastNgService.popup(`${Strings[StringId.ErrorCreatingNew]} ${Strings[StringId.Watchlist]}: ${result.error}`);
                }
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'WDNCHNUASE44432') }
        );
    }

    private handleOpenUiActionSignalEvent() {
        this.showOpenDialog();
    }

    private handleSaveUiActionEvent() {
        this.showSaveDialog();
    }

    private handleColumnsUiActionSignalEvent() {
        this.showLayoutEditor();
    }

    private handleAutoSizeColumnWidthsUiActionSignalEvent(_signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        const widenOnly = ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Shift);
        this._frame.autoSizeAllColumnWidths(widenOnly);
    }

    private handleSymbolLinkUiActionSignalEvent() {
        this._frame.dataIvemIdLinked = !this._frame.dataIvemIdLinked;
    }

    private handleGridSourceOpenedEvent(rankedDataIvemIdList: RankedDataIvemIdList, rankedDataIvemIdListName: string | undefined) {
        this.watchlistCaption = Strings[StringId.Watchlist];
        const baseTabDisplay = this._frame.baseTabDisplay;
        let tabTitle: string;
        if (rankedDataIvemIdListName === undefined) {
            tabTitle = baseTabDisplay;
            this.watchlistAbbreviatedDescription = '';
            this.watchListFullDescription = Strings[StringId.RankedDataIvemIdListDisplay_DataIvemIdArray];
        } else {
            tabTitle = `${baseTabDisplay} ${rankedDataIvemIdListName}`;
            const typeId = rankedDataIvemIdList.typeId;
            this.watchlistAbbreviatedDescription = `${rankedDataIvemIdListName} (${RankedDataIvemIdListDefinition.Type.idToAbbreviation(typeId)})`;
            this.watchListFullDescription = `${rankedDataIvemIdListName} (${RankedDataIvemIdListDefinition.Type.idToDisplay(typeId)})`;
        }
        this.setTitle(tabTitle, rankedDataIvemIdListName);
        this.markForCheck();
    }

    private handleDataIvemIdAcceptedEvent(dataIvemId: DataIvemId) {
        this._symbolEditUiAction.pushValue(dataIvemId);
        this._symbolApplyUiAction.pushDisabled();
    }

    private handleColumnLayoutSetEvent(layout: RevColumnLayout) {
        // not implemented
    }

    private createSymbolEditUiAction() {
        const action = new DataIvemIdUiAction(this._marketsService.dataMarkets);
        action.valueRequired = false;
        action.pushTitle(Strings[StringId.SymbolInputTitle]);
        action.commitEvent = (typeId) => this.handleSymbolCommitEvent(typeId);
        action.inputEvent = () => this.handleSymbolInputEvent();
        return action;
    }

    private createSymbolApplyUiAction() {
        const commandName = InternalCommand.Id.ApplySymbol;
        const displayId = StringId.ApplySymbolCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.Watchlist_SymbolButtonTitle]);
        action.pushIcon(IconButtonUiAction.IconId.Execute);
        action.pushDisabled();
        action.signalEvent = () => this.handleSymbolApplyUiActionSignalEvent();
        return action;
    }

    private createDeleteSymbolUiAction() {
        const commandName = InternalCommand.Id.Watchlist_DeleteSymbol;
        const displayId = StringId.Watchlist_DeleteSymbolCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.Watchlist_DeleteSymbolTitle]);
        action.pushIcon(IconButtonUiAction.IconId.RemoveSelectedFromList);
        action.signalEvent = () => this.handleDeleteSymbolUiActionEvent();
        return action;
    }

    private createNewUiAction() {
        const commandName = InternalCommand.Id.Watchlist_New;
        const displayId = StringId.Watchlist_NewCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.Watchlist_NewTitle]);
        action.pushIcon(IconButtonUiAction.IconId.NewWatchlist);
        action.pushUnselected();
        action.signalEvent = (signalTypeId) => this.handleNewUiActionSignalEvent(signalTypeId);
        return action;
    }

    private createOpenUiAction() {
        const commandName = InternalCommand.Id.Watchlist_Open;
        const displayId = StringId.Watchlist_OpenCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.Watchlist_OpenTitle]);
        action.pushIcon(IconButtonUiAction.IconId.OpenWatchlist);
        action.pushUnselected();
        action.signalEvent = () => this.handleOpenUiActionSignalEvent();
        return action;
    }

    private createSaveUiAction() {
        const commandName = InternalCommand.Id.Watchlist_Save;
        const displayId = StringId.Watchlist_SaveCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.Watchlist_SaveTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SaveWatchlist);
        action.pushUnselected();
        action.signalEvent = () => this.handleSaveUiActionEvent();
        return action;
    }

    private createColumnsUiAction() {
        const commandName = InternalCommand.Id.SelectGridColumns;
        const displayId = StringId.SelectColumnsCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.SelectColumnsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SelectColumns);
        action.pushUnselected();
        action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }

    private createAutoSizeColumnWidthsUiAction() {
        const commandName = InternalCommand.Id.AutoSizeGridColumnWidths;
        const displayId = StringId.AutoSizeColumnWidthsCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.AutoSizeColumnWidthsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.AutoSizeColumnWidths);
        action.pushUnselected();
        action.signalEvent = (signalTypeId, downKeys) => this.handleAutoSizeColumnWidthsUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private createToggleSymbolLinkingUiAction() {
        const commandName = InternalCommand.Id.ToggleSymbolLinking;
        const displayId = StringId.ToggleSymbolLinkingCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ToggleSymbolLinkingTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SymbolLink);
        action.signalEvent = () => this.handleSymbolLinkUiActionSignalEvent();
        return action;
    }

    private showOpenDialog() {
        this._modeId = WatchlistDitemNgComponent.ModeId.OpenDialog;

        const closePromise = OpenWatchlistDialogNgComponent.open(
            this._dialogContainer,
            this._frame.opener,
            Strings[StringId.Watchlist_OpenDialogCaption],
        );
        closePromise.then(
            (closeResult) => {
                this.closeDialog();
                if (closeResult.isErr()) {
                    this._toastNgService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.Scan]}: ${closeResult.error}`);
                } else {
                    const scanId = closeResult.value;
                    if (scanId !== undefined) {
                        const newPromise = this._frame.newScan(scanId, true);
                        newPromise.then(
                            (newResult) => {
                                if (newResult.isErr()) {
                                    this._toastNgService.popup(`${Strings[StringId.ErrorCreatingNew]} ${Strings[StringId.Scan]}: ${newResult.error}`);
                                }
                            },
                            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'WDNCSODN32223', this._frame.opener.lockerName); }
                        );
                    }
                }
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'WDNCSODO32223', this._frame.opener.lockerName); }
        );

        this.markForCheck();
    }

    private showSaveDialog() {
        this._modeId = WatchlistDitemNgComponent.ModeId.SaveDialog;

        const closePromise = SaveWatchlistDialogNgComponent.open(
            this._dialogContainer,
            this._frame.opener,
            Strings[StringId.Watchlist_SaveDialogCaption],
        );
        closePromise.then(
            (saveAsDefinition) => {
                if (saveAsDefinition !== undefined) {
                    this._frame.saveGridSourceAs(saveAsDefinition);
                    this.closeDialog();
                }
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'WDNCSOD32223', this._frame.opener.lockerName); }
        );

        this.markForCheck();
    }

    private showLayoutEditor() {
        this._modeId = WatchlistDitemNgComponent.ModeId.LayoutDialog;
        const allowedSourcedFieldsColumnLayoutDefinition = this._frame.createAllowedSourcedFieldsColumnLayoutDefinition();

        const closePromise = NameableColumnLayoutEditorDialogNgComponent.open(
            this._dialogContainer,
            this._frame.opener,
            Strings[StringId.Watchlist_ColumnsDialogCaption],
            allowedSourcedFieldsColumnLayoutDefinition
        );
        closePromise.then(
            (layoutOrReferenceDefinition) => {
                if (layoutOrReferenceDefinition !== undefined) {
                    const openPromise = this._frame.tryOpenColumnLayoutOrReferenceDefinition(layoutOrReferenceDefinition);
                    openPromise.then(
                        (openResult) => {
                            if (openResult.isErr()) {
                                const error = ColumnLayoutOrReference.formatError(openResult.error);
                                this._toastNgService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.Watchlist]} ${Strings[StringId.ColumnLayout]}: ${error}`);
                            }
                        },
                        (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'SSDNCSLECPOP68823'); }
                    );
                }
                this.closeDialog();
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'WDNCSLE32223', this._frame.opener.lockerName); }
        );

        this.markForCheck();
    }

    private closeDialog() {
        this._dialogContainer.clear();
        this._modeId = WatchlistDitemNgComponent.ModeId.Input;
        this.markForCheck();
    }

    private pushDeleteButtonState(isRecordFocused: boolean) {
        if (!isRecordFocused) {
            this._deleteSymbolUiAction.pushDisabled();
        } else {
            if (this._frame.canDeleteRecord()) {
                this._deleteSymbolUiAction.pushUnselected();
            } else {
                this._deleteSymbolUiAction.pushDisabled();
            }
        }
    }

    private initialiseComponents() {
        this._symbolEditComponent.initialise(this._symbolEditUiAction);
        this._symbolButtonComponent.initialise(this._symbolApplyUiAction);
        this._deleteButtonComponent.initialise(this._deleteSymbolUiAction);
        this._newButtonComponent.initialise(this._newUiAction);
        this._openButtonComponent.initialise(this._openUiAction);
        this._saveButtonComponent.initialise(this._saveUiAction);
        this._columnsButtonComponent.initialise(this._columnsUiAction);
        this._autoSizeColumnWidthsButtonComponent.initialise(this._autoSizeColumnWidthsUiAction);
        this._symbolLinkButtonComponent.initialise(this._toggleSymbolLinkingUiAction);
    }

    private pushSymbol() {
        this._symbolEditUiAction.pushValue(this._frame.dataIvemId);
    }

    private pushSymbolLinkSelectState() {
        if (this._frame.dataIvemIdLinked) {
            this._toggleSymbolLinkingUiAction.pushSelected();
        } else {
            this._toggleSymbolLinkingUiAction.pushUnselected();
        }
    }

    private commitSymbol(typeId: UiAction.CommitTypeId) {
        const dataIvemId = this._symbolEditUiAction.value;
        if (dataIvemId !== undefined) {
            this._frame.setDataIvemIdFromDitem(dataIvemId, this._forceOnNextCommit);
            this._forceOnNextCommit = false;
        }
    }
}

export namespace WatchlistDitemNgComponent {
    export const stateSchemaVersion = '2';

    export const enum ModeId {
        Input,
        LayoutDialog,
        OpenDialog,
        SaveDialog,
    }
}
