import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, ViewContainerRef, inject, viewChild } from '@angular/core';
import { AssertInternalError, JsonElement, ModifierKey, ModifierKeyId, delay1Tick } from '@pbkware/js-utils';
import { DateUiAction, UiAction } from '@pbkware/ui-action';
import {
    DataIvemId,
    DataIvemIdUiAction,
    IconButtonUiAction,
    InternalCommand,
    MarketsService, StringId,
    Strings,
    assert,
    assigned
} from '@plxtra/motif-core';
import { AdiNgService, MarketsNgService, SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import { ColumnLayoutDialogNgComponent, TradesNgComponent } from 'content-ng-api';
import { DataIvemIdSelectNgComponent, DateInputNgComponent, SvgButtonNgComponent } from 'controls-ng-api';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { TradesDitemFrame } from '../trades-ditem-frame';

@Component({
    selector: 'app-trades-ditem',
    templateUrl: './trades-ditem-ng.component.html',
    styleUrls: ['./trades-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class TradesDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements OnDestroy, AfterViewInit, TradesDitemFrame.ComponentAccess {
    private static typeInstanceCreateCount = 0;

    public isDialogVisible = false;

    private readonly _symbolEditComponentSignal = viewChild.required<DataIvemIdSelectNgComponent>('symbolInput');
    private readonly _symbolButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('symbolButton');
    private readonly _symbolLinkButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('symbolLinkButton');
    private readonly _historicalDateInputSignal = viewChild.required<DateInputNgComponent>('historicalDateInput');
    private readonly _columnsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('columnsButton');
    private readonly _autoSizeColumnWidthsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('autoSizeColumnWidthsButton');
    private readonly _contentComponentSignal = viewChild.required<TradesNgComponent>('tradesContent');
    private readonly _dialogContainerSignal = viewChild.required('dialogContainer', { read: ViewContainerRef });

    // public statusText: string | undefined;
    private readonly _marketsService: MarketsService;

    private readonly _symbolEditUiAction: DataIvemIdUiAction;
    private readonly _symbolApplyUiAction: IconButtonUiAction;
    private readonly _toggleSymbolLinkingUiAction: IconButtonUiAction;
    private readonly _historicalDateUiAction: DateUiAction;
    private readonly _autoSizeColumnWidthsUiAction: IconButtonUiAction;
    private readonly _columnsUiAction: IconButtonUiAction;

    private readonly _frame: TradesDitemFrame;

    private _symbolEditComponent: DataIvemIdSelectNgComponent;
    private _symbolButtonComponent: SvgButtonNgComponent;
    private _symbolLinkButtonComponent: SvgButtonNgComponent;
    private _historicalDateInput: DateInputNgComponent;
    private _columnsButtonComponent: SvgButtonNgComponent;
    private _autoSizeColumnWidthsButtonComponent: SvgButtonNgComponent;
    private _contentComponent: TradesNgComponent;
    private _dialogContainer: ViewContainerRef;

    constructor() {
        super(++TradesDitemNgComponent.typeInstanceCreateCount);

        const settingsNgService = inject(SettingsNgService);
        const marketsNgService = inject(MarketsNgService);
        const desktopAccessNgService = inject(DesktopAccessNgService);
        const symbolsNgService = inject(SymbolsNgService);
        const adiNgService = inject(AdiNgService);

        this._marketsService = marketsNgService.service;

        this._frame = new TradesDitemFrame(this, settingsNgService.service, this._marketsService, this.commandRegisterService,
            desktopAccessNgService.service, symbolsNgService.service, adiNgService.service);

        this._symbolEditUiAction = this.createSymbolEditUiAction();
        this._symbolApplyUiAction = this.createSymbolApplyUiAction();
        this._toggleSymbolLinkingUiAction = this.createToggleSymbolLinkingUiAction();
        this._historicalDateUiAction = this.createHistoricalDateUiAction();
        this._autoSizeColumnWidthsUiAction = this.createAutoSizeColumnWidthsUiAction();
        this._columnsUiAction = this.createColumnsUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());

        this.pushSymbol(this._frame.dataIvemId);
        this.pushSymbolLinkButtonState();
    }

    get ditemFrame() { return this._frame; }
    protected get stateSchemaVersion() { return TradesDitemNgComponent.stateSchemaVersion; }

    public ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._symbolEditComponent = this._symbolEditComponentSignal();
        this._symbolButtonComponent = this._symbolButtonComponentSignal();
        this._symbolLinkButtonComponent = this._symbolLinkButtonComponentSignal();
        this._historicalDateInput = this._historicalDateInputSignal();
        this._columnsButtonComponent = this._columnsButtonComponentSignal();
        this._autoSizeColumnWidthsButtonComponent = this._autoSizeColumnWidthsButtonComponentSignal();
        this._contentComponent = this._contentComponentSignal();
        this._dialogContainer = this._dialogContainerSignal();

        delay1Tick(() => this.initialise());
    }

    autoSizeAllColumnWidths() {
        this._frame.autoSizeAllColumnWidths(true);
    }

    // TradesDitemFrame.ComponentAccess methods
    public getHistoricalDate() {
        return this._historicalDateUiAction.value;
    }

    public pushSymbol(dataIvemId: DataIvemId | undefined) {
        this._symbolEditUiAction.pushValue(dataIvemId);
    }

    public notifyOpenedClosed(dataIvemId: DataIvemId | undefined, historicalDate: Date | undefined) {
        this.pushSymbol(dataIvemId);
        this.pushHistoricalDate(historicalDate);
        this._symbolApplyUiAction.pushDisabled();
        this.pushAccepted();
    }

    public override processSymbolLinkedChanged() {
        this.pushSymbolLinkButtonState();
    }

    protected override initialise() {
        assert(assigned(this._contentComponent), 'ID:4817161157');

        const componentStateElement = this.getInitialComponentStateJsonElement();
        const ditemFrameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        let tradesFrameElement: JsonElement | undefined;
        if (ditemFrameElement !== undefined) {
            const tradesFrameElementResult = ditemFrameElement.tryGetElement(TradesDitemFrame.JsonName.tradesFrame);
            if (tradesFrameElementResult.isOk()) {
                tradesFrameElement = tradesFrameElementResult.value;
            }
        }
        this._frame.initialise(tradesFrameElement, this._contentComponent.frame);

        this.initialiseComponents();

        super.initialise();
    }

    protected override finalise() {
        this._symbolEditUiAction.finalise();
        this._symbolApplyUiAction.finalise();
        this._toggleSymbolLinkingUiAction.finalise();
        this._historicalDateUiAction.finalise();
        this._autoSizeColumnWidthsUiAction.finalise();
        this._columnsUiAction.finalise();

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

    private handleSymbolCommitEvent() {
        this.commitSymbol();
    }

    private handleSymbolInputEvent() {
        if (this._symbolEditUiAction.inputtedText === '') {
            this._symbolApplyUiAction.pushDisabled();
        } else {
/*            if (!this._symbolEditUiAction.inputtedParseDetails.success) {
                this._symbolApplyUiAction.pushDisabled();
            } else {
                if (this._symbolEditUiAction.isInputtedSameAsCommitted()) {
                    this._symbolApplyUiAction.pushDisabled();
                } else {*/
                    this._symbolApplyUiAction.pushUnselected();
                // }
        //     }
        }
    }

    private handleSymbolLinkUiActionSignalEvent() {
        this._frame.dataIvemIdLinked = !this._frame.dataIvemIdLinked;
    }

    private handleSymbolApplyUiActionSignalEvent() {
        this.commitSymbol();
    }

    private handleHistoricalDateCommitEvent() {
        this._frame.historicalDateCommit();
        // this.pushValid();
    }

    private handleAutoSizeColumnWidthsUiActionSignalEvent(_signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        const widenOnly = ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Shift);
        this._frame.autoSizeAllColumnWidths(widenOnly);
    }

    private handleColumnsUiActionSignalEvent() {
        const dialogPromise = this.showColumnLayoutDialog();
        AssertInternalError.throwErrorIfPromiseRejected(dialogPromise, 'TDNCHCUASE34009');
    }

    private createSymbolEditUiAction() {
        const action = new DataIvemIdUiAction(this._marketsService.dataMarkets);
        action.valueRequired = false;
        action.pushTitle(Strings[StringId.SymbolInputTitle]);
        action.commitEvent = () => this.handleSymbolCommitEvent();
        action.inputEvent = () => this.handleSymbolInputEvent();
        return action;
    }

    private createSymbolApplyUiAction() {
        const commandName = InternalCommand.Id.ApplySymbol;
        const displayId = StringId.ApplySymbolCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ApplySymbolTitle]);
        action.pushIcon(IconButtonUiAction.IconId.Execute);
        action.pushDisabled();
        action.signalEvent = () => this.handleSymbolApplyUiActionSignalEvent();
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

    private createHistoricalDateUiAction() {
        const action = new DateUiAction();
        action.valueRequired = false;
        action.commitEvent = () => this.handleHistoricalDateCommitEvent();
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


    private initialiseComponents() {
        this._symbolEditComponent.initialise(this._symbolEditUiAction);
        this._symbolButtonComponent.initialise(this._symbolApplyUiAction);
        this._symbolLinkButtonComponent.initialise(this._toggleSymbolLinkingUiAction);
        this._historicalDateInput.initialise(this._historicalDateUiAction);
        this._autoSizeColumnWidthsButtonComponent.initialise(this._autoSizeColumnWidthsUiAction);
        this._columnsButtonComponent.initialise(this._columnsUiAction);

        this._frame.open();
    }

    private commitSymbol() {
        const dataIvemId = this._symbolEditUiAction.value;
        if (dataIvemId !== undefined) {
            this._frame.setDataIvemIdFromDitem(dataIvemId);
        }
        // this.pushValid();
    }

    private pushHistoricalDate(value: Date | undefined) {
        this._historicalDateUiAction.pushValue(value);
    }

    private pushAccepted() {
        this._symbolApplyUiAction.pushAccepted();
        this._historicalDateUiAction.pushAccepted();
    }

    // private pushValid() {
    //     this._symbolApplyUiAction.pushValid();
    //     this._historicalDateUiAction.pushValid();
    // }

    private pushSymbolLinkButtonState() {
        if (this._frame.dataIvemIdLinked) {
            this._toggleSymbolLinkingUiAction.pushSelected();
        } else {
            this._toggleSymbolLinkingUiAction.pushUnselected();
        }
    }

    private async showColumnLayoutDialog() {
        const allowedSourcedFieldsColumnLayoutDefinition = this._frame.createAllowedSourcedFieldsColumnLayoutDefinition();

        if (allowedSourcedFieldsColumnLayoutDefinition !== undefined) {
            const component = ColumnLayoutDialogNgComponent.create(
                this._dialogContainer,
                this._frame.opener,
                Strings[StringId.Trades_ColumnsDialogCaption],
                allowedSourcedFieldsColumnLayoutDefinition,
            );

            this.isDialogVisible = true;
            this.markForCheck();

            const newLayoutDefinition = await component.waitClose();
            if (newLayoutDefinition !== undefined) {
                this._frame.applyColumnLayoutDefinition(newLayoutDefinition);
            }

            this.closeLayoutEditor();
        }
    }

    private closeLayoutEditor() {
        this._dialogContainer.clear();
        this.isDialogVisible = false;
        this.markForCheck();
    }
}

export namespace TradesDitemNgComponent {
    export const stateSchemaVersion = '2';
}
