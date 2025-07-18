import { AssertInternalError, DecimalFactory, Integer, JsonElement, MultiEvent, UnreachableCaseError } from '@pbkware/js-utils';
import {
    AdiService,
    AllOrdersDataDefinition,
    AllOrdersDataItem,
    BrokerageAccountGroup,
    CommandRegisterService,
    DataIvemId,
    MarketsService,
    OrderPad,
    OrderRequestDataDefinition,
    OrderRequestTypeId,
    SettingsService,
    SymbolDetailCacheService,
    SymbolsService
} from '@plxtra/motif-core';
import { OrderRequestStepFrame, PadOrderRequestStepFrame, ResultOrderRequestStepFrame, ReviewOrderRequestStepFrame } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class OrderRequestDitemFrame extends BuiltinDitemFrame {
    private _activeFrame: OrderRequestStepFrame | undefined;

    private _padFrame: PadOrderRequestStepFrame | undefined;
    private _padConfigJsonElement: JsonElement | undefined;
    private _reviewFrame: ReviewOrderRequestStepFrame | undefined;
    private _reviewConfigJsonElement: JsonElement | undefined;
    private _resultFrame: ResultOrderRequestStepFrame | undefined;
    private _resultConfigJsonElement: JsonElement | undefined;
    private _lastResultOrderMapKey: string | undefined;

    private _reviewEnabled: boolean;
    private _stepId: OrderRequestStepFrame.StepId;
    private _orderPad: OrderPad;
    private _orderRequestDataDefinition: OrderRequestDataDefinition | undefined;

    private _initialised = false;
    private _initialOrderPad: OrderPad | undefined;
    private _orderPadSendable = false;

    private _symbolAccountIncomingLinkable = false;
    private _reviewZenithMessageActive = false;

    private _dataIvemIdbrokerageAccountGroupApplying: boolean;

    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        private readonly _componentAccess: OrderRequestDitemFrame.ComponentAccess,
        private readonly _decimalFactory: DecimalFactory,
        settingsService: SettingsService,
        marketsService: MarketsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
        private readonly _symbolDetailCacheService: SymbolDetailCacheService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.OrderRequest, _componentAccess, settingsService, marketsService, commandRegisterService, desktopAccessService,
            symbolsService, adiService
        );

        this._settingsChangedSubscriptionId = this.settingsService.subscribeSettingsChangedEvent(() => this.handleSettingsChangedEvent());
        this._reviewEnabled = this.settingsService.scalar.orderPad_ReviewEnabled;
    }

    get initialised() { return this._initialised; }
    get stepId() { return this._stepId; }
    get orderPad() { return this._orderPad; }
    get symbolAccountIncomingLinkable() { return this._symbolAccountIncomingLinkable; }

    initialise(frameElement: JsonElement | undefined) {
        if (frameElement !== undefined) {
            const padConfigJsonElementResult = frameElement.tryGetElement(OrderRequestDitemFrame.JsonName.pad);
            if (padConfigJsonElementResult.isErr()) {
                this._padConfigJsonElement = undefined;
            } else {
                this._padConfigJsonElement = padConfigJsonElementResult.value;
            }

            const reviewConfigJsonElementResult = frameElement.tryGetElement(OrderRequestDitemFrame.JsonName.review);
            if (reviewConfigJsonElementResult.isErr()) {
                this._reviewConfigJsonElement = undefined;
            } else {
                this._reviewConfigJsonElement = reviewConfigJsonElementResult.value;
            }

            const resultConfigJsonElementResult = frameElement.tryGetElement(OrderRequestDitemFrame.JsonName.result);
            if (resultConfigJsonElementResult.isErr()) {
                this._resultConfigJsonElement = undefined;
            } else {
                this._resultConfigJsonElement = resultConfigJsonElementResult.value;
            }
        }

        if (this._initialOrderPad === undefined) {
            this.newOrderPad();
        } else {
            const symbolAccountIncomingLinkable = this._initialOrderPad.requestTypeId === OrderRequestTypeId.Place &&
                this._initialOrderPad.tradingIvemId === undefined;
            this.applyOrderPad(this._initialOrderPad, symbolAccountIncomingLinkable);
        }

        this._initialOrderPad = undefined; // not needed anymore

        this._initialised = true;

        this.applyLinked();
    }

    override finalise() {
        this.settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);

        this.finaliseOrderPad();
        super.finalise();
    }

    override save(element: JsonElement) {
        super.save(element);

        // save this config - if any

        element.setElement(OrderRequestDitemFrame.JsonName.pad, this._padConfigJsonElement);
        element.setElement(OrderRequestDitemFrame.JsonName.review, this._reviewConfigJsonElement);
        element.setElement(OrderRequestDitemFrame.JsonName.result, this._resultConfigJsonElement);
    }

    newOrderPad() {
        const orderPad = new OrderPad(this._decimalFactory, this._marketsService, this._symbolDetailCacheService, this.adiService);
        orderPad.loadPlace();
        orderPad.applySettingsDefaults(this.settingsService.scalar);
        if (this.brokerageAccountGroupLinked) {
            const group = this.brokerageAccountGroup;
            if (group !== undefined) {
                if (BrokerageAccountGroup.isSingle(group)) {
                    orderPad.accountZenithCode = group.accountZenithCode;
                }
            }
        }
        if (this.dataIvemIdLinked) {
            const dataIvemId = this.dataIvemId;
            if (dataIvemId !== undefined) {
                const bestTradingIvemId = this.symbolsService.tryGetBestTradingIvemIdFromDataIvemId(dataIvemId);
                if (bestTradingIvemId !== undefined) {
                    orderPad.tradingIvemId = bestTradingIvemId;
                }
            }
        }
        this.applyOrderPad(orderPad, true);
    }

    newPlaceOrderPadFromPrevious() {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._orderPad === undefined) {
            throw new AssertInternalError('ORDFNPOIPFP583288822');
        } else {
            const orderPad = new OrderPad(this._decimalFactory, this._marketsService, this._symbolDetailCacheService, this.adiService);
            orderPad.beginChanges();
            try {
                orderPad.loadPlace(this._orderPad.accountZenithCode);
                orderPad.sideId = this._orderPad.sideId;
                orderPad.tradingIvemId = this._orderPad.tradingIvemId?.createCopy();
                orderPad.totalQuantity = this._orderPad.totalQuantity;
                orderPad.orderTypeId = this._orderPad.orderTypeId;
                orderPad.triggerTypeId = this._orderPad.triggerTypeId;
                orderPad.triggerValue = this._orderPad.triggerValue;
                orderPad.triggerFieldId = this._orderPad.triggerFieldId;
                orderPad.triggerMovementId = this._orderPad.triggerMovementId;
                orderPad.limitValue = this._orderPad.limitValue;
                orderPad.timeInForceId = this._orderPad.timeInForceId;
                orderPad.expiryDate = this._orderPad.expiryDate;
            } finally {
                orderPad.endChanges();
            }

            this.applyOrderPad(orderPad, false);
        }
    }

    newAmendOrderPadFromResult() {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._orderPad === undefined) {
            throw new AssertInternalError('ORDFNAOIPFP68444723');
        } else {
            if (this._orderPad.requestTypeId !== OrderRequestTypeId.Cancel) {
                if (this._lastResultOrderMapKey !== undefined) {
                    const definition = new AllOrdersDataDefinition();
                    const ordersDataItem = this.adiService.subscribe(definition) as AllOrdersDataItem;
                    try {
                        const order = ordersDataItem.getRecordByMapKey(this._lastResultOrderMapKey);
                        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
                        if (order !== undefined && order.canAmend()) {
                            const orderPad = new OrderPad(this._decimalFactory, this._marketsService, this._symbolDetailCacheService, this.adiService);
                            orderPad.loadAmendFromOrder(order);
                            this.applyOrderPad(orderPad, false);
                        }
                    } finally {
                        this.adiService.unsubscribe(ordersDataItem);
                    }
                }
            }
        }
    }

    setOrderPad(pad: OrderPad) {
        if (this._initialised) {
            this.applyOrderPad(pad, false);
        } else {
            this._initialOrderPad = pad;
        }
    }

    review() {
        if (this._stepId !== OrderRequestStepFrame.StepId.Pad ||
            !this.settingsService.scalar.orderPad_ReviewEnabled ||
            !this._reviewEnabled ||
            this._padFrame === undefined
        ) {
            throw new AssertInternalError('ORDFR333818842', this._stepId.toString());
        } else {
            const invalidFieldIds = this._orderPad.getInvalidFieldIds();
            const errorCount = this._padFrame.errorCount;
            if (invalidFieldIds.length !== 0 || errorCount !== 0 || !this._orderPadSendable) {
                throw new AssertInternalError('ORDFS1212223', `${invalidFieldIds.length}, ${errorCount}`);
            } else {
                this.setLastResultOrderMapKey(undefined);
                this._orderPad.setReadonly();
                this._orderRequestDataDefinition = this._orderPad.createOrderRequestDataDefinition();
                this.setStepId(OrderRequestStepFrame.StepId.Review, false);
            }
        }
    }

    back() {
        if (this._stepId !== OrderRequestStepFrame.StepId.Review || !this._reviewEnabled) {
            throw new AssertInternalError('ORDFB3433818842', this._stepId.toString());
        } else {
            this._orderPad.setWritable();
            this.showPad(false);
        }
    }

    send() {
        if (!this.canSendFromStep()) {
            throw new AssertInternalError('ORDFR333818842', `${this._stepId} ${this._reviewEnabled}`);
        } else {
            this.setLastResultOrderMapKey(undefined);
            this._orderPad.setReadonly();
            const invalidFieldIds = this._orderPad.getInvalidFieldIds();
            const errorCount = this._padFrame === undefined ? 0 : this._padFrame.errorCount;
            if (invalidFieldIds.length !== 0 || errorCount !== 0 || !this._orderPadSendable) {
                let msg = `Send: Invalid count: ${invalidFieldIds.length.toString(10)}`;
                if (errorCount !== 0) {
                    msg += `, Error count: ${errorCount}`;
                }
                this._componentAccess.pushSendEnabled(false);
                this.setStepId(OrderRequestStepFrame.StepId.Review, false);
                throw new AssertInternalError('ORDFS1212223', msg);
            } else {
                if (this._orderRequestDataDefinition !== undefined && this._stepId !== OrderRequestStepFrame.StepId.Review) {
                    throw new AssertInternalError('ORDFS89884472255');
                } else {
                    if (this._orderRequestDataDefinition === undefined) {
                        if (this._stepId !== OrderRequestStepFrame.StepId.Pad) {
                            throw new AssertInternalError('ORDFS898844722');
                        } else {
                            this._orderRequestDataDefinition = this._orderPad.createOrderRequestDataDefinition();
                        }
                    }
                    this.setStepId(OrderRequestStepFrame.StepId.Result, false);
                    if (this._reviewEnabled) {
                        this._componentAccess.pushBackButtonEnabled(false);
                    }
                    this._componentAccess.pushSendEnabled(false);
                }
            }
        }
    }

    setActiveStepFrame(frame: OrderRequestStepFrame) {
        if (frame !== this._activeFrame) {
            this.checkUnbindActiveFrame();

            this._activeFrame = frame;
            this.bindActiveFrame();
        }
    }

    setReviewZenithMessageActive(value: boolean) {
        if (this._reviewFrame === undefined) {
            throw new AssertInternalError('ORDIFSRZMA77754359');
        } else {
            this._reviewFrame.setZenithMessageActive(value);
        }
    }

    protected override applyDataIvemId(dataIvemId: DataIvemId | undefined, selfInitiated: boolean) {
        if (!this._symbolAccountIncomingLinkable || this._dataIvemIdbrokerageAccountGroupApplying) {
            return false;
        } else {
            this._dataIvemIdbrokerageAccountGroupApplying = true;
            try {
                // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
                if (selfInitiated || (this._padFrame !== undefined && this._padFrame.dataIvemIdSetting)) {
                    // To avoid routedIvemId <-> dataIvemId conversion issues, routedIvemIds are immediately set in OrderPad
                    // Also, applyDataIvemId is used when applying new orderpad
                    return super.applyDataIvemId(dataIvemId, selfInitiated);
                } else {
                    if (dataIvemId === undefined) {
                        return false;
                    } else {
                        const bestTradingIvemId = this.symbolsService.tryGetBestTradingIvemIdFromDataIvemId(dataIvemId);
                        if (bestTradingIvemId === undefined) {
                            return false;
                        } else {
                            this._orderPad.tradingIvemId = bestTradingIvemId;
                            return super.applyDataIvemId(dataIvemId, selfInitiated);
                        }
                    }
                }
            } finally {
                this._dataIvemIdbrokerageAccountGroupApplying = false;
            }
        }
    }

    protected override applyBrokerageAccountGroup(group: BrokerageAccountGroup | undefined, selfInitiated: boolean) {
        if (!this._symbolAccountIncomingLinkable || this._dataIvemIdbrokerageAccountGroupApplying) {
            return false;
        } else {
            this._dataIvemIdbrokerageAccountGroupApplying = true;
            try {
                // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
                if (selfInitiated || (this._padFrame !== undefined && this._padFrame.brokerageAccountGroupSetting)) {
                    // to avoid accountId <-> BrokerageAccountGroup conversion issues, accountIds are immediately set in OrderPad
                    // Also, applyBrokerageAccountGroup is used when applying new orderpad
                    return super.applyBrokerageAccountGroup(group, selfInitiated);
                } else {
                    if (group === undefined) {
                        return false;
                    } else {
                        if (!BrokerageAccountGroup.isSingle(group)) {
                            return false;
                        } else {
                            this._orderPad.accountZenithCode = group.accountZenithCode;
                            return super.applyBrokerageAccountGroup(group, selfInitiated);
                        }
                    }
                }
            } finally {
                this._dataIvemIdbrokerageAccountGroupApplying = false;
            }
        }
    }

    private handleSettingsChangedEvent() {
        if (this._stepId === OrderRequestStepFrame.StepId.Pad) {
            this.checkPushPadReviewEnabled(false);
        }
    }

    private handlePadDataIvemIdSetEvent(dataIvemId: DataIvemId | undefined) {
        this.setDataIvemIdFromDitem(dataIvemId);
    }

    private handlePadBrokerageAccountGroupSetEvent(group: BrokerageAccountGroup | undefined) {
        this.setBrokerageAccountGroupFromDitem(group);
    }

    private handlePadErrorCountChangeEvent(count: Integer) {
        const orderPadSendable = count === 0;
        if (orderPadSendable !== this._orderPadSendable) {
            this._orderPadSendable = orderPadSendable;
            switch (this._stepId) {
                case OrderRequestStepFrame.StepId.Pad: {
                    if (this._reviewEnabled) {
                        this._componentAccess.pushReviewEnabled(orderPadSendable);
                    } else {
                        this._componentAccess.pushSendEnabled(orderPadSendable);
                    }
                    break;
                }
                case OrderRequestStepFrame.StepId.Review: {
                    this._componentAccess.pushSendEnabled(orderPadSendable);
                    break;
                }
                case OrderRequestStepFrame.StepId.Result: {
                    // no action
                    break;
                }
            }
        }
    }

    private handleResultOrderBecameAvailableEvent(orderMapKey: string) {
        this.setLastResultOrderMapKey(orderMapKey);
    }

    private finaliseOrderPad() {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._orderPad !== undefined) {
            this._orderPad.finalise();
        }
    }

    private applyOrderPad(orderPad: OrderPad, symbolAccountIncomingLinkable: boolean) {
        this.finaliseOrderPad();

        this._orderPadSendable = false;
        this._componentAccess.pushSendEnabled(false);

        this._orderPad = orderPad;
        this._componentAccess.orderPadApplied();

        if (this._padFrame === undefined) {
            this.showPad(symbolAccountIncomingLinkable);
        } else {
            this._padFrame.setOrderPad(this._orderPad);
            this.checkPushPadReviewEnabled(true);
            this.setSymbolAccountIncomingLinkable(symbolAccountIncomingLinkable);
        }
    }

    private bindActiveFrame() {
        const activeFrame = this._activeFrame;
        if (activeFrame === undefined) {
            throw new AssertInternalError('ORDFBAF30083');
        } else {
            switch (activeFrame.stepId) {
                case OrderRequestStepFrame.StepId.Pad: {
                    this._padFrame = activeFrame as PadOrderRequestStepFrame;
                    this._padFrame.bestDataIvemIdSetEvent = (dataIvemId) => this.handlePadDataIvemIdSetEvent(dataIvemId);
                    this._padFrame.brokerageAccountGroupSetEvent = (group) => this.handlePadBrokerageAccountGroupSetEvent(group);
                    this._padFrame.errorCountChangeEvent = (count) => this.handlePadErrorCountChangeEvent(count);
                    this._padFrame.setOrderPad(this._orderPad);
                    this.checkPushPadReviewEnabled(true);
                    this._componentAccess.pushReviewZenithMessageNotDisplayed();
                    break;
                }
                case OrderRequestStepFrame.StepId.Review: {
                    this._reviewFrame = activeFrame as ReviewOrderRequestStepFrame;
                    if (this._orderRequestDataDefinition === undefined) {
                        throw new AssertInternalError('ORDFBAFRV23333953');
                    } else {
                        this._reviewFrame.setOrderPad(this._orderPad, this._orderRequestDataDefinition, this._reviewZenithMessageActive);
                        this._componentAccess.pushBackButtonEnabled(true);
                        this._componentAccess.pushSendEnabled(true);
                        this._componentAccess.pushReviewZenithMessageActive(this._reviewZenithMessageActive);
                        break;
                    }
                }
                case OrderRequestStepFrame.StepId.Result: {
                    this._resultFrame = activeFrame as ResultOrderRequestStepFrame;
                    if (this._orderRequestDataDefinition === undefined) {
                        throw new AssertInternalError('ORDFBAFRS23333953');
                    } else {
                        // Back button (if displayed) should already be disabled - make sure
                        if (this._reviewEnabled) {
                            this._componentAccess.pushBackButtonEnabled(false);
                        }
                        // Send button should already be disabled - make sure
                        this._componentAccess.pushSendEnabled(false);
                        this._componentAccess.pushReviewZenithMessageNotDisplayed();
                        this._resultFrame.orderBecameAvailableEvent = (orderMapKey) => this.handleResultOrderBecameAvailableEvent(orderMapKey);
                        this._resultFrame.send(this._orderPad, this._orderRequestDataDefinition);
                        break;
                    }
                }
                default:
                    throw new UnreachableCaseError('ORDFBAFU34442303998', activeFrame.stepId);
            }
        }
    }

    private unbindActiveFrame() {
        this._padFrame = undefined;
        this._reviewFrame = undefined;
        this._resultFrame = undefined;
    }

    private checkUnbindActiveFrame() {
        if (this._activeFrame !== undefined) {
            this.unbindActiveFrame();
        }
    }

    private showPad(symbolAccountIncomingLinkable: boolean) {
        this._orderRequestDataDefinition = undefined;
        this._componentAccess.pushSendEnabled(false);
        this.setStepId(OrderRequestStepFrame.StepId.Pad, symbolAccountIncomingLinkable);
    }

    private canSendFromStep() {
        switch (this._stepId) {
            case OrderRequestStepFrame.StepId.Pad: return !this._reviewEnabled && !this.settingsService.scalar.orderPad_ReviewEnabled;
            case OrderRequestStepFrame.StepId.Review: return this._reviewEnabled;
            case OrderRequestStepFrame.StepId.Result: return false;
            default: throw new UnreachableCaseError('ORDFCSFS4344499321', this._stepId);
        }
    }

    private checkPushPadReviewEnabled(force: boolean) {
        if (this._stepId !== OrderRequestStepFrame.StepId.Pad) {
            throw new AssertInternalError('ORDFCPPRE121299535');
        } else {
            if (this.settingsService.scalar.orderPad_ReviewEnabled !== this._reviewEnabled || force) {
                this._reviewEnabled = this.settingsService.scalar.orderPad_ReviewEnabled;
                if (this._reviewEnabled) {
                    this._componentAccess.pushReviewEnabled(this._orderPadSendable);
                    this._componentAccess.pushSendEnabled(false);
                } else {
                    this._componentAccess.pushReviewBackNotDisplayed();
                    this._componentAccess.pushSendEnabled(this._orderPadSendable);
                }
            }
        }
    }

    private setStepId(stepId: OrderRequestStepFrame.StepId, symbolAccountIncomingLinkable: boolean) {
        this.setSymbolAccountIncomingLinkable(symbolAccountIncomingLinkable);
        if (stepId !== this._stepId) {
            this._stepId = stepId;
            this._componentAccess.pushStepId(stepId);
        }
    }

    private setSymbolAccountIncomingLinkable(value: boolean) {
        if (value !== this._symbolAccountIncomingLinkable) {
            this._symbolAccountIncomingLinkable = value;
            if (value) {
                if (this.dataIvemIdLinked) {
                    const desktopDataIvemId = this.desktopAccessService.dataIvemId;
                    if (desktopDataIvemId !== undefined) {
                        this.setDataIvemIdFromDesktop(this.desktopAccessService.dataIvemId, undefined);
                    }
                }

                if (this.brokerageAccountGroupLinked) {
                    const desktopBrokerageAccountGroup = this.desktopAccessService.lastSingleBrokerageAccountGroup;
                    if (desktopBrokerageAccountGroup !== undefined) {
                        this.setBrokerageAccountGroupFromDesktop(desktopBrokerageAccountGroup, undefined);
                    }
                }
            }
            this._componentAccess.pushSymbolAccountIncomingLinkableChanged();
        }
    }

    private setLastResultOrderMapKey(value: string | undefined) {
        if (value !== this._lastResultOrderMapKey) {
            this._lastResultOrderMapKey = value;
            this._componentAccess.pushNewAmendRequestPossible(this._lastResultOrderMapKey !== undefined);
        }
    }
}

export namespace OrderRequestDitemFrame {
    export const StepId = OrderRequestStepFrame.StepId;

    export namespace JsonName {
        export const pad = 'pad';
        export const review = 'review';
        export const result = 'result';
    }

    export interface ComponentAccess extends DitemFrame.ComponentAccess {
        orderPadApplied(): void;
        pushStepId(stepId: OrderRequestStepFrame.StepId): void;
        pushSymbolAccountIncomingLinkableChanged(): void;
        pushReviewBackNotDisplayed(): void;
        pushBackButtonEnabled(value: boolean): void;
        pushReviewEnabled(value: boolean): void;
        pushSendEnabled(enabled: boolean): void;
        pushNewAmendRequestPossible(value: boolean): void;
        pushReviewZenithMessageNotDisplayed(): void;
        pushReviewZenithMessageActive(value: boolean): void;
    }
}
