import { ComparableList } from '@pbkware/js-utils';
import { TradingMarket } from '@plxtra/motif-core';
import {
    DataMarket as DataMarketApi,
    Exchange as ExchangeApi,
    OrderRouteAlgorithm as OrderRouteAlgorithmApi,
    OrderTimeInForce as OrderTimeInForceApi,
    OrderTradeType as OrderTradeTypeApi,
    OrderTriggerType as OrderTriggerTypeApi,
    OrderType as OrderTypeApi,
    TradingMarket as TradingMarketApi
} from '../../../../api';
import { DataMarketApiConstructor, ExchangeApiConstructor } from '../../constructors';
import { OrderRouteAlgorithmImplementation } from '../order-route-algorithm-implementation';
import { OrderTimeInForceImplementation } from '../order-time-in-force-api-implementation';
import { OrderTradeTypeImplementation } from '../order-trade-type-api-implementation';
import { OrderTriggerTypeImplementation } from '../order-trigger-type-api-implementation';
import { OrderTypeImplementation } from '../order-type-api-implementation';
import { MarketImplementation } from './market-api-implementation';

export class TradingMarketImplementation extends MarketImplementation<TradingMarket> implements TradingMarketApi {
    constructor(
        actual: TradingMarket,
        exchangeApiConstructor: ExchangeApiConstructor,
        dataMarketApiConstructor: DataMarketApiConstructor,
    ) {
        super(actual, exchangeApiConstructor, dataMarketApiConstructor, TradingMarketImplementation);
    }

    get bestLitDataMarket(): DataMarketApi | undefined {
        const bestLitDataMarket = this.actual.bestLitDataMarket;
        if (bestLitDataMarket === undefined) {
            return undefined;
        } else {
            return new this._dataMarketApiConstructor(bestLitDataMarket, this._exchangeApiConstructor, TradingMarketImplementation);
        }
    }

    get orderRouteAlgorithmId(): OrderRouteAlgorithmApi {
        return OrderRouteAlgorithmImplementation.toApi(this.actual.orderRouteAlgorithmId);
    }
    get allowedOrderTypeIds(): readonly OrderTypeApi[] {
        return OrderTypeImplementation.arrayToApi(this.actual.allowedOrderTypeIds);
    }
    get defaultOrderTypeId(): OrderTypeApi {
        return OrderTypeImplementation.toApi(this.actual.defaultOrderTypeId);
    }
    get allowedOrderTimeInForceIds(): OrderTimeInForceApi[] {
        return OrderTimeInForceImplementation.arrayToApi(this.actual.allowedOrderTimeInForceIds);
    }
    get defaultOrderTimeInForceId(): OrderTimeInForceApi {
        return OrderTimeInForceImplementation.toApi(this.actual.defaultOrderTimeInForceId);
    }
    get marketOrderTypeAllowedTimeInForceIds(): OrderTimeInForceApi[] {
        return OrderTimeInForceImplementation.arrayToApi(this.actual.marketOrderTypeAllowedTimeInForceIds);
    }
    get allowedOrderTriggerTypeIds(): OrderTriggerTypeApi[] {
        return OrderTriggerTypeImplementation.arrayToApi(this.actual.allowedOrderTriggerTypeIds);
    }
    get allowedOrderTradeTypeIds(): OrderTradeTypeApi[] {
        return OrderTradeTypeImplementation.arrayToApi(this.actual.allowedOrderTradeTypeIds);
    }
    get symbologySupportedExchanges(): ExchangeApi[] {
        const actualExchanges = this.actual.symbologySupportedExchanges;
        const count = actualExchanges.length;
        if (length === 1) {
            // most common outcome
            const exchangeApi = new this._exchangeApiConstructor(actualExchanges[0]);
            return [exchangeApi];
        } else {
            const result = new Array<ExchangeApi>(count);
            for (let i = 0; i < count; i++) {
                const actualExchange = actualExchanges[i];
                result[i] = new this._exchangeApiConstructor(actualExchange);
            }
            return result;
        }
    }

    // areExchangeSymbolsSupported(exchange: ExchangeApi): boolean {
    //     const actualExchange = ExchangeImplementation.fromApi(exchange);
    //     return this.actual.areExchangeSymbolsSupported(actualExchange);
    // }

    isOrderTypeAllowed(orderTypeId: OrderTypeApi): boolean {
        const actualOrderTypeId = OrderTypeImplementation.fromApi(orderTypeId);
        return this.actual.isOrderTypeAllowed(actualOrderTypeId);
    }

    isOrderTradeTypeAllowed(orderTradeTypeId: OrderTradeTypeApi): boolean {
        const actualOrderTradeTypeId = OrderTradeTypeImplementation.fromApi(orderTradeTypeId);
        return this.actual.isOrderTradeTypeAllowed(actualOrderTradeTypeId);
    }

    getAllowedTimeInForcesForOrderType(orderTypeId: OrderTypeApi): OrderTimeInForceApi[] {
        const actualOrderTypeId = OrderTypeImplementation.fromApi(orderTypeId);
        const resultOrderTimeInForceIds = this.actual.getAllowedTimeInForcesForOrderType(actualOrderTypeId)
        return OrderTimeInForceImplementation.arrayToApi(resultOrderTimeInForceIds);
    }
}

export namespace TradingMarketImplementation {
    export function toApi(
        value: TradingMarket,
        exchangeApiConstructor: ExchangeApiConstructor,
        dataMarketApiConstructor: DataMarketApiConstructor,
    ) {
        return new TradingMarketImplementation(value, exchangeApiConstructor, dataMarketApiConstructor);
    }

    export function fromApi(value: TradingMarketApi) {
        const implementation = value as TradingMarketImplementation;
        return implementation.actual;
    }

    export function arrayToApi(
        value: readonly TradingMarket[],
        exchangeApiConstructor: ExchangeApiConstructor,
        dataMarketApiConstructor: DataMarketApiConstructor,
    ): TradingMarketApi[] {
        const count = value.length;
        const result = new Array<TradingMarketApi>(count);
        for (let i = 0; i < count; i++) {
            result[i] = toApi(value[i], exchangeApiConstructor, dataMarketApiConstructor);
        }
        return result;
    }

    export function arrayFromApi(value: readonly TradingMarketApi[]): TradingMarket[] {
        const count = value.length;
        const result = new Array<TradingMarket>(count);
        for (let i = 0; i < count; i++) {
            const tradingMarket = value[i];
            result[i] = fromApi(tradingMarket);
        }
        return result;
    }

    export function listToArrayApi(
        list: ComparableList<TradingMarket>,
        exchangeApiConstructor: ExchangeApiConstructor,
        dataMarketApiConstructor: DataMarketApiConstructor,
    ): TradingMarketApi[] {
        const count = list.count;
        const result = new Array<TradingMarketApi>(count);
        for (let i = 0; i < count; i++) {
            const board = list.getAt(i);
            result[i] = toApi(board, exchangeApiConstructor, dataMarketApiConstructor);
        }
        return result;
    }
}
