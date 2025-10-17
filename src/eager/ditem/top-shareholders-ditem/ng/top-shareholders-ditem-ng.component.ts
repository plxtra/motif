import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy, viewChild } from '@angular/core';
import {
    delay1Tick,
    EnumInfoOutOfOrderError,
    Integer,
    JsonElement,
    UnexpectedCaseError,
    UnreachableCaseError
} from '@pbkware/js-utils';
import { DateUiAction, UiAction } from '@pbkware/ui-action';
import {
    assert,
    assigned,
    DataIvemId,
    IconButtonUiAction,
    InternalCommand,
    IvemId,
    IvemIdUiAction,
    MarketsService,
    StringId,
    Strings,
    ZenithProtocolCommon
} from '@plxtra/motif-core';
import {
    AdiNgService,
    MarketsNgService,
    SymbolsNgService,
    ToastNgService
} from 'component-services-ng-api';
import { GridSourceNgDirective, LegacyTableRecordSourceDefinitionFactoryNgService } from 'content-ng-api';
import { DateInputNgComponent, IvemIdInputNgComponent, SvgButtonNgComponent } from 'controls-ng-api';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { TopShareholdersDitemFrame } from '../top-shareholders-ditem-frame';
import { IvemIdInputNgComponent as IvemIdInputNgComponent_1 } from '../../../controls/ivem-id/ivem-id-input/ng/ivem-id-input-ng.component';
import { SvgButtonNgComponent as SvgButtonNgComponent_1 } from '../../../controls/boolean/button/icon/svg-button/ng/svg-button-ng.component';
import { DateInputNgComponent as DateInputNgComponent_1 } from '../../../controls/date/date-input/ng/date-input-ng.component';

@Component({
    selector: 'app-top-shareholders-ditem',
    templateUrl: './top-shareholders-ditem-ng.component.html',
    styleUrls: ['./top-shareholders-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IvemIdInputNgComponent_1, SvgButtonNgComponent_1, DateInputNgComponent_1]
})
export class TopShareholdersDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements OnDestroy, AfterViewInit, TopShareholdersDitemFrame.ComponentAccess {
    private static typeInstanceCreateCount = 0;

    public caption = '';
    public details: TopShareholdersDitemNgComponent.Details = {
        symbolText: '',
        name: '',
        class: '',
    };
    public statusText: string | undefined;
    public detailsModeActive = false;
    public historicalOrCompareModeActive = false;
    public compareModeActive = false;

    private readonly _symbolsNgService = inject(SymbolsNgService);

    private readonly _todayModeButtonInputComponentSignal = viewChild.required<SvgButtonNgComponent>('todayModeButton');
    private readonly _historicalModeButtonInputComponentSignal = viewChild.required<SvgButtonNgComponent>('historicalModeButton');
    private readonly _compareModeButtonInputComponentSignal = viewChild.required<SvgButtonNgComponent>('compareModeButton');
    private readonly _detailsModeButtonInputComponentSignal = viewChild.required<SvgButtonNgComponent>('detailsModeButton');
    private readonly _historyCompareButtonInputComponentSignal = viewChild.required<SvgButtonNgComponent>('historyCompareButton');
    private readonly _contentComponentSignal = viewChild.required<GridSourceNgDirective>('topShareholdersTableContent');
    private readonly _symbolEditComponentSignal = viewChild.required<IvemIdInputNgComponent>('symbolInput');
    private readonly _historicalDateInputComponentSignal = viewChild.required<DateInputNgComponent>('historicalDateInput');
    private readonly _compareDateInputComponentSignal = viewChild.required<DateInputNgComponent>('compareDateInput');
    private readonly _symbolLinkButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('symbolLinkButton');

    private readonly _toggleSymbolLinkingButtonUiAction: IconButtonUiAction;
    private readonly _todayModeUiAction: IconButtonUiAction;
    private readonly _historicalModeUiAction: IconButtonUiAction;
    private readonly _compareModeUiAction: IconButtonUiAction;
    private readonly _detailsModeUiAction: IconButtonUiAction;
    private readonly _historyCompareUiAction: IconButtonUiAction;
    private readonly _symbolUiAction: IvemIdUiAction;
    private readonly _historicalDateUiAction: DateUiAction;
    private readonly _compareDateUiAction: DateUiAction;

    private readonly _frame: TopShareholdersDitemFrame;

    private readonly _marketsService: MarketsService;

    private _todayModeButtonInputComponent: SvgButtonNgComponent;
    private _historicalModeButtonInputComponent: SvgButtonNgComponent;
    private _compareModeButtonInputComponent: SvgButtonNgComponent;
    private _detailsModeButtonInputComponent: SvgButtonNgComponent;
    private _historyCompareButtonInputComponent: SvgButtonNgComponent;
    private _contentComponent: GridSourceNgDirective;
    private _symbolEditComponent: IvemIdInputNgComponent;
    private _historicalDateInputComponent: DateInputNgComponent;
    private _compareDateInputComponent: DateInputNgComponent;
    private _symbolLinkButtonComponent: SvgButtonNgComponent;

    private _tableUiAccepted = true;

    private _forceNextSymbolCommit = false;

    private _modeId: TopShareholdersDitemNgComponent.ModeId;

    constructor() {
        super(++TopShareholdersDitemNgComponent.typeInstanceCreateCount);

        const marketsNgService = inject(MarketsNgService);
        const desktopAccessNgService = inject(DesktopAccessNgService);
        const adiNgService = inject(AdiNgService);
        const tableRecordSourceDefinitionFactoryNgService = inject(LegacyTableRecordSourceDefinitionFactoryNgService);
        const toastNgService = inject(ToastNgService);

        this._marketsService = marketsNgService.service;

        this._frame = new TopShareholdersDitemFrame(
            this,
            this.settingsService,
            this._marketsService,
            this.commandRegisterService,
            desktopAccessNgService.service,
            this._symbolsNgService.service,
            adiNgService.service,
            tableRecordSourceDefinitionFactoryNgService.service,
            toastNgService.service,
        );

        this._toggleSymbolLinkingButtonUiAction = this.createToggleSymbolLinkingButtonUiAction();
        this._todayModeUiAction = this.createTodayModeUiAction();
        this._historicalModeUiAction = this.createHistoricalModeUiAction();
        this._compareModeUiAction = this.createCompareModeUiAction();
        this._detailsModeUiAction = this.createDetailsModeUiAction();
        this._historyCompareUiAction = this.createHistoryCompareUiAction();
        this._symbolUiAction = this.createSymbolUiAction();
        this._historicalDateUiAction = this.createHistoricalDateUiAction();
        this._compareDateUiAction = this.createCompareDateUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());

        this.pushSymbol();
        if (this._symbolUiAction.value !== undefined) {
            this._forceNextSymbolCommit = true;
        }
        this.pushSymbolLinkButtonState();
        this.pushHistoryCompareButtonTitle();
        this.pushHistoryCompareButtonState();
    }

    get ditemFrame() { return this._frame; }
    protected get stateSchemaVersion() { return TopShareholdersDitemNgComponent.stateSchemaVersion; }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._todayModeButtonInputComponent = this._todayModeButtonInputComponentSignal();
        this._historicalModeButtonInputComponent = this._historicalModeButtonInputComponentSignal();
        this._compareModeButtonInputComponent = this._compareModeButtonInputComponentSignal();
        this._detailsModeButtonInputComponent = this._detailsModeButtonInputComponentSignal();
        this._historyCompareButtonInputComponent = this._historyCompareButtonInputComponentSignal();
        this._contentComponent = this._contentComponentSignal();
        this._symbolEditComponent = this._symbolEditComponentSignal();
        this._historicalDateInputComponent = this._historicalDateInputComponentSignal();
        this._compareDateInputComponent = this._compareDateInputComponentSignal();
        this._symbolLinkButtonComponent = this._symbolLinkButtonComponentSignal();

        delay1Tick(() => this.initialise());
    }

    // Component Access methods

    public getGuiParams() {
        const result = new TopShareholdersDitemFrame.GuiParams();
        if (!this._symbolUiAction.isValueOk() ||
            this._symbolUiAction.value !== undefined && this._symbolUiAction.value.exchange.unenvironmentedZenithCode !== ZenithProtocolCommon.KnownExchange.Nzx as string ) {
            result.valid = false;
        } else {
            if (this._modeId === TopShareholdersDitemNgComponent.ModeId.Today) {
                result.valid = true;
            } else {
                if (!this._historicalDateUiAction.isValueOk()) {
                    result.valid = false;
                } else {
                    result.historicalDate = this._historicalDateUiAction.value;
                    if (this._modeId === TopShareholdersDitemNgComponent.ModeId.Historical) {
                        result.valid = true;
                    } else {
                        if (!this._compareDateUiAction.isValueOk()) {
                            result.valid = false;
                        } else {
                            result.compareDate = this._compareDateUiAction.value;
                            if (this._modeId === TopShareholdersDitemNgComponent.ModeId.Compare) {
                                result.valid = true;
                            } else {
                                result.valid = false;
                            }
                        }
                    }
                }
            }
        }

        return result;
    }

    public notifyNewTable(params: TopShareholdersDitemFrame.TableParams) {
        this._symbolUiAction.pushAccepted();
        this._historicalDateUiAction.pushAccepted();
        this._compareDateUiAction.pushAccepted();

        this.caption = this.calculateCaption(params.dataIvemId, params.historicalDate, params.compareDate);

        this.details.symbolText = this._symbolsNgService.dataIvemIdToDisplay(params.dataIvemId);
    }

    public canNewTableOnDataIvemIdApply() {
        return this._modeId === TopShareholdersDitemNgComponent.ModeId.Today;
    }

    public createLayoutConfig() {
        const element = new JsonElement();
        const jsonValue = TopShareholdersDitemNgComponent.Mode.idToJsonValue(this._modeId);
        element.setString(TopShareholdersDitemNgComponent.JsonName.modeId, jsonValue);
        /*if (this._symbolInputElement.isValid()) {
            element.setString(TopShareholdersInputComponent.jsonTag_Symbol, this._symbolInputElement.committedValu);
        }
        if (this._historicalDateInputElement.isValid()) {
            element.setDate(TopShareholdersInputComponent.jsonTag_HistoricalDate, this._historicalDateInputElement.committedValu);
        }
        if (this._compareDateInputElement.isValid()) {
            element.setDate(TopShareholdersInputComponent.jsonTag_CompareDate, this._compareDateInputElement.committedValu);
        }*/
        return element;
    }

    public override processSymbolLinkedChanged() {
        this.pushSymbolLinkButtonState();
    }

    protected override initialise() {
        assert(assigned(this._contentComponent), 'TSICAFI34429');

        const componentStateElement = this.getInitialComponentStateJsonElement();
        const frameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        this._frame.initialise(this._contentComponent.frame, frameElement);

        this.initialiseComponents();

        super.initialise();
    }

    protected override finalise() {
        this._toggleSymbolLinkingButtonUiAction.finalise();
        this._todayModeUiAction.finalise();
        this._historicalModeUiAction.finalise();
        this._compareModeUiAction.finalise();
        this._detailsModeUiAction.finalise();
        this._historyCompareUiAction.finalise();
        this._symbolUiAction.finalise();
        this._historicalDateUiAction.finalise();
        this._compareDateUiAction.finalise();

        this._frame.finalise();
        super.finalise();
    }

    protected constructLoad(element: JsonElement | undefined) {
        const frameElement = this.tryGetChildFrameJsonElement(element);
        this._frame.constructLoad(frameElement);

        if (element === undefined) {
            this.setModeId(TopShareholdersDitemNgComponent.defaultModeId);
        } else {
            let loadedModeId: TopShareholdersDitemNgComponent.ModeId;
            const modeIdJsonValueResult = element.tryGetString(TopShareholdersDitemNgComponent.JsonName.modeId);
            if (modeIdJsonValueResult.isErr()) {
                loadedModeId = TopShareholdersDitemNgComponent.defaultModeId;
            } else {
                const typedModeId = TopShareholdersDitemNgComponent.Mode.tryJsonValueToId(modeIdJsonValueResult.value);
                if (typedModeId === undefined) {
                    loadedModeId = TopShareholdersDitemNgComponent.defaultModeId;
                } else {
                    loadedModeId = typedModeId;
                }
            }
            this.setModeId(loadedModeId);

            /*const historicalJsonDateResult = element.tryGetDateType(TopShareholdersInputComponent.jsonTag_HistoricalDate);
            if (historicalJsonDate !== undefined) {
                this._historicalDateInputElement.setValue(historicalJsonDate);
            }

            const compareJsonDateResult = element.tryGetDateType(TopShareholdersInputComponent.jsonTag_CompareDate);
            if (compareJsonDate !== undefined) {
                this._historicalDateInputElement.setValue(compareJsonDate);
            }*/
        }
    }

    protected save(element: JsonElement) {
        const jsonValue = TopShareholdersDitemNgComponent.Mode.idToJsonValue(this._modeId);
        element.setString(TopShareholdersDitemNgComponent.JsonName.modeId, jsonValue);

        const frameElement = this.createChildFrameJsonElement(element);
        this._frame.save(frameElement);
    }

    private handleSymbolCommitEvent() {
        const ivemId = this._symbolUiAction.definedValue;
        const exchange = ivemId.exchange;
        if (exchange.unenvironmentedZenithCode !== ZenithProtocolCommon.KnownExchange.Nzx as string) {
            this._symbolUiAction.pushInvalid(Strings[StringId.TopShareholdersOnlySupportNzx]);
        } else {
            this._symbolUiAction.pushValidOrMissing();
            const  defaultLitMarket =  exchange.defaultLitMarket; // need to create DataIvemId to pass into DitemFrame
            if (defaultLitMarket === undefined) {
                this._symbolUiAction.pushInvalid(Strings[StringId.InvalidExchange]);
            } else {
                const dataIvemId = new DataIvemId(ivemId.code, defaultLitMarket);
                this._frame.setDataIvemIdFromDitem(dataIvemId, this._forceNextSymbolCommit);
                this._forceNextSymbolCommit = false;
            }
        }
    }

    private handleSymbolInputEvent() {
        this.pushHistoryCompareButtonState();
        this.pushHistoryCompareButtonTitle();
    }

    private handleHistoricalDateCommitEvent() {
        this._historicalDateUiAction.pushValidOrMissing();
    }

    private handleHistoricalDateInputEvent() {
        this.pushHistoryCompareButtonState();
        this.pushHistoryCompareButtonTitle();
    }

    private handleCompareDateCommitEvent() {
        this._compareDateUiAction.pushValidOrMissing();
    }

    private handleCompareDateInputEvent() {
        this.pushHistoryCompareButtonState();
        this.pushHistoryCompareButtonTitle();
    }

    private handleTodayModeSignalEvent() {
        this.setModeId(TopShareholdersDitemNgComponent.ModeId.Today);
    }

    private handleHistoricalModeSignalEvent() {
        this.setModeId(TopShareholdersDitemNgComponent.ModeId.Historical);
    }

    private handleSymbolLinkButtonClickEvent() {
        this._frame.dataIvemIdLinked = !this._frame.dataIvemIdLinked;
    }

    private createToggleSymbolLinkingButtonUiAction() {
        const commandName = InternalCommand.Id.ToggleSymbolLinking;
        const displayId = StringId.ToggleSymbolLinkingCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ToggleSymbolLinkingTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SymbolLink);
        action.signalEvent = () => this.handleSymbolLinkButtonClickEvent();
        return action;
    }

    private createTodayModeUiAction() {
        const commandName = InternalCommand.Id.TopShareholders_TodayMode;
        const displayId = StringId.TopShareholdersTodayModeCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.TopShareholdersTodayModeTitle]);
        action.pushIcon(IconButtonUiAction.IconId.NotHistorical);
        action.pushUnselected();
        action.signalEvent = () => this.handleTodayModeSignalEvent();
        return action;
    }

    private createHistoricalModeUiAction() {
        const commandName = InternalCommand.Id.TopShareholders_HistoricalMode;
        const displayId = StringId.TopShareholdersHistoricalModeCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.TopShareholdersHistoricalModeTitle]);
        action.pushIcon(IconButtonUiAction.IconId.Historical);
        action.pushUnselected();
        action.signalEvent = () => this.handleHistoricalModeSignalEvent();
        return action;
    }

    private createCompareModeUiAction() {
        const commandName = InternalCommand.Id.TopShareholders_CompareMode;
        const displayId = StringId.TopShareholdersCompareModeCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.TopShareholdersCompareModeTitle]);
        action.pushIcon(IconButtonUiAction.IconId.HistoricalCompare);
        action.pushUnselected();
        action.signalEvent = () => this.compareModeSignal();
        return action;
    }

    private createDetailsModeUiAction() {
        const commandName = InternalCommand.Id.TopShareholders_DetailsMode;
        const displayId = StringId.TopShareholdersDetailsModeCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.TopShareholdersDetailsModeTitle]);
        action.pushIcon(IconButtonUiAction.IconId.Details);
        action.pushUnselected();
        action.signalEvent = () => this.detailsModeClick();
        return action;
    }

    private createHistoryCompareUiAction() {
        const commandName = InternalCommand.Id.TopShareholders_Compare;
        const displayId = StringId.TopShareholdersCompareModeCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.Execute);
        action.pushDisabled();
        action.signalEvent = () => this.historyCompareClick();
        return action;
    }

    private createSymbolUiAction() {
        const action = new IvemIdUiAction(this._marketsService);
        action.pushTitle(Strings[StringId.TopShareholdersSymbolTitle]);
        action.commitEvent = () => this.handleSymbolCommitEvent();
        action.inputEvent = () => this.handleSymbolInputEvent();
        return action;
    }

    private createHistoricalDateUiAction() {
        const action = new DateUiAction();
        action.commitEvent = () => this.handleHistoricalDateCommitEvent();
        action.inputEvent = () => this.handleHistoricalDateInputEvent();
        return action;
    }

    private createCompareDateUiAction() {
        const action = new DateUiAction();
        action.commitEvent = () => this.handleCompareDateCommitEvent();
        action.inputEvent = () => this.handleCompareDateInputEvent();
        action.pushTitle(Strings[StringId.TopShareholdersCompareToDate]);
        return action;
    }

    private compareModeSignal() {
        this.setModeId(TopShareholdersDitemNgComponent.ModeId.Compare);
    }

    private detailsModeClick() {
        this.setModeId(TopShareholdersDitemNgComponent.ModeId.Details);
    }

    private isHistoryValid() {
        return this._symbolUiAction.isValueOk() && this._historicalDateUiAction.isValueOk();
    }

    private isCompareValid() {
        return this._symbolUiAction.isValueOk() && this._historicalDateUiAction.isValueOk() && this._compareDateUiAction.isValueOk();
    }

    private isHistoryCompareValid() {
        switch (this._modeId) {
            case TopShareholdersDitemNgComponent.ModeId.Historical:
                return this.isHistoryValid();
            case TopShareholdersDitemNgComponent.ModeId.Compare:
                return this.isCompareValid();
            default: return false;
        }
    }

    private historyCompareClick() {
        switch (this._modeId) {
            case TopShareholdersDitemNgComponent.ModeId.Historical:
                if (!this.isHistoryValid()) {
                    window.motifLogger.logWarning('TopShareholders history clicked when not all history controls valid');
                } else {
                    this.tryOpenGridSource();
                }
                break;
            case TopShareholdersDitemNgComponent.ModeId.Compare:
                if (!this.isCompareValid()) {
                    window.motifLogger.logWarning('TopShareholders compare clicked when not all compare controls valid');
                } else {
                    this.tryOpenGridSource();
                }
                break;
            default: throw new UnexpectedCaseError('TSICHCCU239984', this._modeId.toString(10));
        }
    }

    private acceptUi() {
        this._todayModeUiAction.pushAccepted();
        this._historicalModeUiAction.pushAccepted();
        this._compareModeUiAction.pushAccepted();
        this._detailsModeUiAction.pushAccepted();
        this._historyCompareUiAction.pushAccepted();
        this._symbolUiAction.pushAccepted();
        this._historicalDateUiAction.pushAccepted();
        this._compareDateUiAction.pushAccepted();
    }

    private tryOpenGridSource() {
        this.acceptUi();
        this._frame.tryOpenGridSource();
    }

    private initialiseComponents() {
        this._symbolEditComponent.initialise(this._symbolUiAction);
        this._todayModeButtonInputComponent.initialise(this._todayModeUiAction);
        this._historicalModeButtonInputComponent.initialise(this._historicalModeUiAction);
        this._compareModeButtonInputComponent.initialise(this._compareModeUiAction);
        this._detailsModeButtonInputComponent.initialise(this._detailsModeUiAction);
        this._historyCompareButtonInputComponent.initialise(this._historyCompareUiAction);
        this._symbolEditComponent.initialise(this._symbolUiAction);
        this._historicalDateInputComponent.initialise(this._historicalDateUiAction);
        this._compareDateInputComponent.initialise(this._compareDateUiAction);
    }

    private calculateHistoryCompareButtonTitle() {
        switch (this._modeId) {
            case TopShareholdersDitemNgComponent.ModeId.Historical:
                if (this.isHistoryValid()) {
                    return Strings[StringId.TopShareholdersHistory];
                } else {
                    return Strings[StringId.TopShareholdersInvalidHistory];
                }
            case TopShareholdersDitemNgComponent.ModeId.Compare:
                if (this.isCompareValid()) {
                    return Strings[StringId.TopShareholdersCompare];
                } else {
                    return Strings[StringId.TopShareholdersInvalidCompare];
                }
            default: return Strings[StringId.QuestionMark];
        }
    }

    private pushHistoryCompareButtonTitle() {
        const title = this.calculateHistoryCompareButtonTitle();
        this._historyCompareUiAction.pushTitle(title);
    }

    private calculateHistoryCompareButtonState() {
        if (this.isHistoryCompareValid()) {
            return UiAction.StateId.Accepted;
        } else {
            return UiAction.StateId.Disabled;
        }
    }

    private pushHistoryCompareButtonState() {
        const state = this.calculateHistoryCompareButtonState();
        this._historyCompareUiAction.pushState(state);
    }

    private pushSymbol() {
        let ivemId: IvemId | undefined;
        const dataIvemId = this._frame.dataIvemId;
        if (dataIvemId === undefined) {
            ivemId = undefined;
        } else {
            // ivemId = new IvemId(this._marketsService, dataIvemId.code, ExchangeId.Nzx);
            ivemId = dataIvemId.ivemId;
        }
        this._symbolUiAction.pushValue(ivemId);
    }

    private pushSymbolLinkButtonState() {
        if (this._frame.dataIvemIdLinked) {
            this._toggleSymbolLinkingButtonUiAction.pushSelected();
        } else {
            this._toggleSymbolLinkingButtonUiAction.pushUnselected();
        }
    }

    private setModeId(value: TopShareholdersDitemNgComponent.ModeId) {
        if (value !== this._modeId) {
            this._modeId = value;
            switch (this._modeId) {
                case TopShareholdersDitemNgComponent.ModeId.Today:
                    this._todayModeUiAction.pushSelected();
                    this._historicalModeUiAction.pushUnselected();
                    this._compareModeUiAction.pushUnselected();
                    this._detailsModeUiAction.pushUnselected();
                    this.detailsModeActive = false;
                    this.compareModeActive = false;
                    this.historicalOrCompareModeActive = false;
                    break;
                case TopShareholdersDitemNgComponent.ModeId.Historical:
                    this._todayModeUiAction.pushUnselected();
                    this._historicalModeUiAction.pushSelected();
                    this._compareModeUiAction.pushUnselected();
                    this._detailsModeUiAction.pushUnselected();
                    this._historicalDateUiAction.pushTitle(Strings[StringId.TopShareholdersHistoricalDate]);
                    this.detailsModeActive = false;
                    this.compareModeActive = false;
                    this.historicalOrCompareModeActive = true;
                    break;
                case TopShareholdersDitemNgComponent.ModeId.Compare:
                    this._todayModeUiAction.pushUnselected();
                    this._historicalModeUiAction.pushUnselected();
                    this._compareModeUiAction.pushSelected();
                    this._detailsModeUiAction.pushUnselected();
                    this._compareDateUiAction.pushTitle(Strings[StringId.TopShareholdersCompareFromDate]);
                    this.detailsModeActive = false;
                    this.compareModeActive = true;
                    this.historicalOrCompareModeActive = true;
                    break;
                case TopShareholdersDitemNgComponent.ModeId.Details:
                    this._todayModeUiAction.pushUnselected();
                    this._historicalModeUiAction.pushUnselected();
                    this._compareModeUiAction.pushUnselected();
                    this._detailsModeUiAction.pushSelected();
                    this.detailsModeActive = true;
                    this.compareModeActive = false;
                    this.historicalOrCompareModeActive = false;
                    break;
                default:
                    throw new UnreachableCaseError('TSICSMI397866', this._modeId);
            }

            this.markForCheck();
        }
    }

    private calculateCaption(symbol: DataIvemId, historicalDate: Date | undefined, compareDate: Date | undefined): string {
        const symbolText = this._symbolsNgService.dataIvemIdToDisplay(symbol);
        const top100ShareholdersText = Strings[StringId.Top100Shareholders];
        const forText = Strings[StringId.For];

        if (historicalDate === undefined) {
            return `${top100ShareholdersText} ${forText} ${symbolText}`;
        } else {
            const historicalDateAsStr = historicalDate.toLocaleDateString();
            if (compareDate === undefined) {
                const onText = Strings[StringId.On];
                return `${top100ShareholdersText} ${forText} ${symbolText} ${onText} ${historicalDateAsStr}`;
            } else {
                const fromText = Strings[StringId.From];
                const toText = Strings[StringId.To];
                const compareDateAsStr = compareDate.toLocaleDateString();
                return `${top100ShareholdersText} ${forText} ${symbolText} ${fromText} ${historicalDateAsStr}
                    ${toText} ${compareDateAsStr}`;
            }
        }
    }
}

export namespace TopShareholdersDitemNgComponent {
    export const stateSchemaVersion = '2';

    export const enum ModeId {
        Today,
        Historical,
        Compare,
        Details,
    }

    export namespace Mode {
        export type Id = ModeId;

        interface Info {
            readonly id: Id;
            readonly displayId: StringId;
            readonly descriptionId: StringId;
            readonly jsonValue: string;
        }

        type InfosObject = { [id in keyof typeof ModeId]: Info };

        const infosObject: InfosObject = {
            Today: {
                id: ModeId.Today,
                displayId: StringId.TopShareholdersInputModeDisplay_Today,
                descriptionId: StringId.TopShareholdersInputModeDescription_Today,
                jsonValue: 'today',
            },
            Historical: {
                id: ModeId.Historical,
                displayId: StringId.TopShareholdersInputModeDisplay_Historical,
                descriptionId: StringId.TopShareholdersInputModeDescription_Historical,
                jsonValue: 'historical',
            },
            Compare: {
                id: ModeId.Compare,
                displayId: StringId.TopShareholdersInputModeDisplay_Compare,
                descriptionId: StringId.TopShareholdersInputModeDescription_Compare,
                jsonValue: 'compare',
            },
            Details: {
                id: ModeId.Details,
                displayId: StringId.TopShareholdersInputModeDisplay_Details,
                descriptionId: StringId.TopShareholdersInputModeDescription_Details,
                jsonValue: 'details',
            },
        };

        export const idCount = Object.keys(infosObject).length;

        const infos = Object.values(infosObject);

        export function initialiseStatic() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index as ModeId);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('TopShareholdersInputComponent.ModeId', outOfOrderIdx, infos[outOfOrderIdx].jsonValue);
            }
        }

        export function idToDisplayId(id: Id): StringId {
            return infos[id].displayId;
        }

        export function idToDescriptionId(id: Id): StringId {
            return infos[id].descriptionId;
        }

        export function idToDisplay(id: Id): string {
            return Strings[idToDisplayId(id)];
        }

        export function idToDescription(id: Id): string {
            return Strings[idToDescriptionId(id)];
        }

        export function isToday(id: Id) {
            return id === ModeId.Today;
        }

        export function isHistorical(id: Id) {
            return id === ModeId.Historical;
        }

        export function isCompare(id: Id) {
            return id === ModeId.Compare;
        }

        export function isDetails(id: Id) {
            return id === ModeId.Details;
        }

        export function idToJsonValue(id: Id): string {
            return infos[id].jsonValue;
        }

        export function tryJsonValueToId(value: string): Id | undefined {
            const upperValue = value.toUpperCase();
            const idx = infos.findIndex((info: Info) => info.jsonValue.toUpperCase() === upperValue);
            return idx >= 0 ? infos[idx].id : undefined;
        }
    }

    export interface Details {
        symbolText: string;
        name: string;
        class: string;
    }

    export namespace JsonName {
        export const content = 'content';
        export const modeId = 'modeId';
        // export const historicalDate = 'historicalDate';
        // export const compareDate = 'compareDate';
    }
    export const latestLayoutConfigJsonProtocol = '1';
    export const defaultModeId = ModeId.Today;
}

export namespace TopShareholdersDitemNgComponentModule {
    export function initialiseStatic() {
        TopShareholdersDitemNgComponent.Mode.initialiseStatic();
    }
}
