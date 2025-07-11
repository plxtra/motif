import {
    Integer,
    MultiEvent,
    UnreachableCaseError
} from '@pbkware/js-utils';
import { UiAction } from '@pbkware/ui-action';
import {
    BrokerageAccountGroup,
    DataIvemId,
    MarketsService,
    MovementId,
    OrderId,
    OrderPad,
    OrderTradeTypeId,
    OrderTriggerTypeId,
    OrderTypeId,
    PriceOrderTrigger,
    SingleBrokerageAccountGroup,
    StringId,
    Strings,
    SymbolsService,
    TimeInForceId,
    TradingIvemId,
    TradingMarket,
} from '@plxtra/motif-core';
import { Decimal } from 'decimal.js-light';
import { OrderRequestStepFrame } from '../order-request-step-frame';

export class PadOrderRequestStepFrame extends OrderRequestStepFrame {
    bestDataIvemIdSetEvent: PadOrderRequestStepFrame.BestDataIvemIdSetEvent;
    brokerageAccountGroupSetEvent: PadOrderRequestStepFrame.BrokerageAccountGroupSetEvent;
    errorCountChangeEvent: PadOrderRequestStepFrame.ErrorCountChangeEvent;

    private _orderPad: OrderPad;
    private _orderPadFieldsChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _fieldErrorStates = new Array<PadOrderRequestStepFrame.FieldErrorState>(OrderPad.Field.idCount);
    private _errorCount = 0;

    private _dataIvemIdSetting = false;
    private _brokerageAccountGroupSetting = false;

    constructor(
        private readonly _componentAccess: PadOrderRequestStepFrame.ComponentAccess,
        private readonly _marketsService: MarketsService,
        private readonly _symbolsService: SymbolsService,
    ) {
        super(OrderRequestStepFrame.StepId.Pad);

        for (let id = 0; id < OrderPad.Field.idCount; id++) {
            this._fieldErrorStates[id] = {
                padValid: false,
                padReasonId: OrderPad.Field.StatusReasonId.Unknown,
                uiEdited: false,
                uiValid: false,
                uiMissing: false,
                uiErrorText: undefined
            };
        }
    }

    get orderPad() { return this._orderPad; }
    get dataIvemIdSetting() { return this._dataIvemIdSetting; }
    get brokerageAccountGroupSetting() { return this._brokerageAccountGroupSetting; }

    get errorCount() { return this._errorCount; }

    set accountZenithcode(value: string | undefined) {
        this._orderPad.accountZenithCode = value;
        this._brokerageAccountGroupSetting = true;
        try {
            let group: BrokerageAccountGroup | undefined;
            if (value === undefined) {
                group = undefined;
            } else {
                group = new SingleBrokerageAccountGroup(this._marketsService, value);
            }
            this.brokerageAccountGroupSetEvent(group);
        } finally {
            this._brokerageAccountGroupSetting = false;
        }
    }
    set sideId(value: OrderTradeTypeId | undefined) { this._orderPad.sideId = value; }
    set tradingIvemId(value: TradingIvemId | undefined) {
        this._orderPad.tradingIvemId = value;
        this._dataIvemIdSetting = true;
        try {
            const dataIvemId = value === undefined ? undefined : this._symbolsService.tryGetBestDataIvemIdFromTradingIvemId(value);
            this.bestDataIvemIdSetEvent(dataIvemId);
        } finally {
            this._dataIvemIdSetting = false;
        }
    }

    set tradingMarket(value: TradingMarket) { this._orderPad.tradingMarket = value; }
    set totalQuantity(value: Integer | undefined) { this._orderPad.totalQuantity = value; }
    set orderTypeId(value: OrderTypeId | undefined) { this._orderPad.orderTypeId = value; }
    set limitValue(value: Decimal | undefined) { this._orderPad.limitValue = value; }
    set triggerTypeId(value: OrderTriggerTypeId | undefined) { this._orderPad.triggerTypeId = value; }
    set triggerValue(value: Decimal | undefined) { this._orderPad.triggerValue = value; }
    set triggerField(value: PriceOrderTrigger.FieldId | undefined) { this._orderPad.triggerFieldId = value; }
    set triggerMovement(value: MovementId | undefined) { this._orderPad.triggerMovementId = value; }
    set timeInForceId(value: TimeInForceId | undefined) { this._orderPad.timeInForceId = value; }
    set expiryDate(value: Date | undefined) { this._orderPad.expiryDate = value; }
    set existingOrderId(value: OrderId | undefined) { this._orderPad.existingOrderId = value; }
    set destinationAccountZenithCode(value: string | undefined) { this._orderPad.destinationAccountZenithCode = value; }

    override finalise() {
        this.unbindOrderPad();
        super.finalise();
    }

    setOrderPad(orderPad: OrderPad) {
        this.unbindOrderPad();
        this._orderPad = orderPad;
        this._errorCount = -1; // force error count push
        this._componentAccess.orderPadSet();
        this.bindOrderPad();
        this._orderPad.resetModified();
        this.processOrderPadFieldsChange(OrderPad.Field.allIdArray, true);
    }

    initialiseUiFieldErrorState(fieldId: OrderPad.FieldId,
        edited: boolean, valid: boolean, missing: boolean, errorText: string | undefined
    ) {
        const errorState = this._fieldErrorStates[fieldId];
        errorState.uiEdited = edited;
        errorState.uiValid = valid;
        errorState.uiMissing = missing;
        errorState.uiErrorText = errorText;
    }

    setUiFieldErrorState(fieldId: OrderPad.FieldId, edited: boolean, valid: boolean, missing: boolean, errorText: string | undefined) {
        const errorState = this._fieldErrorStates[fieldId];
        const changed =
            edited !== errorState.uiEdited ||
            edited && (valid !== errorState.uiValid || missing !== errorState.uiMissing || errorText !== errorState.uiErrorText);

        if (changed) {
            errorState.uiEdited = edited;
            errorState.uiValid = valid;
            errorState.uiMissing = missing;
            errorState.uiErrorText = errorText;
            this.pushField(fieldId);
            this.processErrors();
        }
    }

    private handleOrderPadFieldsChangeEvent(fieldIds: OrderPad.FieldId[]) {
        this.processOrderPadFieldsChange(fieldIds, false); // note that error processing may still be required
    }

    private calculateTitle(titlePrefixStringId: StringId, reasonId: OrderPad.Field.StatusReasonId) {
        return `${Strings[titlePrefixStringId]}: ${OrderPad.Field.StatusReason.idToDescription(reasonId)}`;
    }

    private calculateFieldUiActionStateIdAndTitle(fieldId: OrderPad.FieldId): PadOrderRequestStepFrame.UiActionStateIdAndTitle {
        let stateId: UiAction.StateId;
        let title: string | undefined;

        const errorState = this._fieldErrorStates[fieldId];
        if (errorState.uiEdited && !errorState.uiValid) {
            stateId = errorState.uiMissing ? UiAction.StateId.Missing : UiAction.StateId.Invalid;
            const errorText = errorState.uiErrorText === undefined ? Strings[StringId.Invalid] : errorState.uiErrorText;
            title = `${Strings[StringId.Error]}: ${errorText}`;
        } else {
            const statusId = this._orderPad.getFieldStatusId(fieldId);
            switch (statusId) {
                case OrderPad.Field.StatusId.Disabled: {
                    stateId = UiAction.StateId.Disabled;
                    const disabledReasonId = this._orderPad.getFieldStatusReasonId(fieldId);
                    title = this.calculateTitle(StringId.Disabled, disabledReasonId);
                    break;
                }
                case OrderPad.Field.StatusId.PrerequisiteFieldNotValid: {
                    stateId = UiAction.StateId.Warning;
                    const prerequisiteReasonId = this._orderPad.getFieldStatusReasonId(fieldId);
                    title = this.calculateTitle(StringId.Prerequisite, prerequisiteReasonId);
                    break;
                }
                case OrderPad.Field.StatusId.Waiting: {
                    stateId = UiAction.StateId.Waiting;
                    const waitingReasonId = this._orderPad.getFieldStatusReasonId(fieldId);
                    title = this.calculateTitle(StringId.Waiting, waitingReasonId);
                    break;
                }
                case OrderPad.Field.StatusId.Error: {
                    const errorReasonId = this._orderPad.getFieldStatusReasonId(fieldId);
                    stateId = errorReasonId === OrderPad.Field.StatusReasonId.ValueRequired ?
                        UiAction.StateId.Missing : UiAction.StateId.Error;
                    title = this.calculateTitle(StringId.Error, errorReasonId);
                    break;
                }
                case OrderPad.Field.StatusId.ReadOnlyOk: {
                    stateId = UiAction.StateId.Readonly;
                    title = undefined;
                    break;
                }
                case OrderPad.Field.StatusId.ValueOk: {
                    stateId = UiAction.StateId.Accepted;
                    if (errorState.uiEdited) {
                        title = `${Strings[StringId.Error]}: ${Strings[StringId.Editing]}`;
                    } else {
                        title = undefined;
                    }
                    break;
                }
                default:
                    throw new UnreachableCaseError('OPDFCUAS33998', statusId);
            }
        }

        return { stateId, title };
    }

    private processOrderPadFieldsChange(fieldIds: OrderPad.FieldId[], errorProcessingRequired: boolean) {
        for (let i = 0; i < fieldIds.length; i++) {
            const fieldId = fieldIds[i];

            const errorState = this._fieldErrorStates[fieldId];
            const valid = this._orderPad.isFieldValid(fieldId);
            if (valid !== errorState.padValid) {
                errorState.padValid = valid;
                errorProcessingRequired = true;
            }
            if (!valid) {
                const reasonId = this._orderPad.getFieldStatusReasonId(fieldId);
                if (reasonId !== errorState.padReasonId) {
                    errorState.padReasonId = reasonId;
                    errorProcessingRequired = true;
                }
            }

            this.pushField(fieldId);
        }

        if (errorProcessingRequired) {
            this.processErrors();
        }
    }

    private pushField(fieldId: OrderPad.FieldId): void {
        switch (fieldId) {
            case OrderPad.FieldId.Account: this.pushAccountField(); break;
            case OrderPad.FieldId.Side: this.pushSideField(); break;
            case OrderPad.FieldId.Symbol: this.pushSymbolField(); break;
            case OrderPad.FieldId.TotalQuantity: this.pushTotalQuantityField(); break;
            case OrderPad.FieldId.TriggerType: this.pushTriggerTypeField(); break;
            case OrderPad.FieldId.TriggerValue: this.pushTriggerValueField(); break;
            case OrderPad.FieldId.TriggerField: this.pushTriggerFieldField(); break;
            case OrderPad.FieldId.TriggerMovement: this.pushTriggerMovementField(); break;
            case OrderPad.FieldId.OrderType: this.pushOrderTypeField(); break;
            case OrderPad.FieldId.LimitValue: this.pushLimitValueField(); break;
            case OrderPad.FieldId.TimeInForce: this.pushTimeInForceField(); break;
            case OrderPad.FieldId.ExpiryDate: this.pushExpiryDateField(); break;
            case OrderPad.FieldId.ExistingOrder: this.pushExistingOrderField(); break;
            case OrderPad.FieldId.DestinationAccount: this.pushDestinationAccountField(); break;
            default:
                throw new UnreachableCaseError('OPDFPOPFC11998', fieldId);
        }
    }

    private pushAccountField() {
        const fieldId = OrderPad.FieldId.Account;
        const { stateId, title } = this.calculateFieldUiActionStateIdAndTitle(fieldId);
        this._componentAccess.pushAccount(stateId, title, this._orderPad.accountZenithCode);
    }

    private pushSideField() {
        const fieldId = OrderPad.FieldId.Side;
        const { stateId, title } = this.calculateFieldUiActionStateIdAndTitle(fieldId);
        this._componentAccess.pushSide(stateId, title, this._orderPad.sideId, this._orderPad.allowedSideIds);
    }

    private pushSymbolField() {
        const fieldId = OrderPad.FieldId.Symbol;
        const { stateId, title } = this.calculateFieldUiActionStateIdAndTitle(fieldId);
        const tradingIvemId = this._orderPad.isFieldEmpty(fieldId) ? undefined : this._orderPad.tradingIvemId;
        this._componentAccess.pushSymbol(stateId, title, tradingIvemId, this._orderPad.allowedTradingMarkets);
    }

    private pushTotalQuantityField() {
        const fieldId = OrderPad.FieldId.TotalQuantity;
        const { stateId, title } = this.calculateFieldUiActionStateIdAndTitle(fieldId);
        this._componentAccess.pushTotalQuantity(stateId, title, this._orderPad.totalQuantity);
    }

    private pushTriggerTypeField() {
        const fieldId = OrderPad.FieldId.TriggerType;
        const { stateId, title } = this.calculateFieldUiActionStateIdAndTitle(fieldId);
        this._componentAccess.pushTriggerType(stateId, title, this._orderPad.triggerTypeId, this._orderPad.allowedTriggerTypeIds);
    }

    private pushTriggerValueField() {
        const fieldId = OrderPad.FieldId.TriggerValue;
        const { stateId, title } = this.calculateFieldUiActionStateIdAndTitle(fieldId);
        this._componentAccess.pushTriggerValue(stateId, title, this._orderPad.triggerValue);
    }

    private pushTriggerFieldField() {
        const fieldId = OrderPad.FieldId.TriggerField;
        const { stateId, title } = this.calculateFieldUiActionStateIdAndTitle(fieldId);
        this._componentAccess.pushTriggerField(stateId, title, this._orderPad.triggerFieldId);
    }

    private pushTriggerMovementField() {
        const fieldId = OrderPad.FieldId.TriggerMovement;
        const { stateId, title } = this.calculateFieldUiActionStateIdAndTitle(fieldId);
        this._componentAccess.pushTriggerMovement(stateId, title, this._orderPad.triggerMovementId);
    }

    private pushOrderTypeField() {
        const fieldId = OrderPad.FieldId.OrderType;
        const { stateId, title } = this.calculateFieldUiActionStateIdAndTitle(fieldId);
        this._componentAccess.pushOrderType(stateId, title, this._orderPad.orderTypeId, this._orderPad.allowedOrderTypeIds);
    }

    private pushLimitValueField() {
        const limitValuefieldId = OrderPad.FieldId.LimitValue;
        const { stateId, title } = this.calculateFieldUiActionStateIdAndTitle(limitValuefieldId);
        this._componentAccess.pushLimitValue(stateId, title, this._orderPad.limitValue);
        this._componentAccess.pushLimitUnit(stateId, title, this._orderPad.limitUnitId);
    }

    private pushTimeInForceField() {
        const fieldId = OrderPad.FieldId.TimeInForce;
        const { stateId, title } = this.calculateFieldUiActionStateIdAndTitle(fieldId);
        this._componentAccess.pushTimeInForce(stateId, title, this._orderPad.timeInForceId, this._orderPad.allowedTimeInForceIds);
    }

    private pushExpiryDateField() {
        const fieldId = OrderPad.FieldId.ExpiryDate;
        const { stateId, title } = this.calculateFieldUiActionStateIdAndTitle(fieldId);
        this._componentAccess.pushExpiryDate(stateId, title, this._orderPad.expiryDate);
    }

    private pushExistingOrderField() {
        const fieldId = OrderPad.FieldId.ExistingOrder;
        const { stateId, title } = this.calculateFieldUiActionStateIdAndTitle(fieldId);
        this._componentAccess.pushExistingOrderId(stateId, title, this._orderPad.existingOrderId);
    }

    private pushDestinationAccountField() {
        const fieldId = OrderPad.FieldId.DestinationAccount;
        const { stateId, title } = this.calculateFieldUiActionStateIdAndTitle(fieldId);
        this._componentAccess.pushDestinationAccount(stateId, title, this._orderPad.destinationAccountZenithCode);
    }

    private processErrors() {
        let count = 0;
        const fieldTextArray = new Array<string>(OrderPad.Field.idCount);
        for (let id = 0; id < OrderPad.Field.idCount; id++) {
            const errorState = this._fieldErrorStates[id];
            let errorText: string | undefined;
            if (errorState.uiEdited && !errorState.uiValid) {
                if (errorState.uiErrorText === undefined) {
                    errorText = Strings[StringId.Invalid];
                } else {
                    errorText = errorState.uiErrorText;
                }
            } else {
                if (!errorState.padValid) {
                    errorText = OrderPad.Field.StatusReason.idToDescription(errorState.padReasonId);
                } else {
                    if (errorState.uiEdited) {
                        errorText = Strings[StringId.Editing];
                    } else {
                        errorText = undefined;
                    }
                }
            }

            if (errorText !== undefined) {
                fieldTextArray[count++] = `${OrderPad.Field.idToDisplay(id)}: ${errorText}`;
            }
        }

        if (count === 0) {
            this._componentAccess.pushErrors(undefined, '');
        } else {
            fieldTextArray.length = count;
            const errors = fieldTextArray.join(',');
            const title = fieldTextArray.join('\n');
            this._componentAccess.pushErrors(title, errors);
        }

        if (count !== this._errorCount) {
            this._errorCount = count;
            this._componentAccess.pushErrorCount(count);
            this.errorCountChangeEvent(count);
        }
    }

    private bindOrderPad() {
        this._orderPadFieldsChangedSubscriptionId =
            this._orderPad.subscribeFieldsChangedEvent((fieldIds) => this.handleOrderPadFieldsChangeEvent(fieldIds));
    }

    private unbindOrderPad() {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._orderPad !== undefined) {
            this._orderPad.unsubscribeFieldsChangedEvent(this._orderPadFieldsChangedSubscriptionId);
            this._orderPadFieldsChangedSubscriptionId = undefined;
        }
    }
}

export namespace PadOrderRequestStepFrame {

    export namespace JsonName {
        export const content = 'content';
    }

    export const latestLayoutConfigProtocol = '1';

    export type BestDataIvemIdSetEvent = (this: void, dataIvemId: DataIvemId | undefined) => void;
    export type BrokerageAccountGroupSetEvent = (this: void, group: BrokerageAccountGroup | undefined) => void;
    export type ErrorCountChangeEvent = (this: void, errorCount: Integer) => void;

    export interface UiActionStateIdAndTitle {
        stateId: UiAction.StateId;
        title: string | undefined;
    }

    export interface FieldErrorState {
        padValid: boolean;
        padReasonId: OrderPad.Field.StatusReasonId;
        uiEdited: boolean;
        uiValid: boolean;
        uiMissing: boolean;
        uiErrorText: string | undefined;
    }

    export interface ComponentAccess {
        orderPadSet(): void;
        pushAccount(uiActionStateId: UiAction.StateId, title: string | undefined,
            accountZenithCode: string | undefined): void;
        pushSide(uiActionStateId: UiAction.StateId, title: string | undefined, side: OrderTradeTypeId | undefined,
            allowedSideIds: readonly OrderTradeTypeId[]): void;
        pushSymbol(uiActionStateId: UiAction.StateId, title: string | undefined, symbol: TradingIvemId | undefined,
            allowedTradingMarkets: readonly TradingMarket[]): void;
        pushTotalQuantity(uiActionStateId: UiAction.StateId, title: string | undefined, quantity: Integer | undefined): void;
        pushTriggerType(uiActionStateId: UiAction.StateId, title: string | undefined, triggerTypeId: OrderTriggerTypeId | undefined,
            allowedTriggerTypeIds: readonly OrderTriggerTypeId[]): void;
        pushTriggerValue(uiActionStateId: UiAction.StateId, title: string | undefined, triggerValue: Decimal | undefined): void;
        pushTriggerField(uiActionStateId: UiAction.StateId, title: string | undefined,
            triggerFieldId: PriceOrderTrigger.FieldId | undefined): void;
        pushTriggerMovement(uiActionStateId: UiAction.StateId, title: string | undefined,
            triggerMovementId: MovementId | undefined): void;
        pushOrderType(uiActionStateId: UiAction.StateId, title: string | undefined, orderTypeId: OrderTypeId | undefined,
            allowedOrderTypeIds: readonly OrderTypeId[]): void;
        pushLimitValue(uiActionStateId: UiAction.StateId, title: string | undefined, limitValue: Decimal | undefined): void;
        pushLimitUnit(uiActionStateId: UiAction.StateId, title: string | undefined, limitUnitId: OrderPad.PriceUnitId | undefined): void;
        pushTimeInForce(uiActionStateId: UiAction.StateId, title: string | undefined, timeInForceId: TimeInForceId | undefined,
            allowedTimeInForceIds: readonly TimeInForceId[]): void;
        pushExpiryDate(uiActionStateId: UiAction.StateId, title: string | undefined, expiryDate: Date | undefined): void;
        pushExistingOrderId(uiActionStateId: UiAction.StateId, title: string | undefined,
            existingOrderId: OrderId | undefined): void;
        pushDestinationAccount(uiActionStateId: UiAction.StateId, title: string | undefined,
            destinationAccountZenithCode: string | undefined): void;
        pushErrors(title: string | undefined, errors: string): void;
        pushErrorCount(count: Integer): void;
    }
}
