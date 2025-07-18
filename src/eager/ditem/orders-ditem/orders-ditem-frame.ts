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
import { OrdersFrame } from 'content-internal-api';
import { RevColumnLayoutOrReferenceDefinition } from 'revgrid';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class OrdersDitemFrame extends BuiltinDitemFrame {
    private readonly _scalarSettings: ScalarSettings;

    private _ordersFrame: OrdersFrame | undefined;
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
        private readonly _gridSourceOpenedEventer: OrdersDitemFrame.GridSourceOpenedEventer,
        private readonly _recordFocusedEventer: OrdersDitemFrame.RecordFocusedEventer,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Orders,
            ditemComponentAccess, settingsService, marketsService, commandRegisterService, desktopAccessService, symbolsService, adiService
        );

        this._scalarSettings = settingsService.scalar;
    }

    override get builtinDitemTypeId() { return BuiltinDitemFrame.BuiltinTypeId.Orders; }
    get initialised() { return this._ordersFrame !== undefined; }
    get focusedRecordIndex() { return this._ordersFrame?.getFocusedRecordIndex(); }

    initialise(ditemFrameElement: JsonElement | undefined, ordersFrame: OrdersFrame): void {
        this._ordersFrame = ordersFrame;

        ordersFrame.gridSourceOpenedEventer = (brokerageAccountGroup) => this.handleGridSourceOpenedEvent(brokerageAccountGroup);
        ordersFrame.recordFocusedEventer = (newRecordIndex) => this.handleRecordFocusedEvent(newRecordIndex);

        let ordersFrameElement: JsonElement | undefined;
        if (ditemFrameElement !== undefined) {
            const ordersFrameElementResult = ditemFrameElement.tryGetElement(OrdersDitemFrame.JsonName.ordersFrame);
            if (ordersFrameElementResult.isOk()) {
                ordersFrameElement = ordersFrameElementResult.value;
            }
        }

        ordersFrame.initialise(this.opener, undefined, true);

        const openPromise = ordersFrame.tryOpenJsonOrDefault(ordersFrameElement, true);
        openPromise.then(
            (openResult) => {
                if (openResult.isErr()) {
                    this._toastService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.Orders]}: ${openResult.error}`);
                } else {
                    this.applyLinked();
                }
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'ODFIPR50137') }
        );
    }

    override finalise() {
        if (this._ordersFrame !== undefined) {
            this._ordersFrame.closeGridSource(false);
        }
        super.finalise();
    }

    override save(element: JsonElement) {
        super.save(element);

        const ordersFrame = this._ordersFrame;
        if (ordersFrame === undefined) {
            throw new AssertInternalError('ODFS04418');
        } else {
            const contentElement = element.newElement(OrdersDitemFrame.JsonName.ordersFrame);
            const definition = ordersFrame.createGridSourceOrReferenceDefinition();
            definition.saveToJson(contentElement);
        }
    }

    createAllowedFieldsAndLayoutDefinition() {
        if (this._ordersFrame === undefined) {
            throw new AssertInternalError('ODFCAFALD04418');
        } else {
            return this._ordersFrame.createAllowedSourcedFieldsColumnLayoutDefinition();
        }
    }

    tryOpenColumnLayoutOrReferenceDefinition(columnLayoutOrReferenceDefinition: RevColumnLayoutOrReferenceDefinition) {
        if (this._ordersFrame === undefined) {
            throw new AssertInternalError('ODFOGLONRD04418');
        } else {
            return this._ordersFrame.tryOpenColumnLayoutOrReferenceDefinition(columnLayoutOrReferenceDefinition);
        }
    }

    canAmendFocusedOrder() {
        if (this._ordersFrame === undefined) {
            throw new AssertInternalError('ODFCAFO68109');
        } else {
            return this._ordersFrame.canAmendFocusedOrder();
        }
    }

    canCancelFocusedOrder() {
        if (this._ordersFrame === undefined) {
            throw new AssertInternalError('ODFCCFO68109');
        } else {
            return this._ordersFrame.canCancelFocusedOrder();
        }
    }

    canMoveFocusedOrder() {
        if (this._ordersFrame === undefined) {
            throw new AssertInternalError('ODFCMFO68109');
        } else {
            return this._ordersFrame.canMoveFocusedOrder();
        }
    }

    buyFocused() {
        if (this._ordersFrame === undefined) {
            throw new AssertInternalError('ODFBF68109');
        } else {
            const focusedOrder = this._ordersFrame.getFocusedOrder();
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
        if (this._ordersFrame === undefined) {
            throw new AssertInternalError('ODFSF68109');
        } else {
            const focusedOrder = this._ordersFrame.getFocusedOrder();
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
        if (this._ordersFrame === undefined) {
            throw new AssertInternalError('ODFAF68109');
        } else {
            const focusedOrder = this._ordersFrame.getFocusedOrder();
            if (focusedOrder !== undefined) {
                const orderPad = new OrderPad(this._decimalFactory, this._marketsService, this._symbolDetailCacheService, this.adiService);
                orderPad.loadAmendFromOrder(focusedOrder);
                this.desktopAccessService.editOrderRequest(orderPad);
            }
        }
    }

    cancelFocused() {
        if (this._ordersFrame === undefined) {
            throw new AssertInternalError('ODFCF68109');
        } else {
            const focusedOrder = this._ordersFrame.getFocusedOrder();
            if (focusedOrder !== undefined) {
                const orderPad = new OrderPad(this._decimalFactory, this._marketsService, this._symbolDetailCacheService, this.adiService);
                orderPad.loadCancelFromOrder(focusedOrder);
                this.desktopAccessService.editOrderRequest(orderPad);
            }
        }
    }

    moveFocused() {
        if (this._ordersFrame === undefined) {
            throw new AssertInternalError('ODFMF68109');
        } else {
            const focusedOrder = this._ordersFrame.getFocusedOrder();
            if (focusedOrder !== undefined) {
                const orderPad = new OrderPad(this._decimalFactory, this._marketsService, this._symbolDetailCacheService, this.adiService);
                orderPad.loadMoveFromOrder(focusedOrder);
                this.desktopAccessService.editOrderRequest(orderPad);
            }
        }
    }

    autoSizeAllColumnWidths(widenOnly: boolean) {
        if (this._ordersFrame === undefined) {
            throw new AssertInternalError('ODFASACW10174');
        } else {
            this._ordersFrame.autoSizeAllColumnWidths(widenOnly);
        }
    }

    protected override applyBrokerageAccountGroup(group: BrokerageAccountGroup | undefined, selfInitiated: boolean): boolean {
        if (this._currentFocusedDataIvemIdAccountGroupSetting) {
            return false;
        } else {
            const ordersFrame = this._ordersFrame;
            if (ordersFrame === undefined) {
                throw new AssertInternalError('ODFABAG68109');
            } else {
                if (selfInitiated) {
                    return this.applyBrokerageAccountGroupWithOpen(ordersFrame, group, selfInitiated, true);
                } else {
                    if (group === undefined) {
                        return false;
                    } else {
                        const tableRecordSourceDefinition = ordersFrame.createTableRecordSourceDefinition();
                        if (!(tableRecordSourceDefinition instanceof OrderTableRecordSourceDefinition)) {
                            throw new AssertInternalError('ODFABAGT34340098');
                        } else {
                            if (group.isEqualTo(tableRecordSourceDefinition.brokerageAccountGroup)) {
                                return false;
                            } else {
                                return this.applyBrokerageAccountGroupWithOpen(ordersFrame, group, selfInitiated, true);
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
            if (this._ordersFrame === undefined) {
                throw new AssertInternalError('ODFHGSOE29974');
            } else {
                const order = this._ordersFrame.recordList.getAt(newRecordIndex);
                this.processOrderFocusChange(order);
            }
        }
        this._recordFocusedEventer(newRecordIndex);
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

    private applyBrokerageAccountGroupWithOpen(ordersFrame: OrdersFrame, group: BrokerageAccountGroup | undefined, selfInitiated: boolean, keepView: boolean) {
        let result: boolean;
        this._brokerageAccountGroupApplying = true;
        try {
            result = super.applyBrokerageAccountGroup(group, selfInitiated);
            if (group !== undefined) {
                const openPromise = ordersFrame.tryOpenBrokerageAccountGroup(group, keepView);
                openPromise.then(
                    (openResult) => {
                        if (openResult.isErr()) {
                            this._toastService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.Orders]}: ${openResult.error}`);
                        }
                    },
                    (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'ODFABAGWO68100', `${this.opener.lockerName}: ${group.display}`); }
                );
            }
        } finally {
            this._brokerageAccountGroupApplying = false;
        }
        return result;
    }
}

export namespace OrdersDitemFrame {
    export namespace JsonName {
        export const ordersFrame = 'ordersFrame';
    }

    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;
    export type GridSourceOpenedEventer = (this: void, group: BrokerageAccountGroup) => void;
}
