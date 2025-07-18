import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    OnDestroy,
    viewChild,
    ViewContainerRef
} from '@angular/core';
import {
    CommaText,
    delay1Tick,
    getErrorMessage,
    JsonElement,
    ModifierKey,
    ModifierKeyId,
    UnreachableCaseError
} from '@pbkware/js-utils';
import { DateUiAction, StringUiAction, UiAction } from '@pbkware/ui-action';
import {
    DataIvemId,
    DataIvemIdUiAction,
    IconButtonUiAction,
    InternalCommand,
    MarketsService,
    StringId,
    Strings
} from '@plxtra/motif-core';
import { SplitAreaSize, SplitUnit } from 'angular-split';
import {
    AdiNgService,
    CommandRegisterNgService,
    MarketsNgService,
    SettingsNgService,
    SymbolsNgService,
    TextFormatterNgService,
    ToastNgService
} from 'component-services-ng-api';
import { DepthAndSalesColumnLayoutsDialogNgComponent, DepthNgComponent, TradesNgComponent, WatchlistNgComponent } from 'content-ng-api';
import {
    CommandBarNgComponent,
    DataIvemIdSelectNgComponent,
    DateInputNgComponent,
    SvgButtonNgComponent,
    TextInputNgComponent
} from 'controls-ng-api';
import { ComponentContainer } from 'golden-layout';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { DepthAndSalesDitemFrame } from '../depth-and-sales-ditem-frame';

@Component({
    selector: 'app-depth-and-sales-ditem',
    templateUrl: './depth-and-sales-ditem-ng.component.html',
    styleUrls: ['./depth-and-sales-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DepthAndSalesDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements OnDestroy, AfterViewInit, DepthAndSalesDitemFrame.ComponentAccess {
    private static typeInstanceCreateCount = 0;

    public splitterGutterSize = 3;
    public splitUnit: SplitUnit = 'percent';
    public depthWidth: SplitAreaSize = 90;

    public explicitDepthWidth = false;

    private readonly _symbolEditComponentSignal = viewChild<DataIvemIdSelectNgComponent>('symbolInput');
    private readonly _symbolButtonComponentSignal = viewChild<SvgButtonNgComponent>('symbolButton');
    private readonly _symbolLinkButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('symbolLinkButton');
    private readonly _rollUpButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('rollUpButton');
    private readonly _rollDownButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('rollDownButton');
    private readonly _filterButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('filterButton');
    private readonly _filterEditComponentSignal = viewChild.required<TextInputNgComponent>('filterEdit');
    private readonly _historicalTradesDateInputSignal = viewChild.required<DateInputNgComponent>('historicalDateInput');
    private readonly _columnsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('columnsButton');
    private readonly _autoSizeColumnWidthsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('autoSizeColumnWidthsButton');
    private readonly _depthTradesDivSignal = viewChild.required<ElementRef<HTMLElement>>('depthTradesDiv');
    private readonly _depthComponentSignal = viewChild.required<DepthNgComponent>('depth');
    private readonly _tradesComponentSignal = viewChild.required<TradesNgComponent>('trades');
    private readonly _watchlistComponentSignal = viewChild.required<WatchlistNgComponent>('watchlist');
    private readonly _dialogContainerSignal = viewChild.required('dialogContainer', { read: ViewContainerRef });
    private readonly _commandBarComponentSignal = viewChild.required<CommandBarNgComponent>('commandBar');

    private readonly _marketsService: MarketsService;
    private readonly _frame: DepthAndSalesDitemFrame;

    private readonly _symbolEditUiAction: DataIvemIdUiAction;
    private readonly _symbolApplyUiAction: IconButtonUiAction;
    private readonly _toggleSymbolLinkingUiAction: IconButtonUiAction;
    private readonly _rollUpUiAction: IconButtonUiAction;
    private readonly _expandUiAction: IconButtonUiAction;
    private readonly _filterUiAction: IconButtonUiAction;
    private readonly _filterEditUiAction: StringUiAction;
    private readonly _historicalTradesDateUiAction: DateUiAction;
    private readonly _columnsUiAction: IconButtonUiAction;
    private readonly _autoSizeColumnWidthsUiAction: IconButtonUiAction;

    private _symbolEditComponent: DataIvemIdSelectNgComponent | undefined;
    private _symbolButtonComponent: SvgButtonNgComponent | undefined;
    private _symbolLinkButtonComponent: SvgButtonNgComponent;
    private _rollUpButtonComponent: SvgButtonNgComponent;
    private _rollDownButtonComponent: SvgButtonNgComponent;
    private _filterButtonComponent: SvgButtonNgComponent;
    private _filterEditComponent: TextInputNgComponent;
    private _historicalTradesDateInput: DateInputNgComponent;
    private _columnsButtonComponent: SvgButtonNgComponent;
    private _autoSizeColumnWidthsButtonComponent: SvgButtonNgComponent;
    private _depthTradesDiv: ElementRef<HTMLElement>;
    private _depthComponent: DepthNgComponent;
    private _tradesComponent: TradesNgComponent;
    private _watchlistComponent: WatchlistNgComponent;
    private _dialogContainer: ViewContainerRef;
    private _commandBarComponent: CommandBarNgComponent;

    private _layoutEditorComponent: DepthAndSalesColumnLayoutsDialogNgComponent | undefined;

    private _modeId = DepthAndSalesDitemNgComponent.ModeId.Main;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        @Inject(BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken) container: ComponentContainer,
        settingsNgService: SettingsNgService,
        marketsNgService: MarketsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        desktopAccessNgService: DesktopAccessNgService,
        symbolsNgService: SymbolsNgService,
        adiNgService: AdiNgService,
        textFormatterNgService: TextFormatterNgService,
        toastNgService: ToastNgService,
    ) {
        super(elRef, ++DepthAndSalesDitemNgComponent.typeInstanceCreateCount, cdr, container, settingsNgService.service, commandRegisterNgService.service);

        this._marketsService = marketsNgService.service;

        this._frame = new DepthAndSalesDitemFrame(
            this,
            this.settingsService,
            this._marketsService,
            this.commandRegisterService,
            desktopAccessNgService.service,
            symbolsNgService.service,
            adiNgService.service,
            textFormatterNgService.service,
            toastNgService.service,
        );

        this._symbolEditUiAction = this.createSymbolEditUiAction();
        this._symbolApplyUiAction = this.createSymbolApplyUiAction();
        this._toggleSymbolLinkingUiAction = this.createToggleSymbolLinkingUiAction();
        this._rollUpUiAction = this.createRollUpUiAction();
        this._expandUiAction = this.createExpandUiAction();
        this._filterUiAction = this.createFilterUiAction();
        this._filterEditUiAction = this.createFilterEditUiAction();
        this._historicalTradesDateUiAction = this.createHistoricalTradesDateUiAction();
        this._columnsUiAction = this.createColumnsUiAction();
        this._autoSizeColumnWidthsUiAction = this.createAutoSizeColumnWidthsUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());

        this.pushSymbol(this._frame.dataIvemId);
        this.pushSymbolLinkSelectState();
    }

    get ditemFrame() { return this._frame; }

    protected get stateSchemaVersion() { return DepthAndSalesDitemNgComponent.stateSchemaVersion; }

    public ngOnDestroy() {
        this.finalise();
    }

    public ngAfterViewInit(): void {
            this._symbolEditComponent = this._symbolEditComponentSignal();
            this._symbolButtonComponent = this._symbolButtonComponentSignal();
            this._symbolLinkButtonComponent = this._symbolLinkButtonComponentSignal();
            this._rollUpButtonComponent = this._rollUpButtonComponentSignal();
            this._rollDownButtonComponent = this._rollDownButtonComponentSignal();
            this._filterButtonComponent = this._filterButtonComponentSignal();
            this._filterEditComponent = this._filterEditComponentSignal();
            this._historicalTradesDateInput = this._historicalTradesDateInputSignal();
            this._columnsButtonComponent = this._columnsButtonComponentSignal();
            this._autoSizeColumnWidthsButtonComponent = this._autoSizeColumnWidthsButtonComponentSignal();
            this._depthTradesDiv = this._depthTradesDivSignal();
            this._depthComponent = this._depthComponentSignal();
            this._tradesComponent = this._tradesComponentSignal();
            this._watchlistComponent = this._watchlistComponentSignal();
            this._dialogContainer = this._dialogContainerSignal();
            this._commandBarComponent = this._commandBarComponentSignal();

            delay1Tick(() => this.initialise());
        }

    // component interface methods

    public adjustDepthWidth(preferredDepthWidth: number) {
        const totalDepthTradesWidth = this._depthTradesDiv.nativeElement.offsetWidth;
        if (preferredDepthWidth > totalDepthTradesWidth - 50) {
            preferredDepthWidth = totalDepthTradesWidth - 50;
            if (preferredDepthWidth < 50) {
                preferredDepthWidth = Math.round(totalDepthTradesWidth / 2);
            }
        }

        this.splitUnit = 'pixel';
        this.depthWidth = preferredDepthWidth;
        this.markForCheck();
    }

    // template functions
    public isMainMode() {
        return this._modeId === DepthAndSalesDitemNgComponent.ModeId.Main;
    }

    public isDialogMode() {
        switch (this._modeId) {
            case DepthAndSalesDitemNgComponent.ModeId.LayoutDialog:
                return true;
            case DepthAndSalesDitemNgComponent.ModeId.Main:
                return false;
            default:
                throw new UnreachableCaseError('PDNCIDM65312', this._modeId);
        }
    }

    public splitDragEnd() {
        this.explicitDepthWidth = true;
    }

    // TradesDitemFrame.ComponentAccess methods
    public getHistoricalDate() {
        return this._historicalTradesDateUiAction.value;
    }

    public pushSymbol(dataIvemId: DataIvemId | undefined) {
        this._symbolEditUiAction.pushValue(dataIvemId);
    }

    public notifyOpenedClosed(dataIvemId: DataIvemId | undefined, historicalTradesDate: Date | undefined) {
        this.pushSymbol(dataIvemId);
        this.pushFilterEditValue();
        this.pushHistoricalTradesDate(historicalTradesDate);
        this._symbolApplyUiAction.pushDisabled();
        this.updateColumnsEnabledDisabled();
        this.pushAccepted();
    }

    public override processSymbolLinkedChanged() {
        this.pushSymbolLinkSelectState();
    }

    protected override initialise() {
        const componentStateElement = this.getInitialComponentStateJsonElement();
        const frameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        this._frame.initialise(
            this._watchlistComponent.frame,
            this._depthComponent.frame,
            this._tradesComponent.frame,
            frameElement,
        );

        this.pushFilterSelectState();
        this.pushFilterEditValue();

        // this.initialiseWidths();

        this.initialiseChildComponents();

        this.updateColumnsEnabledDisabled();

        super.initialise();
    }

    protected override finalise() {
        this._symbolEditUiAction.finalise();
        this._symbolApplyUiAction.finalise();
        this._toggleSymbolLinkingUiAction.finalise();
        this._rollUpUiAction.finalise();
        this._expandUiAction.finalise();
        this._filterUiAction.finalise();
        this._filterEditUiAction.finalise();
        this._historicalTradesDateUiAction.finalise();
        this._columnsUiAction.finalise();
        this._autoSizeColumnWidthsUiAction.finalise();

        this._frame.finalise();
        super.finalise();
    }

    protected constructLoad(element: JsonElement | undefined) {
        const frameElement = this.tryGetChildFrameJsonElement(element);
        this._frame.constructLoad(frameElement);

        if (element === undefined) {
            this.explicitDepthWidth = false;
        } else {
            const depthWidthResult = element.tryGetNumber(DepthAndSalesDitemNgComponent.JsonName.depthWidth);
            if (depthWidthResult.isErr()) {
                this.explicitDepthWidth = false;
            } else {
                this.splitUnit = 'pixel';
                this.depthWidth = depthWidthResult.value;
                this.explicitDepthWidth = true;
                this.markForCheck();
            }
        }
    }

    protected save(element: JsonElement) {
        if (this.explicitDepthWidth) {
            const depthWidth = this.getDepthWidth();
            element.setNumber(DepthAndSalesDitemNgComponent.JsonName.depthWidth, depthWidth);
        }
        const frameElement = this.createChildFrameJsonElement(element);
        this._frame.save(frameElement);
    }

    // protected override processShown() {
    //     this._frame.adviseShown();
    // }

    private handleSymbolCommitEvent(typeId: UiAction.CommitTypeId) {
        this.commitSymbol(typeId);
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
            //     }
            // }
        }
    }

    private handleSymbolApplyUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this.commitSymbol(UiAction.CommitTypeId.Explicit);
    }

    private handleSymbolLinkUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this._frame.dataIvemIdLinked = !this._frame.dataIvemIdLinked;
    }

    private handleRollUpUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this._frame.rollUp(ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Shift));
    }

    private handleExpandUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this._frame.expand(ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Shift));
    }

    private handleFilterUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this._frame.toggleFilterActive();
        this.pushFilterSelectState();
    }

    private handleFilterEditUiActionCommitEvent(typeId: UiAction.CommitTypeId) {
        const toArrayResult = CommaText.tryToStringArray(this._filterEditUiAction.definedValue, false);
        if (toArrayResult.isOk()) {
            this._frame.setFilter(toArrayResult.value);
            this.pushFilterEditValue();
        } else {
            this._filterUiAction.pushInvalid(Strings[StringId.Depth_InvalidFilterXrefs]);
        }
    }

    private handleHistoricalTradesDateCommitEvent(typeId: UiAction.CommitTypeId) {
        this._frame.historicalTradesDateCommit();
        // this.pushValid();
    }

    private handleColumnsUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this.showLayoutDialog();
    }

    private handleAutoSizeColumnWidthsUiActionSignalEvent(_signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        const widenOnly = ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Shift);
        this._frame.autoSizeAllColumnWidths(widenOnly);
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
        action.pushTitle(Strings[StringId.ApplySymbolTitle]);
        action.pushIcon(IconButtonUiAction.IconId.Execute);
        action.pushDisabled();
        action.signalEvent = (signalTypeId, downKeys) => this.handleSymbolApplyUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private createToggleSymbolLinkingUiAction() {
        const commandName = InternalCommand.Id.ToggleSymbolLinking;
        const displayId = StringId.ToggleSymbolLinkingCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ToggleSymbolLinkingTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SymbolLink);
        action.signalEvent = (signalTypeId, downKeys) => this.handleSymbolLinkUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private createRollUpUiAction() {
        const commandName = InternalCommand.Id.Depth_Rollup;
        const displayId = StringId.Depth_RollUpCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.Depth_RollUpToPriceLevelsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.RollUp);
        action.signalEvent = (signalTypeId, downKeys) => this.handleRollUpUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private createExpandUiAction() {
        const commandName = InternalCommand.Id.Depth_Expand;
        const displayId = StringId.Depth_ExpandCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.Depth_ExpandToOrdersTitle]);
        action.pushIcon(IconButtonUiAction.IconId.RollDown);
        action.signalEvent = (signalTypeId, downKeys) => this.handleExpandUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private createFilterUiAction() {
        const commandName = InternalCommand.Id.Depth_Filter;
        const displayId = StringId.Depth_FilterCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.Depth_FilterToXrefsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.Filter);
        action.signalEvent = (signalTypeId, downKeys) => this.handleFilterUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private createFilterEditUiAction() {
        const action = new StringUiAction();
        action.pushTitle(Strings[StringId.Depth_SpecifyFilterXrefsTitle]);
        action.commitEvent = (typeId) => this.handleFilterEditUiActionCommitEvent(typeId);
        return action;
    }

    private createHistoricalTradesDateUiAction() {
        const action = new DateUiAction();
        action.valueRequired = false;
        action.commitEvent = (typeId) => this.handleHistoricalTradesDateCommitEvent(typeId);
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
        action.signalEvent = (signalTypeId, downKeys) => this.handleColumnsUiActionSignalEvent(signalTypeId, downKeys);
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

    private initialiseChildComponents() {
        if (this._symbolEditComponent !== undefined) {
            this._symbolEditComponent.initialise(this._symbolEditUiAction);
        }

        if (this._symbolButtonComponent !== undefined) {
            this._symbolButtonComponent.initialise(this._symbolApplyUiAction);
        }

        this._symbolLinkButtonComponent.initialise(this._toggleSymbolLinkingUiAction);
        this._rollUpButtonComponent.initialise(this._rollUpUiAction);
        this._rollDownButtonComponent.initialise(this._expandUiAction);
        this._filterButtonComponent.initialise(this._filterUiAction);
        this._filterEditComponent.initialise(this._filterEditUiAction);
        this._historicalTradesDateInput.initialise(this._historicalTradesDateUiAction);
        this._columnsButtonComponent.initialise(this._columnsUiAction);
        this._autoSizeColumnWidthsButtonComponent.initialise(this._autoSizeColumnWidthsUiAction);

        // this._commandBarComponent.addCommandProcessor(this._frame.watchlistCommandProcessor);
        // this._commandBarComponent.addCommandProcessor(this._frame.depthCommandProcessor);
        // this._commandBarComponent.addCommandProcessor(this._frame.dayTradesCommandProcessor);

        this._frame.open();
    }

    private commitSymbol(typeId: UiAction.CommitTypeId) {
        const dataIvemId = this._symbolEditUiAction.value;
        if (dataIvemId !== undefined) {
            this._frame.setDataIvemIdFromDitem(dataIvemId);
        }
        this.pushValid();
    }

    private pushSymbolLinkSelectState() {
        if (this._frame.dataIvemIdLinked) {
            this._toggleSymbolLinkingUiAction.pushSelected();
        } else {
            this._toggleSymbolLinkingUiAction.pushUnselected();
        }
    }

    private pushFilterSelectState() {
        if (this._frame.filterActive) {
            this._filterUiAction.pushSelected();
        } else {
            this._filterUiAction.pushUnselected();
        }
    }

    private pushFilterEditValue() {
        const filterXrefs = this._frame.filterXrefs;
        const value = CommaText.fromStringArray(filterXrefs);
        this._filterEditUiAction.pushValue(value);
    }

    private pushHistoricalTradesDate(historicalTradesDate: Date | undefined) {
        this._historicalTradesDateUiAction.pushValue(historicalTradesDate);
    }

    private pushAccepted() {
        this._symbolApplyUiAction.pushAccepted();
        this._historicalTradesDateUiAction.pushAccepted();
    }

    private pushValid() {
        this._symbolApplyUiAction.pushValidOrMissing();
        this._historicalTradesDateUiAction.pushValidOrMissing();
    }

    private updateColumnsEnabledDisabled() {
        if (this._frame.canCreateAllowedSourcedFieldsColumnLayoutDefinition()) {
            this._columnsUiAction.pushAccepted();
        } else {
            this._columnsUiAction.pushDisabled();
        }
    }

    private showLayoutDialog() {
        this._modeId = DepthAndSalesDitemNgComponent.ModeId.LayoutDialog;
        const allowedFieldsAndLayoutDefinitions = this._frame.createAllowedFieldsAndLayoutDefinition();

        const closePromise = DepthAndSalesColumnLayoutsDialogNgComponent.open(
            this._dialogContainer,
            this._frame.opener,
            Strings[StringId.DepthAndSales_ColumnsDialogCaption],
            allowedFieldsAndLayoutDefinitions
        );
        closePromise.then(
            (layoutOrReferenceDefinition) => {
                if (layoutOrReferenceDefinition !== undefined) {
                    this._frame.applyColumnLayoutDefinitions(layoutOrReferenceDefinition);
                }
                this.closeDialog();
            },
            (reason: unknown) => {
                const errorText = getErrorMessage(reason);
                window.motifLogger.logError(`Depth and Sales Grid Layout error: ${errorText}`);
                this.closeDialog();
            }
        );


        this.markForCheck();
    }

    private closeDialog() {
        this._dialogContainer.clear();
        this._modeId = DepthAndSalesDitemNgComponent.ModeId.Main;
        this.markForCheck();
    }

    private getDepthWidth(): number {
        const rect = this._depthComponent.elRef.nativeElement.getBoundingClientRect();
        return rect.width;
    }

    // private async initialiseWidths() {
    //     this.depthActiveWidth = await this._frame.getDepthRenderedActiveWidth();
    //     this.tradesActiveWidth = await this._frame.getTradesRenderedActiveWidth();
    //     if (!this._explicitDepthWidth) {
    //         this.depthWidth = this.depthActiveWidth;
    //     }
    //     this.markForCheck();
    // }
}

export namespace DepthAndSalesDitemNgComponent {
    export const enum ModeId {
        Main,
        LayoutDialog,
    }

    export namespace JsonName {
        export const depthWidth = 'depthWidth';
    }

    export const stateSchemaVersion = '2';
}
