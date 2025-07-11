import { AssertInternalError, DecimalFactory, Integer, JsonElement } from '@pbkware/js-utils';
import {
    AdiService,
    BrokerageAccountGroup,
    CommandRegisterService,
    MarketsService,
    Order,
    OrderPad,
    OrderTableRecordSourceDefinition,
    ScalarSettings,
    SettingsService,
    StringId,
    Strings,
    SymbolDetailCacheService,
    SymbolsService
} from '@plxtra/motif-core';
import { ToastService } from 'component-services-internal-api';
import { OrderAuthoriseFrame } from 'content-internal-api';
import { RevColumnLayoutOrReferenceDefinition } from 'revgrid';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class OrderAuthoriseDitemFrame extends BuiltinDitemFrame {
    private readonly _scalarSettings: ScalarSettings;

    private _orderAuthoriseFrame: OrderAuthoriseFrame | undefined;
    private _currentFocusedDataIvemIdAccountGroupSetting: boolean;
    private _brokerageAccountGroupApplying: boolean;

    constructor(
        ditemComponentAccess: DitemFrame.ComponentAccess,
        private readonly _decimalFactory: DecimalFactory,
        settingsService: SettingsService,
        marketsService: MarketsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
        private readonly _symbolDetailCacheService: SymbolDetailCacheService,
        private readonly _toastService: ToastService,
        private readonly _gridSourceOpenedEventer: OrderAuthoriseDitemFrame.GridSourceOpenedEventer,
        private readonly _recordFocusedEventer: OrderAuthoriseDitemFrame.RecordFocusedEventer,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.OrderAuthorise,
            ditemComponentAccess, settingsService, marketsService, commandRegisterService, desktopAccessService, symbolsService, adiService
        );

        this._scalarSettings = settingsService.scalar;
    }

    override get builtinDitemTypeId() { return BuiltinDitemFrame.BuiltinTypeId.OrderAuthorise; }
    get initialised() { return this._orderAuthoriseFrame !== undefined; }
    get focusedRecordIndex() { return this._orderAuthoriseFrame?.getFocusedRecordIndex(); }

    initialise(ditemFrameElement: JsonElement | undefined, orderAuthoriseFrame: OrderAuthoriseFrame): void {
        this._orderAuthoriseFrame = orderAuthoriseFrame;

        orderAuthoriseFrame.gridSourceOpenedEventer = (brokerageAccountGroup) => this.handleGridSourceOpenedEvent(brokerageAccountGroup);
        orderAuthoriseFrame.recordFocusedEventer = (newRecordIndex) => this.handleRecordFocusedEvent(newRecordIndex);

        let orderAuthoriseFrameElement: JsonElement | undefined;
        if (ditemFrameElement !== undefined) {
            const orderAuthoriseFrameElementResult = ditemFrameElement.tryGetElement(OrderAuthoriseDitemFrame.JsonName.orderAuthoriseFrame);
            if (orderAuthoriseFrameElementResult.isOk()) {
                orderAuthoriseFrameElement = orderAuthoriseFrameElementResult.value;
            }
        }

        orderAuthoriseFrame.initialise(this.opener, undefined, true);

        const openPromise = orderAuthoriseFrame.tryOpenJsonOrDefault(orderAuthoriseFrameElement, true);
        openPromise.then(
            (openResult) => {
                if (openResult.isErr()) {
                    this._toastService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.OrderAuthorise]}: ${openResult.error}`);
                } else {
                    this.applyLinked();
                }
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'OADFIPR50137') }
        );
    }

    override finalise() {
        if (this._orderAuthoriseFrame !== undefined) {
            this._orderAuthoriseFrame.closeGridSource(false);
        }
        super.finalise();
    }

    override save(element: JsonElement) {
        super.save(element);

        const orderAuthoriseFrame = this._orderAuthoriseFrame;
        if (orderAuthoriseFrame === undefined) {
            throw new AssertInternalError('OADFS04418');
        } else {
            const contentElement = element.newElement(OrderAuthoriseDitemFrame.JsonName.orderAuthoriseFrame);
            const definition = orderAuthoriseFrame.createGridSourceOrReferenceDefinition();
            definition.saveToJson(contentElement);
        }
    }

    createAllowedFieldsAndLayoutDefinition() {
        if (this._orderAuthoriseFrame === undefined) {
            throw new AssertInternalError('OADFCAFALD04418');
        } else {
            return this._orderAuthoriseFrame.createAllowedSourcedFieldsColumnLayoutDefinition();
        }
    }

    tryOpenColumnLayoutOrReferenceDefinition(columnLayoutOrReferenceDefinition: RevColumnLayoutOrReferenceDefinition) {
        if (this._orderAuthoriseFrame === undefined) {
            throw new AssertInternalError('OADFOGLONRD04418');
        } else {
            return this._orderAuthoriseFrame.tryOpenColumnLayoutOrReferenceDefinition(columnLayoutOrReferenceDefinition);
        }
    }

    canAmendFocusedOrder() {
        if (this._orderAuthoriseFrame === undefined) {
            throw new AssertInternalError('OADFCAFO68109');
        } else {
            return this._orderAuthoriseFrame.canAmendFocusedOrder();
        }
    }

    canCancelFocusedOrder() {
        if (this._orderAuthoriseFrame === undefined) {
            throw new AssertInternalError('OADFCCFO68109');
        } else {
            return this._orderAuthoriseFrame.canCancelFocusedOrder();
        }
    }

    buyFocused() {
        if (this._orderAuthoriseFrame === undefined) {
            throw new AssertInternalError('OADFBF68109');
        } else {
            const focusedOrder = this._orderAuthoriseFrame.getFocusedOrder();
            const orderPad = new OrderPad(this._decimalFactory, this._marketsService, this._symbolDetailCacheService, this.adiService);
            if (focusedOrder !== undefined) {
                orderPad.loadBuyFromOrder(focusedOrder);
            } else {
                orderPad.loadBuy();
            }
            orderPad.applySettingsDefaults(this._scalarSettings);
            this.desktopAccessService.editOrderRequest(orderPad);
        }
    }

    sellFocused() {
        if (this._orderAuthoriseFrame === undefined) {
            throw new AssertInternalError('OADFSF68109');
        } else {
            const focusedOrder = this._orderAuthoriseFrame.getFocusedOrder();
            const orderPad = new OrderPad(this._decimalFactory, this._marketsService, this._symbolDetailCacheService, this.adiService);
            if (focusedOrder !== undefined) {
                orderPad.loadSellFromOrder(focusedOrder);
            } else {
                orderPad.loadSell();
            }
            orderPad.applySettingsDefaults(this._scalarSettings);
            this.desktopAccessService.editOrderRequest(orderPad);
        }
    }

    amendFocused() {
        if (this._orderAuthoriseFrame === undefined) {
            throw new AssertInternalError('OADFAF68109');
        } else {
            const focusedOrder = this._orderAuthoriseFrame.getFocusedOrder();
            if (focusedOrder !== undefined) {
                const orderPad = new OrderPad(this._decimalFactory, this._marketsService, this._symbolDetailCacheService, this.adiService);
                orderPad.loadAmendFromOrder(focusedOrder);
                this.desktopAccessService.editOrderRequest(orderPad);
            }
        }
    }

    cancelFocused() {
        if (this._orderAuthoriseFrame === undefined) {
            throw new AssertInternalError('OADFCF68109');
        } else {
            const focusedOrder = this._orderAuthoriseFrame.getFocusedOrder();
            if (focusedOrder !== undefined) {
                const orderPad = new OrderPad(this._decimalFactory, this._marketsService, this._symbolDetailCacheService, this.adiService);
                orderPad.loadCancelFromOrder(focusedOrder);
                this.desktopAccessService.editOrderRequest(orderPad);
            }
        }
    }

    moveFocused() {
        if (this._orderAuthoriseFrame === undefined) {
            throw new AssertInternalError('OADFMF68109');
        } else {
            const focusedOrder = this._orderAuthoriseFrame.getFocusedOrder();
            if (focusedOrder !== undefined) {
                const orderPad = new OrderPad(this._decimalFactory, this._marketsService, this._symbolDetailCacheService, this.adiService);
                orderPad.loadMoveFromOrder(focusedOrder);
                this.desktopAccessService.editOrderRequest(orderPad);
            }
        }
    }

    protected override applyBrokerageAccountGroup(group: BrokerageAccountGroup | undefined, selfInitiated: boolean): boolean {
        if (this._currentFocusedDataIvemIdAccountGroupSetting) {
            return false;
        } else {
            const orderAuthoriseFrame = this._orderAuthoriseFrame;
            if (orderAuthoriseFrame === undefined) {
                throw new AssertInternalError('OADFABAG68109');
            } else {
                if (selfInitiated) {
                    return this.applyBrokerageAccountGroupWithOpen(orderAuthoriseFrame, group, selfInitiated, true);
                } else {
                    if (group === undefined) {
                        return false;
                    } else {
                        const tableRecordSourceDefinition = orderAuthoriseFrame.createTableRecordSourceDefinition();
                        if (!(tableRecordSourceDefinition instanceof OrderTableRecordSourceDefinition)) {
                            throw new AssertInternalError('ODFABAGT34340');
                        } else {
                            if (group.isEqualTo(tableRecordSourceDefinition.brokerageAccountGroup)) {
                                return false;
                            } else {
                                return this.applyBrokerageAccountGroupWithOpen(orderAuthoriseFrame, group, selfInitiated, true);
                            }
                        }
                    }
                }
            }
        }
    }

    private handleGridSourceOpenedEvent(brokerageAccountGroup: BrokerageAccountGroup) {
        this.updateLockerName(brokerageAccountGroup.isAll() ? '' : brokerageAccountGroup.display);
        this._gridSourceOpenedEventer(brokerageAccountGroup);
    }

    private handleRecordFocusedEvent(newRecordIndex: Integer | undefined) {
        if (newRecordIndex !== undefined) {
            if (this._orderAuthoriseFrame === undefined) {
                throw new AssertInternalError('OADFHGSOE29974');
            } else {
                const order = this._orderAuthoriseFrame.recordList.getAt(newRecordIndex);
                this.processOrderFocusChange(order);
            }
        }
    }

    private processOrderFocusChange(newFocusedOrder: Order) {
        if (!this._brokerageAccountGroupApplying) {
            this._currentFocusedDataIvemIdAccountGroupSetting = true;
            try {
                const tradingIvemId = newFocusedOrder.tradingIvemId;
                let dataIvemId = this.symbolsService.tryGetBestDataIvemIdFromTradingIvemId(tradingIvemId);
                if (dataIvemId !== undefined) {
                    this.applyDitemDataIvemIdFocus(dataIvemId, true);
                } else {
                    const ivemId = newFocusedOrder.ivemId;
                    dataIvemId = this.symbolsService.tryGetDefaultDataIvemIdFromIvemId(ivemId);
                    if (dataIvemId !== undefined) {
                        this.applyDitemDataIvemIdFocus(dataIvemId, true);
                    }
                }

                const accountZenithCode = newFocusedOrder.accountZenithCode;
                const singleGroup = BrokerageAccountGroup.createSingle(this._marketsService, accountZenithCode);
                this.applyDitemBrokerageAccountGroupFocus(singleGroup, true);
            } finally {
                this._currentFocusedDataIvemIdAccountGroupSetting = false;
            }
        }
    }

    private applyBrokerageAccountGroupWithOpen(orderAuthoriseFrame: OrderAuthoriseFrame, group: BrokerageAccountGroup | undefined, selfInitiated: boolean, keepView: boolean) {
        let result: boolean;
        this._brokerageAccountGroupApplying = true;
        try {
            result = super.applyBrokerageAccountGroup(group, selfInitiated);
            if (group !== undefined) {
                const openPromise = orderAuthoriseFrame.tryOpenBrokerageAccountGroup(group, keepView);
                openPromise.then(
                    (openResult) => {
                        if (openResult.isErr()) {
                            this._toastService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.OrderAuthorise]}: ${openResult.error}`);
                        }
                    },
                    (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'OADFABAGWO68100', `${this.opener.lockerName}: ${group.display}`); }
                );
            }
        } finally {
            this._brokerageAccountGroupApplying = false;
        }
        return result;
    }
}

export namespace OrderAuthoriseDitemFrame {
    export namespace JsonName {
        export const orderAuthoriseFrame = 'orderAuthoriseFrame';
    }

    export type GridSourceOpenedEventer = (this: void, group: BrokerageAccountGroup) => void;
    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;
}
