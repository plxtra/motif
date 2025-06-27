import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, OnDestroy, viewChild } from '@angular/core';
import {
    AssertInternalError,
    DecimalFactory,
    delay1Tick,
    Integer,
    MultiEvent,
    newUndefinableDate,
    UnreachableCaseError,
} from '@pbkware/js-utils';
import { DateUiAction, DecimalUiAction, IntegerListSelectItemUiAction, IntegerUiAction, StringUiAction, UiAction } from '@pbkware/ui-action';
import {
    BrokerageAccountGroup,
    BrokerageAccountGroupUiAction,
    ColorScheme,
    MarketsService,
    Movement,
    MovementId,
    Order,
    OrderPad,
    OrderRequestTypeId,
    OrderTradeType,
    OrderTradeTypeId,
    OrderTriggerType,
    OrderTriggerTypeId,
    OrderType,
    OrderTypeId,
    PriceOrderTrigger,
    SettingsService,
    SingleBrokerageAccountGroup,
    StringId,
    Strings,
    TimeInForce,
    TimeInForceId,
    TradingIvemId,
    TradingIvemIdUiAction,
    TradingMarket,
    TradingMarketUiAction,
} from '@plxtra/motif-core';
import { DecimalFactoryNgService, MarketsNgService, SettingsNgService } from 'component-services-ng-api';
import {
    BrokerageAccountGroupInputNgComponent,
    BrokerageAccountGroupNameLabelNgComponent,
    CaptionLabelNgComponent,
    DateInputNgComponent,
    DecimalInputNgComponent,
    IntegerCaptionedRadioNgComponent,
    IntegerEnumCaptionNgComponent,
    IntegerEnumInputNgComponent,
    IntegerLabelNgComponent,
    IntegerTextInputNgComponent,
    TextInputNgComponent,
    TradingIvemIdNameLabelNgComponent,
    TradingIvemIdSelectNgComponent,
    TradingMarketInputNgComponent
} from 'controls-ng-api';
import { Decimal } from 'decimal.js-light';
import { ContentNgService } from '../../../ng/content-ng.service';
import { OrderRequestStepComponentNgDirective } from '../../ng/order-request-step-component-ng.directive';
import { PadOrderRequestStepFrame } from '../pad-order-request-step-frame';

@Component({
    selector: 'app-pad-order-request-step',
    templateUrl: './pad-order-request-step-ng.component.html',
    styleUrls: ['./pad-order-request-step-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class PadOrderRequestStepNgComponent extends OrderRequestStepComponentNgDirective implements OnDestroy, AfterViewInit, PadOrderRequestStepFrame.ComponentAccess {
    private static typeInstanceCreateCount = 0;

    @HostBinding('style.--color-grid-base-bkgd') gridBkgdColor: string;
    @HostBinding('style.--color-grid-base-alt-bkgd') gridAltBkgdColor: string;

    public readonly sideRadioName: string;
    public readonly orderTypeRadioName: string;
    public readonly timeInForceRadioName: string;
    public readonly triggerTypeRadioName: string;
    public readonly triggerFieldRadioName: string;
    public readonly triggerMovementRadioName: string;

    public readonly tradingMarketControlVisible: boolean;
    public priceTriggerTypeVisible = false;
    public existingOrderVisible = false;
    public destinationAccountVisible = false;
    public sideInputVisible = true;

    private readonly _accountLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('accountLabel');
    private readonly _accountIdInputComponentSignal = viewChild.required<BrokerageAccountGroupInputNgComponent>('accountIdInput');
    private readonly _accountNameLabelComponentSignal = viewChild.required<BrokerageAccountGroupNameLabelNgComponent>('accountNameLabel');
    private readonly _sideLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('sideLabel');
    private readonly _buySideRadioComponentSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('buySideRadio');
    private readonly _sellSideRadioComponentSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('sellSideRadio');
    private readonly _sideInputComponentSignal = viewChild.required<IntegerEnumInputNgComponent>('sideInput');
    private readonly _symbolLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('symbolLabel');
    private readonly _symbolControlComponentSignal = viewChild.required<TradingIvemIdSelectNgComponent>('symbolControl');
    private readonly _symbolNameLabelComponentSignal = viewChild.required<TradingIvemIdNameLabelNgComponent>('symbolNameLabel');
    private readonly _tradingMarketControlComponentSignal = viewChild.required<TradingMarketInputNgComponent>('tradingMarketControl');
    private readonly _quantityLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('quantityLabel');
    private readonly _quantityInputComponentSignal = viewChild.required<IntegerTextInputNgComponent>('quantityInput');
    private readonly _orderTypeLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('orderTypeLabel');
    private readonly _limitOrderTypeRadioComponentSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('limitOrderTypeRadio');
    private readonly _marketOrderTypeRadioComponentSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('marketOrderTypeRadio');
    private readonly _orderTypeInputComponentSignal = viewChild.required<IntegerEnumInputNgComponent>('orderTypeInput');
    private readonly _priceLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('priceLabel');
    private readonly _limitValueInputComponentSignal = viewChild.required<DecimalInputNgComponent>('priceInput');
    private readonly _limitUnitLabelComponentSignal = viewChild.required<IntegerEnumCaptionNgComponent>('priceUnitLabel');
    private readonly _timeInForceLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('timeInForceLabel');
    private readonly _untilCancelRadioComponentSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('untilCancelRadio');
    private readonly _fillAndKillRadioComponentSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('fillAndKillRadio');
    private readonly _fillOrKillRadioComponentSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('fillOrKillRadio');
    private readonly _dayRadioComponentSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('dayRadio');
    private readonly _untilDateRadioComponentSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('untilDateRadio');
    private readonly _expiryDateInputComponentSignal = viewChild.required<DateInputNgComponent>('expiryDateInput');
    private readonly _triggerLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('triggerLabel');
    private readonly _immediateTriggerTypeRadioComponentSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('immediateTriggerTypeRadio');
    private readonly _priceTriggerTypeRadioComponentSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('priceTriggerTypeRadio');
    // @viewChild.required('triggerTypeInput', { static: true }) private _triggerTypeInputComponentSignal: EnumInputNgComponent;
    private readonly _triggerValueLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('triggerValueLabel');
    private readonly _triggerValueInputComponentSignal = viewChild.required<DecimalInputNgComponent>('triggerValueInput');
    private readonly _lastTriggerFieldRadioComponentSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('lastTriggerFieldRadio');
    private readonly _bestBidTriggerFieldRadioComponentSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('bestBidTriggerFieldRadio');
    private readonly _bestAskTriggerFieldRadioComponentSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('bestAskTriggerFieldRadio');
    // @viewChild.required('triggerFieldSelect', { static: true }) private _triggerFieldSelectComponentSignal: EnumInputNgComponent;
    private readonly _noneTriggerMovementRadioComponentSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('noneTriggerMovementRadio');
    private readonly _upTriggerMovementRadioComponentSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('upTriggerMovementRadio');
    private readonly _downTriggerMovementRadioComponentSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('downTriggerMovementRadio');
    private readonly _existingOrderLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('existingOrderLabel');
    private readonly _existingOrderIdControlComponentSignal = viewChild.required<TextInputNgComponent>('existingOrderIdControl');
    private readonly _destinationAccountLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('destinationAccountLabel');
    private readonly _destinationAccountIdControlComponentSignal = viewChild.required<BrokerageAccountGroupInputNgComponent>('destinationAccountIdControl');
    private readonly _destinationAccountNameLabelComponentSignal = viewChild.required<BrokerageAccountGroupNameLabelNgComponent>('destinationAccountNameLabel');
    private readonly _errorsLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('errorsLabel');
    private readonly _errorCountComponentSignal = viewChild.required<IntegerLabelNgComponent>('errorCountLabel');
    private readonly _errorsInputComponentSignal = viewChild.required<TextInputNgComponent>('errorsInput');
    // @viewChild.required('noErrorsLabel', { static: true }) private _noErrorsLabelComponentSignal: LabelComponent;

    private readonly _frame: PadOrderRequestStepFrame;
    private readonly _decimalFactory: DecimalFactory;
    private readonly _settingsService: SettingsService;
    private readonly _marketsService: MarketsService;

    private readonly _accountGroupUiAction: BrokerageAccountGroupUiAction;
    private readonly _sideUiAction: IntegerListSelectItemUiAction;
    private readonly _symbolUiAction: TradingIvemIdUiAction;
    private readonly _tradingMarketUiAction: TradingMarketUiAction;
    private readonly _totalQuantityUiAction: IntegerUiAction;
    private readonly _orderTypeUiAction: IntegerListSelectItemUiAction;
    private readonly _limitValueUiAction: DecimalUiAction;
    private readonly _limitUnitUiAction: IntegerListSelectItemUiAction;
    private readonly _triggerTypeUiAction: IntegerListSelectItemUiAction;
    private readonly _triggerValueUiAction: DecimalUiAction;
    private readonly _triggerFieldUiAction: IntegerListSelectItemUiAction;
    private readonly _triggerMovementUiAction: IntegerListSelectItemUiAction;
    private readonly _timeInForceUiAction: IntegerListSelectItemUiAction;
    private readonly _expiryDateUiAction: DateUiAction;
    private readonly _existingOrderIdUiAction: StringUiAction;
    private readonly _destinationAccountGroupUiAction: BrokerageAccountGroupUiAction;
    private readonly _errorCountUiAction: IntegerUiAction;
    private readonly _errorsUiAction: StringUiAction;

    private _accountLabelComponent: CaptionLabelNgComponent;
    private _accountIdInputComponent: BrokerageAccountGroupInputNgComponent;
    private _accountNameLabelComponent: BrokerageAccountGroupNameLabelNgComponent;
    private _sideLabelComponent: CaptionLabelNgComponent;
    private _buySideRadioComponent: IntegerCaptionedRadioNgComponent;
    private _sellSideRadioComponent: IntegerCaptionedRadioNgComponent;
    private _sideInputComponent: IntegerEnumInputNgComponent;
    private _symbolLabelComponent: CaptionLabelNgComponent;
    private _symbolControlComponent: TradingIvemIdSelectNgComponent;
    private _symbolNameLabelComponent: TradingIvemIdNameLabelNgComponent;
    private _tradingMarketControlComponent: TradingMarketInputNgComponent;
    private _quantityLabelComponent: CaptionLabelNgComponent;
    private _quantityInputComponent: IntegerTextInputNgComponent;
    private _orderTypeLabelComponent: CaptionLabelNgComponent;
    private _limitOrderTypeRadioComponent: IntegerCaptionedRadioNgComponent;
    private _marketOrderTypeRadioComponent: IntegerCaptionedRadioNgComponent;
    private _orderTypeInputComponent: IntegerEnumInputNgComponent;
    private _priceLabelComponent: CaptionLabelNgComponent;
    private _limitValueInputComponent: DecimalInputNgComponent;
    private _limitUnitLabelComponent: IntegerEnumCaptionNgComponent;
    private _timeInForceLabelComponent: CaptionLabelNgComponent;
    private _untilCancelRadioComponent: IntegerCaptionedRadioNgComponent;
    private _fillAndKillRadioComponent: IntegerCaptionedRadioNgComponent;
    private _fillOrKillRadioComponent: IntegerCaptionedRadioNgComponent;
    private _dayRadioComponent: IntegerCaptionedRadioNgComponent;
    private _untilDateRadioComponent: IntegerCaptionedRadioNgComponent;
    private _expiryDateInputComponent: DateInputNgComponent;
    private _triggerLabelComponent: CaptionLabelNgComponent;
    private _immediateTriggerTypeRadioComponent: IntegerCaptionedRadioNgComponent;
    private _priceTriggerTypeRadioComponent: IntegerCaptionedRadioNgComponent;
    private _triggerValueLabelComponent: CaptionLabelNgComponent;
    private _triggerValueInputComponent: DecimalInputNgComponent;
    private _lastTriggerFieldRadioComponent: IntegerCaptionedRadioNgComponent;
    private _bestBidTriggerFieldRadioComponent: IntegerCaptionedRadioNgComponent;
    private _bestAskTriggerFieldRadioComponent: IntegerCaptionedRadioNgComponent;
    private _noneTriggerMovementRadioComponent: IntegerCaptionedRadioNgComponent;
    private _upTriggerMovementRadioComponent: IntegerCaptionedRadioNgComponent;
    private _downTriggerMovementRadioComponent: IntegerCaptionedRadioNgComponent;
    private _existingOrderLabelComponent: CaptionLabelNgComponent;
    private _existingOrderIdControlComponent: TextInputNgComponent;
    private _destinationAccountLabelComponent: CaptionLabelNgComponent;
    private _destinationAccountIdControlComponent: BrokerageAccountGroupInputNgComponent;
    private _destinationAccountNameLabelComponent: BrokerageAccountGroupNameLabelNgComponent;
    private _errorsLabelComponent: CaptionLabelNgComponent;
    private _errorCountComponent: IntegerLabelNgComponent;
    private _errorsInputComponent: TextInputNgComponent;

    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        decimalFactoryNgService: DecimalFactoryNgService,
        settingsNgService: SettingsNgService,
        marketsNgService: MarketsNgService,
        contentNgService: ContentNgService,
    ) {
        super(elRef, ++PadOrderRequestStepNgComponent.typeInstanceCreateCount, cdr);

        this._decimalFactory = decimalFactoryNgService.service;
        this._settingsService = settingsNgService.service;
        this._marketsService = marketsNgService.service;

        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.applySettings());

        this.sideRadioName = this.generateInstancedRadioName('side');
        this.orderTypeRadioName = this.generateInstancedRadioName('orderType');
        this.timeInForceRadioName = this.generateInstancedRadioName('timeInForce');
        this.triggerTypeRadioName = this.generateInstancedRadioName('triggerType');
        this.triggerFieldRadioName = this.generateInstancedRadioName('triggerField');
        this.triggerMovementRadioName = this.generateInstancedRadioName('triggerMovement');

        this._frame = contentNgService.createPadOrderRequestStepFrame(this);

        this._accountGroupUiAction = this.createAccountIdUiAction();
        this._sideUiAction = this.createSideUiAction();
        this._symbolUiAction = this.createSymbolUiAction();
        this._tradingMarketUiAction = this.createTradingMarketUiAction();
        this._totalQuantityUiAction = this.createTotalQuantityUiAction();
        this._orderTypeUiAction = this.createOrderTypeUiAction();
        this._limitValueUiAction = this.createLimitValueUiAction();
        this._limitUnitUiAction = this.createLimitUnitUiAction();
        this._triggerTypeUiAction = this.createTriggerTypeUiAction();
        this._triggerValueUiAction = this.createTriggerValueUiAction();
        this._triggerFieldUiAction = this.createTriggerFieldUiAction();
        this._triggerMovementUiAction = this.createTriggerMovementUiAction();
        this._timeInForceUiAction = this.createTimeInForceUiAction();
        this._expiryDateUiAction = this.createExpiryDateUiAction();
        this._existingOrderIdUiAction = this.createExistingOrderIdUiAction();
        this._destinationAccountGroupUiAction = this.createDestinationAccountIdUiAction();
        this._errorCountUiAction = this.createErrorCountUiAction();
        this._errorsUiAction = this.createErrorsUiAction();

        this.applySettings();

        this.tradingMarketControlVisible = this._marketsService.tradingMarkets.count > 1;

        this.initialiseUiFieldErrorState(OrderPad.FieldId.Account, this._accountGroupUiAction);
        this.initialiseUiFieldErrorState(OrderPad.FieldId.Side, this._sideUiAction);
        const symbolEditInfo = this.calculateSymbolEditInfo();
        this._frame.initialiseUiFieldErrorState(OrderPad.FieldId.Symbol,
            symbolEditInfo.edited, symbolEditInfo.valid, symbolEditInfo.missing, symbolEditInfo.errorText
        );
        this.initialiseUiFieldErrorState(OrderPad.FieldId.TotalQuantity, this._totalQuantityUiAction);
        this.initialiseUiFieldErrorState(OrderPad.FieldId.OrderType, this._orderTypeUiAction);
        this.initialiseUiFieldErrorState(OrderPad.FieldId.LimitValue, this._limitValueUiAction);
        this.initialiseUiFieldErrorState(OrderPad.FieldId.TriggerType, this._triggerTypeUiAction);
        this.initialiseUiFieldErrorState(OrderPad.FieldId.TriggerValue, this._triggerValueUiAction);
        this.initialiseUiFieldErrorState(OrderPad.FieldId.TriggerField, this._triggerFieldUiAction);
        this.initialiseUiFieldErrorState(OrderPad.FieldId.TriggerMovement, this._triggerMovementUiAction);
        this.initialiseUiFieldErrorState(OrderPad.FieldId.TimeInForce, this._timeInForceUiAction);
        this.initialiseUiFieldErrorState(OrderPad.FieldId.ExpiryDate, this._expiryDateUiAction);
        this.initialiseUiFieldErrorState(OrderPad.FieldId.ExistingOrder, this._existingOrderIdUiAction);
        this.initialiseUiFieldErrorState(OrderPad.FieldId.DestinationAccount, this._destinationAccountGroupUiAction);
    }

    get frame() { return this._frame; }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._accountLabelComponent = this._accountLabelComponentSignal();
        this._accountIdInputComponent = this._accountIdInputComponentSignal();
        this._accountNameLabelComponent = this._accountNameLabelComponentSignal();
        this._sideLabelComponent = this._sideLabelComponentSignal();
        this._buySideRadioComponent = this._buySideRadioComponentSignal();
        this._sellSideRadioComponent = this._sellSideRadioComponentSignal();
        this._sideInputComponent = this._sideInputComponentSignal();
        this._symbolLabelComponent = this._symbolLabelComponentSignal();
        this._symbolControlComponent = this._symbolControlComponentSignal();
        this._symbolNameLabelComponent = this._symbolNameLabelComponentSignal();
        this._tradingMarketControlComponent = this._tradingMarketControlComponentSignal();
        this._quantityLabelComponent = this._quantityLabelComponentSignal();
        this._quantityInputComponent = this._quantityInputComponentSignal();
        this._orderTypeLabelComponent = this._orderTypeLabelComponentSignal();
        this._limitOrderTypeRadioComponent = this._limitOrderTypeRadioComponentSignal();
        this._marketOrderTypeRadioComponent = this._marketOrderTypeRadioComponentSignal();
        this._orderTypeInputComponent = this._orderTypeInputComponentSignal();
        this._priceLabelComponent = this._priceLabelComponentSignal();
        this._limitValueInputComponent = this._limitValueInputComponentSignal();
        this._limitUnitLabelComponent = this._limitUnitLabelComponentSignal();
        this._timeInForceLabelComponent = this._timeInForceLabelComponentSignal();
        this._untilCancelRadioComponent = this._untilCancelRadioComponentSignal();
        this._fillAndKillRadioComponent = this._fillAndKillRadioComponentSignal();
        this._fillOrKillRadioComponent = this._fillOrKillRadioComponentSignal();
        this._dayRadioComponent = this._dayRadioComponentSignal();
        this._untilDateRadioComponent = this._untilDateRadioComponentSignal();
        this._expiryDateInputComponent = this._expiryDateInputComponentSignal();
        this._triggerLabelComponent = this._triggerLabelComponentSignal();
        this._immediateTriggerTypeRadioComponent = this._immediateTriggerTypeRadioComponentSignal();
        this._priceTriggerTypeRadioComponent = this._priceTriggerTypeRadioComponentSignal();
        this._triggerValueLabelComponent = this._triggerValueLabelComponentSignal();
        this._triggerValueInputComponent = this._triggerValueInputComponentSignal();
        this._lastTriggerFieldRadioComponent = this._lastTriggerFieldRadioComponentSignal();
        this._bestBidTriggerFieldRadioComponent = this._bestBidTriggerFieldRadioComponentSignal();
        this._bestAskTriggerFieldRadioComponent = this._bestAskTriggerFieldRadioComponentSignal();
        this._noneTriggerMovementRadioComponent = this._noneTriggerMovementRadioComponentSignal();
        this._upTriggerMovementRadioComponent = this._upTriggerMovementRadioComponentSignal();
        this._downTriggerMovementRadioComponent = this._downTriggerMovementRadioComponentSignal();
        this._existingOrderLabelComponent = this._existingOrderLabelComponentSignal();
        this._existingOrderIdControlComponent = this._existingOrderIdControlComponentSignal();
        this._destinationAccountLabelComponent = this._destinationAccountLabelComponentSignal();
        this._destinationAccountIdControlComponent = this._destinationAccountIdControlComponentSignal();
        this._destinationAccountNameLabelComponent = this._destinationAccountNameLabelComponentSignal();
        this._errorsLabelComponent = this._errorsLabelComponentSignal();
        this._errorCountComponent = this._errorCountComponentSignal();
        this._errorsInputComponent = this._errorsInputComponentSignal();

        delay1Tick(() => this.initialiseComponents());
    }

    orderPadSet() {
        switch (this._frame.orderPad.requestTypeId) {
            case OrderRequestTypeId.Place:
                this.existingOrderVisible = false;
                this.destinationAccountVisible = false;
                break;
            case OrderRequestTypeId.Amend:
                this.existingOrderVisible = true;
                this.destinationAccountVisible = false;
                break;
            case OrderRequestTypeId.Cancel:
                this.existingOrderVisible = true;
                this.destinationAccountVisible = false;
                break;
            case OrderRequestTypeId.Move:
                this.existingOrderVisible = true;
                this.destinationAccountVisible = true;
                break;
            default:
                throw new UnreachableCaseError('PORSCOPS100009388', this._frame.orderPad.requestTypeId);
        }
        this.markForCheck();
    }

    pushAccount(uiActionStateId: UiAction.StateId, title: string | undefined, accountZenithCode: string | undefined) {
        let group: SingleBrokerageAccountGroup | undefined;
        if (accountZenithCode === undefined) {
            group = undefined;
        } else {
            group = BrokerageAccountGroup.createSingle(this._marketsService, accountZenithCode);
        }
        this._accountGroupUiAction.pushValue(group);
        this._accountGroupUiAction.pushState(uiActionStateId, title);

        this._accountNameLabelComponent.noneDisplayOverrideActive.set(!this._accountGroupUiAction.isValueOk());
    }

    pushSide(uiActionStateId: UiAction.StateId,
        title: string | undefined,
        sideId: OrderTradeTypeId | undefined,
        allowedSideIds: readonly OrderTradeTypeId[]
    ) {
        this.updateSideInputVisible(allowedSideIds);
        this._sideUiAction.pushFilter(allowedSideIds);
        this._sideUiAction.pushValue(sideId);
        this._sideUiAction.pushState(uiActionStateId, title);
    }

    pushSymbol(
        uiActionStateId: UiAction.StateId,
        title: string | undefined,
        symbol: TradingIvemId | undefined,
        allowedTradingMarkets: readonly TradingMarket[]
    ) {
        this._symbolUiAction.pushValue(symbol);
        this._symbolUiAction.pushState(uiActionStateId, title);
        this._tradingMarketUiAction.pushAllowedValues(allowedTradingMarkets);
        this._tradingMarketUiAction.pushValue(symbol === undefined ? undefined : symbol.market);
        this._tradingMarketUiAction.pushState(uiActionStateId, title);
    }

    pushTotalQuantity(uiActionStateId: UiAction.StateId, title: string | undefined, totalQuantity: Integer | undefined) {
        this._totalQuantityUiAction.pushValue(totalQuantity);
        this._totalQuantityUiAction.pushState(uiActionStateId, title);
    }

    pushTriggerType(uiActionStateId: UiAction.StateId, title: string | undefined, triggerTypeId: OrderTriggerTypeId | undefined,
        allowedTriggerTypeIds: readonly OrderTriggerTypeId[]) {
        this._triggerTypeUiAction.pushFilter(allowedTriggerTypeIds);
        this._triggerTypeUiAction.pushValue(triggerTypeId);
        this._triggerTypeUiAction.pushState(uiActionStateId, title);

        const priceTriggerTypeVisible = triggerTypeId === OrderTriggerTypeId.Price;
        if (priceTriggerTypeVisible !== this.priceTriggerTypeVisible) {
            this.priceTriggerTypeVisible = priceTriggerTypeVisible;
            this.markForCheck();
        }
    }

    pushTriggerValue(uiActionStateId: UiAction.StateId, title: string | undefined, triggerValue: Decimal | undefined) {
        this._triggerValueUiAction.pushValue(triggerValue);
        this._triggerValueUiAction.pushState(uiActionStateId, title);
    }

    pushTriggerField(uiActionStateId: UiAction.StateId, title: string | undefined, triggerFieldId: PriceOrderTrigger.FieldId | undefined) {
        this._triggerFieldUiAction.pushValue(triggerFieldId);
        this._triggerFieldUiAction.pushState(uiActionStateId, title);
    }

    pushTriggerMovement(uiActionStateId: UiAction.StateId, title: string | undefined, triggerMovementId: MovementId | undefined) {
        this._triggerMovementUiAction.pushValue(triggerMovementId);
        this._triggerMovementUiAction.pushState(uiActionStateId, title);
    }

    pushOrderType(uiActionStateId: UiAction.StateId, title: string | undefined, orderTypeId: OrderTypeId | undefined,
        allowedOrderTypeIds: readonly OrderTypeId[]) {
        this._orderTypeUiAction.pushFilter(allowedOrderTypeIds);
        this._orderTypeUiAction.pushValue(orderTypeId);
        this._orderTypeUiAction.pushState(uiActionStateId, title);
    }

    pushLimitValue(uiActionStateId: UiAction.StateId, title: string | undefined, limitValue: Decimal | undefined) {
        this._limitValueUiAction.pushValue(limitValue);
        this._limitValueUiAction.pushState(uiActionStateId, title);
    }

    pushLimitUnit(uiActionStateId: UiAction.StateId, title: string | undefined, limitUnitId: OrderPad.PriceUnitId | undefined) {
        this._limitUnitUiAction.pushValue(limitUnitId);
        this._limitUnitUiAction.pushState(uiActionStateId, title);
    }

    pushTimeInForce(uiActionStateId: UiAction.StateId, title: string | undefined, timeInForceId: TimeInForceId | undefined,
        allowedTimeInForceIds: readonly TimeInForceId[]) {
        this._timeInForceUiAction.pushFilter(allowedTimeInForceIds);
        this._timeInForceUiAction.pushValue(timeInForceId);
        this._timeInForceUiAction.pushState(uiActionStateId, title);
    }

    pushExpiryDate(uiActionStateId: UiAction.StateId, title: string | undefined, expiryDate: Date | undefined) {
        this._expiryDateUiAction.pushValue(expiryDate);
        this._expiryDateUiAction.pushState(uiActionStateId, title);
    }

    pushExistingOrderId(uiActionStateId: UiAction.StateId, title: string | undefined, existingOrderId: Order.Id | undefined) {
        this._existingOrderIdUiAction.pushValue(existingOrderId);
        this._existingOrderIdUiAction.pushState(uiActionStateId, title);
    }

    pushDestinationAccount(uiActionStateId: UiAction.StateId, title: string | undefined,
        destinationAccountZenithCode: string | undefined) {
        let group: SingleBrokerageAccountGroup | undefined;
        if (destinationAccountZenithCode === undefined) {
            group = undefined;
        } else {
            group = BrokerageAccountGroup.createSingle(this._marketsService, destinationAccountZenithCode);
        }
        this._destinationAccountGroupUiAction.pushValue(group);
        this._destinationAccountGroupUiAction.pushState(uiActionStateId, title);
    }

    pushErrors(title: string, errors: string) {
        if (errors === '') {
            this._errorsUiAction.pushValue('');
            const noErrorsText = Strings[StringId.NoErrors];
            this._errorsUiAction.pushTitle(noErrorsText);
            this._errorCountUiAction.pushTitle(noErrorsText);
        } else {
            this._errorsUiAction.pushValue(errors);
            this._errorsUiAction.pushTitle(title);
            this._errorCountUiAction.pushTitle(title);
        }
    }

    pushErrorCount(count: Integer) {
        this._errorCountUiAction.pushValue(count);
    }

    protected finalise() {
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
        this._settingsChangedSubscriptionId = undefined;

        this._existingOrderIdUiAction.finalise();
        this._accountGroupUiAction.finalise();
        this._sideUiAction.finalise();
        this._symbolUiAction.finalise();
        this._tradingMarketUiAction.finalise();
        this._totalQuantityUiAction.finalise();
        this._orderTypeUiAction.finalise();
        this._limitValueUiAction.finalise();
        this._limitUnitUiAction.finalise();
        this._triggerTypeUiAction.finalise();
        this._triggerValueUiAction.finalise();
        this._triggerFieldUiAction.finalise();
        this._triggerMovementUiAction.finalise();
        this._timeInForceUiAction.finalise();
        this._expiryDateUiAction.finalise();
        this._errorCountUiAction.finalise();
        this._errorsUiAction.finalise();

        this._frame.finalise();
    }

    private handleAccountCommitEvent() {
        const group = this._accountGroupUiAction.value;
        if (group === undefined) {
            this._frame.accountZenithcode = undefined;
        } else {
            if (group instanceof SingleBrokerageAccountGroup) {
                this._frame.accountZenithcode = group.accountZenithCode;
            } else {
                throw new AssertInternalError('PORSCHACE4444449');
            }
        }
    }

    private handleAccountEditedChangeEvent() {
        const uiAction = this._accountGroupUiAction;
        this._frame.setUiFieldErrorState(OrderPad.FieldId.Account,
            uiAction.edited, uiAction.editedValid, uiAction.editedMissing, uiAction.editedInvalidErrorText
        );
    }

    private handleSideCommitEvent() {
        this._frame.sideId = this._sideUiAction.value;
    }

    private handleSideEditedChangeEvent() {
        const uiAction = this._sideUiAction;
        this._frame.setUiFieldErrorState(OrderPad.FieldId.Side,
            uiAction.edited, uiAction.editedValid, uiAction.editedMissing, uiAction.editedInvalidErrorText
        );
    }

    private handleSymbolCommitEvent() {
        this._frame.tradingIvemId = this._symbolUiAction.value?.createCopy();
    }

    private handleTradingMarketCommitEvent() {
        this._frame.tradingMarket = this._tradingMarketUiAction.definedValue;
    }

    private handleSymbolOrRouteEditedChangeEvent() {
        const { edited, valid, missing, errorText } = this.calculateSymbolEditInfo();
        this._frame.setUiFieldErrorState(OrderPad.FieldId.Symbol, edited, valid, missing, errorText);
    }

    private handleTotalQuantityCommitEvent() {
        this._frame.totalQuantity = this._totalQuantityUiAction.value;
    }

    private handleTotalQuantityEditedChangeEvent() {
        const uiAction = this._totalQuantityUiAction;
        this._frame.setUiFieldErrorState(OrderPad.FieldId.TotalQuantity,
            uiAction.edited, uiAction.editedValid, uiAction.editedMissing, uiAction.editedInvalidErrorText
        );
    }

    private handleOrderTypeCommitEvent() {
        this._frame.orderTypeId = this._orderTypeUiAction.value;
    }

    private handleOrderTypeEditedChangeEvent() {
        const uiAction = this._orderTypeUiAction;
        this._frame.setUiFieldErrorState(OrderPad.FieldId.OrderType,
            uiAction.edited, uiAction.editedValid, uiAction.editedMissing, uiAction.editedInvalidErrorText
        );
    }

    private handleLimitValueCommitEvent() {
        this._frame.limitValue = this._decimalFactory.newUndefinableDecimal(this._limitValueUiAction.value);
    }

    private handleLimitValueEditedChangeEvent() {
        const uiAction = this._limitValueUiAction;
        this._frame.setUiFieldErrorState(OrderPad.FieldId.LimitValue,
            uiAction.edited, uiAction.editedValid, uiAction.editedMissing, uiAction.editedInvalidErrorText
        );
    }

    private handleTriggerTypeCommitEvent() {
        this._frame.triggerTypeId = this._triggerTypeUiAction.value;
    }

    private handleTriggerTypeEditedChangeEvent() {
        const uiAction = this._triggerTypeUiAction;
        this._frame.setUiFieldErrorState(OrderPad.FieldId.TriggerType,
            uiAction.edited, uiAction.editedValid, uiAction.editedMissing, uiAction.editedInvalidErrorText);
    }

    private handleTriggerValueCommitEvent() {
        this._frame.triggerValue = this._triggerValueUiAction.value;
    }

    private handleTriggerValueEditedChangeEvent() {
        const uiAction = this._triggerValueUiAction;
        this._frame.setUiFieldErrorState(OrderPad.FieldId.TriggerValue,
            uiAction.edited, uiAction.editedValid, uiAction.editedMissing, uiAction.editedInvalidErrorText
        );
    }

    private handleTriggerFieldCommitEvent() {
        this._frame.triggerField = this._triggerFieldUiAction.value;
    }

    private handleTriggerFieldEditedChangeEvent() {
        const uiAction = this._triggerFieldUiAction;
        this._frame.setUiFieldErrorState(OrderPad.FieldId.TriggerField,
            uiAction.edited, uiAction.editedValid, uiAction.editedMissing, uiAction.editedInvalidErrorText
        );
    }

    private handleTriggerMovementCommitEvent() {
        this._frame.triggerMovement = this._triggerMovementUiAction.value;
    }

    private handleTriggerMovementEditedChangeEvent() {
        const uiAction = this._triggerMovementUiAction;
        this._frame.setUiFieldErrorState(OrderPad.FieldId.TriggerMovement,
            uiAction.edited, uiAction.editedValid, uiAction.editedMissing, uiAction.editedInvalidErrorText
        );
    }

    private handleTimeInForceCommitEvent() {
        this._frame.timeInForceId = this._timeInForceUiAction.value;
    }

    private handleTimeInForceEditedChangeEvent() {
        const uiAction = this._timeInForceUiAction;
        this._frame.setUiFieldErrorState(OrderPad.FieldId.TimeInForce,
            uiAction.edited, uiAction.editedValid, uiAction.editedMissing, uiAction.editedInvalidErrorText
        );
    }

    private handleExpiryDateCommitEvent() {
        this._frame.expiryDate = newUndefinableDate(this._expiryDateUiAction.value);
    }

    private handleExpiryDateEditedChangeEvent() {
        const uiAction = this._expiryDateUiAction;
        this._frame.setUiFieldErrorState(OrderPad.FieldId.ExpiryDate,
            uiAction.edited, uiAction.editedValid, uiAction.editedMissing, uiAction.editedInvalidErrorText
        );
    }

    private handleExistingOrderIdCommitEvent() {
        this._frame.existingOrderId = this._existingOrderIdUiAction.value;
    }

    private handleExistingOrderIdEditedChangeEvent() {
        const uiAction = this._existingOrderIdUiAction;
        this._frame.setUiFieldErrorState(OrderPad.FieldId.ExistingOrder,
            uiAction.edited, uiAction.editedValid, uiAction.editedMissing, uiAction.editedInvalidErrorText
        );
    }

    private handleDestinationAccountCommitEvent() {
        const group = this._destinationAccountGroupUiAction.value;
        if (group === undefined) {
            this._frame.destinationAccountZenithCode = undefined;
        } else {
            if (group instanceof SingleBrokerageAccountGroup) {
                this._frame.destinationAccountZenithCode = group.accountZenithCode;
            } else {
                throw new AssertInternalError('PORSCHDACE2323991755');
            }
        }
    }

    private handleDestinationAccountEditedChangeEvent() {
        const uiAction = this._destinationAccountGroupUiAction;
        this._frame.setUiFieldErrorState(OrderPad.FieldId.DestinationAccount,
            uiAction.edited, uiAction.editedValid, uiAction.editedMissing, uiAction.editedInvalidErrorText
        );
    }

    private applySettings() {
        this.gridBkgdColor = this._settingsService.color.getBkgd(ColorScheme.ItemId.Grid_Base);
        this.gridAltBkgdColor = this._settingsService.color.getBkgd(ColorScheme.ItemId.Grid_BaseAlt);
        this.markForCheck();
    }

    private calculateSymbolEditInfo(): PadOrderRequestStepNgComponent.SymbolFieldEditInfo {
        const edited = this._symbolUiAction.edited || this._tradingMarketUiAction.edited;
        const valid = this._symbolUiAction.editedValid && this._tradingMarketUiAction.editedValid;
        const missing = this._symbolUiAction.editedMissing || this._tradingMarketUiAction.editedMissing;
        let errorText: string | undefined;
        if (this._symbolUiAction.editedInvalidErrorText === undefined) {
            if (this._tradingMarketUiAction.editedInvalidErrorText === undefined) {
                errorText = undefined;
            } else {
                errorText = this._tradingMarketUiAction.editedInvalidErrorText;
            }
        } else {
            if (this._tradingMarketUiAction.editedInvalidErrorText === undefined) {
                errorText = this._symbolUiAction.editedInvalidErrorText;
            } else {
                errorText = `${this._symbolUiAction.editedInvalidErrorText} | ${this._tradingMarketUiAction.editedInvalidErrorText}`;
            }
        }
        return { edited, valid, missing, errorText };
    }

    private setCommonActionProperties(action: UiAction) {
        action.commitOnAnyValidInput = true; // want all valid input
        action.autoEchoCommit = false; // echo is handled by OrderPad
        action.autoAcceptanceTypeId = UiAction.AutoAcceptanceTypeId.None; // OrderPad will push acceptance
        action.autoInvalid = false; // PadOrderRequestStepFrame will push Invalid state
    }

    private createAccountIdUiAction() {
        const action = new BrokerageAccountGroupUiAction();
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.SelectAccountTitle]);
        action.pushCaption(Strings[StringId.OrderPadAccountCaption]);
        action.commitEvent = () => this.handleAccountCommitEvent();
        action.editedChangeEvent = () => this.handleAccountEditedChangeEvent();
        action.pushPlaceholder(Strings[StringId.BrokerageAccountIdInputPlaceholderText]);
        return action;
    }

    private getSideTitleStringId(sideId: OrderTradeTypeId) {
        switch (sideId) {
            case OrderTradeTypeId.Buy: return StringId.OrderPadSideTitle_Buy;
            case OrderTradeTypeId.Sell: return StringId.OrderPadSideTitle_Sell;
            case OrderTradeTypeId.IntraDayShortSell: return StringId.OrderPadSideTitle_IntraDayShortSell;
            case OrderTradeTypeId.RegulatedShortSell: return StringId.OrderPadSideTitle_RegulatedShortSell;
            case OrderTradeTypeId.ProprietaryShortSell: return StringId.OrderPadSideTitle_ProprietaryShortSell;
            case OrderTradeTypeId.ProprietaryDayTrade: return StringId.OrderPadSideTitle_ProprietaryDayTrade;
            default: return StringId.UnknownDisplayString;
        }
    }

    private createSideUiAction() {
        const action = new IntegerListSelectItemUiAction();
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.OrderPadSideTitle]);
        action.pushCaption(Strings[StringId.OrderPadSideCaption]);
        const sideIds = OrderTradeType.all;
        const list = sideIds.map<IntegerListSelectItemUiAction.ItemProperties>(
            (sideId) => {
                const titleStringId = this.getSideTitleStringId(sideId);
                return {
                    item: sideId,
                    caption: OrderTradeType.idToDisplay(sideId),
                    title: Strings[titleStringId],
                };
            }
        );
        action.pushList(list, undefined);
        action.commitEvent = () => this.handleSideCommitEvent();
        action.editedChangeEvent = () => this.handleSideEditedChangeEvent();
        return action;
    }

    private createSymbolUiAction() {
        const action = new TradingIvemIdUiAction(this._marketsService.tradingMarkets);
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.OrderPadSymbolTitle]);
        action.pushCaption(Strings[StringId.OrderPadSymbolCaption]);
        action.commitEvent = () => this.handleSymbolCommitEvent();
        action.editedChangeEvent = () => this.handleSymbolOrRouteEditedChangeEvent();
        return action;
    }

    private createTradingMarketUiAction() {
        const action = new TradingMarketUiAction(this._marketsService.tradingMarkets);
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.OrderPadRouteTitle]);
        action.commitEvent = () => this.handleTradingMarketCommitEvent();
        action.editedChangeEvent = () => this.handleSymbolOrRouteEditedChangeEvent();
        return action;
    }

    private createTotalQuantityUiAction() {
        const action = new IntegerUiAction();
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.OrderPadTotalQuantityTitle]);
        action.pushCaption(Strings[StringId.OrderPadTotalQuantityCaption]);
        action.commitEvent = () => this.handleTotalQuantityCommitEvent();
        action.editedChangeEvent = () => this.handleTotalQuantityEditedChangeEvent();
        return action;
    }

    private getOrderTypeTitleStringId(orderTypeId: OrderTypeId) {
        switch (orderTypeId) {
            case OrderTypeId.Market: return StringId.OrderPadOrderTypeTitle_Market;
            case OrderTypeId.MarketToLimit: return StringId.OrderPadOrderTypeTitle_MarketToLimit;
            case OrderTypeId.Limit: return StringId.OrderPadOrderTypeTitle_Limit;
            case OrderTypeId.MarketAtBest: return StringId.OrderPadOrderTypeTitle_MarketAtBest;
            default: return StringId.UnknownDisplayString;
        }
    }

    private createOrderTypeUiAction() {
        const action = new IntegerListSelectItemUiAction();
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.OrderPadOrderTypeTitle]);
        action.pushCaption(Strings[StringId.OrderPadOrderTypeCaption]);
        const orderTypeIds: OrderTypeId[] = [OrderTypeId.Market, OrderTypeId.MarketToLimit, OrderTypeId.Limit, OrderTypeId.MarketAtBest];
        const list = orderTypeIds.map<IntegerListSelectItemUiAction.ItemProperties>(
            (orderTypeId) => {
                const titleStringId = this.getOrderTypeTitleStringId(orderTypeId);
                return {
                    item: orderTypeId,
                    caption: OrderType.idToDisplay(orderTypeId),
                    title: Strings[titleStringId],
                };
            }
        );
        action.pushList(list, undefined);
        action.commitEvent = () => this.handleOrderTypeCommitEvent();
        action.editedChangeEvent = () => this.handleOrderTypeEditedChangeEvent();
        return action;
    }

    private createLimitValueUiAction() {
        const action = new DecimalUiAction(this._decimalFactory);
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.OrderPadLimitValueTitle]);
        action.pushCaption(Strings[StringId.OrderPadLimitValueCaption]);
        action.commitEvent = () => this.handleLimitValueCommitEvent();
        action.editedChangeEvent = () => this.handleLimitValueEditedChangeEvent();
        return action;
    }

    private createLimitUnitUiAction() {
        const action = new IntegerListSelectItemUiAction();
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.OrderPadLimitUnitTitle]);
        const priceUnitIds: OrderPad.PriceUnitId[] = OrderPad.PriceUnit.all;
        const list = priceUnitIds.map<IntegerListSelectItemUiAction.ItemProperties>(
            (priceUnitId) => (
                {
                    item: priceUnitId,
                    caption: '$',
                    title: '', /*OrderPad.PriceUnit.idToDisplay(priceUnitId)*/
                }
            )
        );
        action.pushList(list, undefined);
        return action;
    }

    private getTriggerTypeTitleStringId(triggerTypeId: OrderTriggerTypeId) {
        switch (triggerTypeId) {
            case OrderTriggerTypeId.Immediate: return StringId.OrderPadTriggerTypeTitle_Immediate;
            case OrderTriggerTypeId.Price: return StringId.OrderPadTriggerTypeTitle_Price;
            case OrderTriggerTypeId.TrailingPrice: return StringId.OrderPadTriggerTypeTitle_TrailingPrice;
            case OrderTriggerTypeId.PercentageTrailingPrice: return StringId.OrderPadTriggerTypeTitle_PercentageTrailingPrice;
            case OrderTriggerTypeId.Overnight: return StringId.OrderPadTriggerTypeTitle_Overnight;
            default: throw new UnreachableCaseError('OPDCGTTTD3886439', triggerTypeId);
        }
    }

    private createTriggerTypeUiAction() {
        const action = new IntegerListSelectItemUiAction();
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.OrderPadTriggerTitle]);
        action.pushCaption(Strings[StringId.OrderPadTriggerCaption]);
        const triggerTypeIds = OrderTriggerType.all;
        const list = triggerTypeIds.map<IntegerListSelectItemUiAction.ItemProperties>(
            (triggerTypeId) => {
                const titleStringId = this.getTriggerTypeTitleStringId(triggerTypeId);
                return {
                    item: triggerTypeId,
                    caption: OrderTriggerType.idToDisplay(triggerTypeId),
                    title: Strings[titleStringId],
                };
            }
        );
        action.pushList(list, undefined);
        action.commitEvent = () => this.handleTriggerTypeCommitEvent();
        action.editedChangeEvent = () => this.handleTriggerTypeEditedChangeEvent();
        return action;
    }

    private createTriggerValueUiAction() {
        const action = new DecimalUiAction(this._decimalFactory);
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.OrderPadTriggerValueTitle]);
        action.pushCaption(Strings[StringId.OrderPadTriggerValueCaption]);
        action.commitEvent = () => this.handleTriggerValueCommitEvent();
        action.editedChangeEvent = () => this.handleTriggerValueEditedChangeEvent();
        return action;
    }

    private getTriggerFieldTitleStringId(triggerFieldId: PriceOrderTrigger.FieldId) {
        switch (triggerFieldId) {
            case PriceOrderTrigger.FieldId.Last: return StringId.OrderPadTriggerFieldTitle_Last;
            case PriceOrderTrigger.FieldId.BestBid: return StringId.OrderPadTriggerFieldTitle_BestBid;
            case PriceOrderTrigger.FieldId.BestAsk: return StringId.OrderPadTriggerFieldTitle_BestAsk;
            default: throw new UnreachableCaseError('OPDCGTFTSI677400022', triggerFieldId);
        }
    }

    private createTriggerFieldUiAction() {
        const action = new IntegerListSelectItemUiAction();
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.OrderPadTriggerFieldTitle]);
        action.pushCaption(Strings[StringId.OrderPadTriggerFieldCaption]);
        const triggerFieldIds = PriceOrderTrigger.Field.all;
        const list = triggerFieldIds.map<IntegerListSelectItemUiAction.ItemProperties>(
            (triggerFieldId) => {
                const titleStringId = this.getTriggerFieldTitleStringId(triggerFieldId);
                return {
                    item: triggerFieldId,
                    caption: PriceOrderTrigger.Field.idToDisplay(triggerFieldId),
                    title: Strings[titleStringId],
                };
            }
        );
        action.pushList(list, undefined);
        action.commitEvent = () => this.handleTriggerFieldCommitEvent();
        action.editedChangeEvent = () => this.handleTriggerFieldEditedChangeEvent();
        return action;
    }

    private getTriggerMovementTitleStringId(movementId: MovementId) {
        switch (movementId) {
            case MovementId.None: return StringId.OrderApiTriggerMovementTitle_None;
            case MovementId.Up: return StringId.OrderApiTriggerMovementTitle_Up;
            case MovementId.Down: return StringId.OrderApiTriggerMovementTitle_Down;
            default: throw new UnreachableCaseError('OPDCGTMTSI49226888', movementId);
        }
    }

    private createTriggerMovementUiAction() {
        const action = new IntegerListSelectItemUiAction();
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.OrderPadTriggerMovementTitle]);
        action.pushCaption(Strings[StringId.OrderPadTriggerMovementCaption]);
        const movementIds = Movement.all;
        const list = movementIds.map<IntegerListSelectItemUiAction.ItemProperties>(
            (movementId) => {
                const titleStringId = this.getTriggerMovementTitleStringId(movementId);
                return {
                    item: movementId,
                    caption: Movement.idToDisplay(movementId),
                    title: Strings[titleStringId],
                };
            }
        );
        action.pushList(list, undefined);
        action.commitEvent = () => this.handleTriggerMovementCommitEvent();
        action.editedChangeEvent = () => this.handleTriggerMovementEditedChangeEvent();
        return action;
    }

    private getTimeInForceTitleStringId(timeInForceId: TimeInForceId) {
        switch (timeInForceId) {
            case TimeInForceId.Day: return StringId.OrderPadTimeInForceTitle_Day;
            case TimeInForceId.GoodTillCancel: return StringId.OrderPadTimeInForceTitle_GoodTillCancel;
            case TimeInForceId.AtTheOpening: return StringId.OrderPadTimeInForceTitle_AtTheOpening;
            case TimeInForceId.FillAndKill: return StringId.OrderPadTimeInForceTitle_FillAndKill;
            case TimeInForceId.FillOrKill: return StringId.OrderPadTimeInForceTitle_FillOrKill;
            case TimeInForceId.AllOrNone: return StringId.OrderPadTimeInForceTitle_AllOrNone;
            case TimeInForceId.GoodTillCrossing: return StringId.OrderPadTimeInForceTitle_GoodTillCrossing;
            case TimeInForceId.GoodTillDate: return StringId.OrderPadTimeInForceTitle_GoodTillDate;
            case TimeInForceId.AtTheClose: return StringId.OrderPadTimeInForceTitle_AtTheClose;
            default: throw new UnreachableCaseError('OPDCGTIFTSI599834', timeInForceId);
        }
    }

    private createTimeInForceUiAction() {
        const action = new IntegerListSelectItemUiAction();
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.OrderPadTimeInForceTitle]);
        action.pushCaption(Strings[StringId.OrderPadTimeInForceCaption]);
        const timeInForceIds = TimeInForce.all;
        const list = timeInForceIds.map<IntegerListSelectItemUiAction.ItemProperties>(
            (timeInForceId) => {
                const titleStringId = this.getTimeInForceTitleStringId(timeInForceId);
                return {
                    item: timeInForceId,
                    caption: TimeInForce.idToDisplay(timeInForceId),
                    title: Strings[titleStringId],
                };
            }
        );
        action.pushList(list, undefined);
        action.commitEvent = () => this.handleTimeInForceCommitEvent();
        action.editedChangeEvent = () => this.handleTimeInForceEditedChangeEvent();
        return action;
    }

    private createExpiryDateUiAction() {
        const action = new DateUiAction();
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.OrderPadExpiryDateTitle]);
        action.pushCaption(Strings[StringId.OrderPadExpiryDateCaption]);
        action.commitEvent = () => this.handleExpiryDateCommitEvent();
        action.editedChangeEvent = () => this.handleExpiryDateEditedChangeEvent();
        return action;
    }

    private createExistingOrderIdUiAction() {
        const action = new StringUiAction();
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.OrderPadExistingOrderIdTitle]);
        action.pushCaption(Strings[StringId.OrderPadExistingOrderIdCaption]);
        action.commitEvent = () => this.handleExistingOrderIdCommitEvent();
        action.editedChangeEvent = () => this.handleExistingOrderIdEditedChangeEvent();
        return action;
    }

    private createDestinationAccountIdUiAction() {
        const action = new BrokerageAccountGroupUiAction();
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.OrderPadDestinationAccountTitle]);
        action.pushCaption(Strings[StringId.OrderPadDestinationAccountCaption]);
        action.commitEvent = () => this.handleDestinationAccountCommitEvent();
        action.editedChangeEvent = () => this.handleDestinationAccountEditedChangeEvent();
        action.pushPlaceholder(Strings[StringId.BrokerageAccountIdInputPlaceholderText]);
        return action;
    }

    private createErrorCountUiAction() {
        const action = new IntegerUiAction();
        action.pushTitle(Strings[StringId.NoErrors]);
        return action;
    }

    private createErrorsUiAction() {
        const action = new StringUiAction();
        action.pushTitle(Strings[StringId.NoErrors]);
        action.pushCaption(Strings[StringId.OrderPadErrorsCaption]);
        return action;
    }

    private initialiseUiFieldErrorState(fieldId: OrderPad.FieldId, action: UiAction) {
        this._frame.initialiseUiFieldErrorState(fieldId,
            action.edited, action.editedValid, action.editedMissing, action.editedInvalidErrorText
        );
    }

    private initialiseComponents() {
        this._accountLabelComponent.initialise(this._accountGroupUiAction);
        this._accountIdInputComponent.initialise(this._accountGroupUiAction);
        this._accountNameLabelComponent.initialise(this._accountGroupUiAction);
        this._sideLabelComponent.initialise(this._sideUiAction);
        this._buySideRadioComponent.initialiseEnum(this._sideUiAction, OrderTradeTypeId.Buy);
        this._sellSideRadioComponent.initialiseEnum(this._sideUiAction, OrderTradeTypeId.Sell);
        this._sideInputComponent.initialise(this._sideUiAction);
        this._symbolLabelComponent.initialise(this._symbolUiAction);
        this._symbolControlComponent.initialise(this._symbolUiAction);
        this._symbolNameLabelComponent.initialise(this._symbolUiAction);
        this._tradingMarketControlComponent.initialise(this._tradingMarketUiAction);
        this._quantityLabelComponent.initialise(this._totalQuantityUiAction);
        this._quantityInputComponent.initialise(this._totalQuantityUiAction);
        this._orderTypeLabelComponent.initialise(this._orderTypeUiAction);
        this._limitOrderTypeRadioComponent.initialiseEnum(this._orderTypeUiAction, OrderTypeId.Limit);
        this._marketOrderTypeRadioComponent.initialiseEnum(this._orderTypeUiAction, OrderTypeId.Market);
        this._orderTypeInputComponent.initialise(this._orderTypeUiAction);
        this._priceLabelComponent.initialise(this._limitValueUiAction);
        this._limitValueInputComponent.initialise(this._limitValueUiAction);
        this._limitUnitLabelComponent.initialise(this._limitUnitUiAction);
        this._timeInForceLabelComponent.initialise(this._timeInForceUiAction);
        this._untilCancelRadioComponent.initialiseEnum(this._timeInForceUiAction, TimeInForceId.GoodTillCancel);
        this._fillAndKillRadioComponent.initialiseEnum(this._timeInForceUiAction, TimeInForceId.FillAndKill);
        this._fillOrKillRadioComponent.initialiseEnum(this._timeInForceUiAction, TimeInForceId.FillOrKill);
        this._dayRadioComponent.initialiseEnum(this._timeInForceUiAction, TimeInForceId.Day);
        this._untilDateRadioComponent.initialiseEnum(this._timeInForceUiAction, TimeInForceId.GoodTillDate);
        this._expiryDateInputComponent.initialise(this._expiryDateUiAction);
        this._triggerLabelComponent.initialise(this._triggerTypeUiAction);
        this._immediateTriggerTypeRadioComponent.initialiseEnum(this._triggerTypeUiAction, OrderTriggerTypeId.Immediate);
        this._priceTriggerTypeRadioComponent.initialiseEnum(this._triggerTypeUiAction, OrderTriggerTypeId.Price);
        // this._triggerTypeInputComponent.initialise(this._triggerTypeUiAction);
        this._triggerValueLabelComponent.initialise(this._triggerValueUiAction);
        this._triggerValueInputComponent.initialise(this._triggerValueUiAction);
        this._lastTriggerFieldRadioComponent.initialiseEnum(this._triggerFieldUiAction, PriceOrderTrigger.FieldId.Last);
        this._bestBidTriggerFieldRadioComponent.initialiseEnum(this._triggerFieldUiAction, PriceOrderTrigger.FieldId.BestBid);
        this._bestAskTriggerFieldRadioComponent.initialiseEnum(this._triggerFieldUiAction, PriceOrderTrigger.FieldId.BestAsk);
        // this._triggerFieldSelectComponent.initialise(this._triggerFieldUiAction);
        this._noneTriggerMovementRadioComponent.initialiseEnum(this._triggerMovementUiAction, MovementId.None);
        this._upTriggerMovementRadioComponent.initialiseEnum(this._triggerMovementUiAction, MovementId.Up);
        this._downTriggerMovementRadioComponent.initialiseEnum(this._triggerMovementUiAction, MovementId.Down);
        this._existingOrderLabelComponent.initialise(this._existingOrderIdUiAction);
        this._existingOrderIdControlComponent.initialise(this._existingOrderIdUiAction);
        this._destinationAccountLabelComponent.initialise(this._destinationAccountGroupUiAction);
        this._destinationAccountIdControlComponent.initialise(this._destinationAccountGroupUiAction);
        this._destinationAccountNameLabelComponent.initialise(this._destinationAccountGroupUiAction);
        this._errorsLabelComponent.initialise(this._errorsUiAction);
        this._errorCountComponent.initialise(this._errorCountUiAction);
        this._errorCountComponent.readonlyAlways = true;
        this._errorsInputComponent.initialise(this._errorsUiAction);
        this._errorsInputComponent.readonlyAlways = true;
        // this._noErrorsLabelComponent.initialise(this._noErrorsUiAction);
    }

    private updateSideInputVisible(allowedSideIds: readonly OrderTradeTypeId[]) {
        let sideInputVisible = false;
        const count = allowedSideIds.length;
        for (let i = 0; i < count; i++) {
            const allowedSideId = allowedSideIds[i];
            if (allowedSideId !== OrderTradeTypeId.Buy && allowedSideId !== OrderTradeTypeId.Sell) {
                sideInputVisible = true;
                break;
            }
        }
        if (sideInputVisible !== this.sideInputVisible) {
            this.sideInputVisible = sideInputVisible;
            this.markForCheck();
        }
    }
}

export namespace PadOrderRequestStepNgComponent {
    export namespace JsonName {
        export const content = 'content';
    }

    export const latestLayoutConfigJsonProtocol = '1';

    export interface SymbolFieldEditInfo {
        edited: boolean;
        valid: boolean;
        missing: boolean;
        errorText: string | undefined;
    }
}
