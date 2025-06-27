import { ComparableList } from '@pbkware/js-utils';
import { DataMarket } from '@plxtra/motif-core';
import {
    Correctness as CorrectnessApi,
    DataMarket as DataMarketApi,
    FeedStatus as FeedStatusApi,
    MarketBoard as MarketBoardApi,
    SourceTzOffsetDate as SourceTzOffsetDateApi,
    SourceTzOffsetDateTime as SourceTzOffsetDateTimeApi,
    TradingMarket as TradingMarketApi,
    TradingState as TradingStateApi
} from '../../../../api';
import { ExchangeApiConstructor, TradingMarketApiConstructor } from '../../constructors';
import { CorrectnessImplementation } from '../../sys/correctness-implementation';
import { FeedStatusImplementation } from '../feed-status-api-implementation';
import { TradingStateImplementation } from '../trading-state-api-implementation';
import { MarketImplementation } from './market-api-implementation';
import { MarketBoardImplementation } from './market-board-api-implementation';

export class DataMarketImplementation extends MarketImplementation<DataMarket> implements DataMarketApi {
    constructor(
        actual: DataMarket,
        exchangeApiConstructor: ExchangeApiConstructor,
        tradingMarketApiConstructor: TradingMarketApiConstructor,
    ) {
        super(actual, exchangeApiConstructor, DataMarketImplementation, tradingMarketApiConstructor);
    }

    get marketBoards(): MarketBoardApi[] {
        return MarketBoardImplementation.listToArrayApi(this.actual.marketBoards, this._exchangeApiConstructor, DataMarketImplementation, this._tradingMarketApiConstructor);
    }
    get feedStatus(): FeedStatusApi {
        return FeedStatusImplementation.toApi(this.actual.feedStatusId);
    }
    get tradingDate(): SourceTzOffsetDateApi | undefined { return this.actual.tradingDate; }
    get marketTime(): SourceTzOffsetDateTimeApi | undefined { return this.actual.marketTime; }
    get status(): string | undefined { return this.actual.status; }
    get tradingStateAllows(): TradingStateApi.Allows | undefined {
        const allowIds = this.actual.allowIds;
        if (allowIds === undefined) {
            return undefined;
        } else {
            return TradingStateImplementation.Allow.arrayToApi(allowIds);
        }
    }
    get tradingStateReason(): TradingStateApi.Reason | undefined {
        const reasonId = this.actual.reasonId;
        if (reasonId === undefined) {
            return undefined;
        } else {
            return TradingStateImplementation.Reason.toApi(reasonId);
        }
    }
    get usable(): boolean { return this.actual.usable; }
    get correctness(): CorrectnessApi {
        return CorrectnessImplementation.toApi(this.actual.correctnessId);
    }
    get tradingStates(): TradingStateApi[] {
        return TradingStateImplementation.arrayToApi(this.actual.tradingStates);
    }
    get bestTradingMarket(): TradingMarketApi | undefined {
        const bestTradingMarket = this.actual.bestTradingMarket;
        if (bestTradingMarket === undefined) {
            return undefined;
        } else {
            return new this._tradingMarketApiConstructor(bestTradingMarket, this._exchangeApiConstructor, DataMarketImplementation);
        }
    }
    get bestLitForTradingMarkets(): TradingMarketApi[] {
        const actualArray = this.actual.bestLitForTradingMarkets;
        const count = actualArray.length;
        const result = new Array<TradingMarketApi>(count);
        for (let i = 0; i < actualArray.length; i++) {
            const actualTradingMarket = actualArray[i];
            result[i] = new this._tradingMarketApiConstructor(actualTradingMarket, this._exchangeApiConstructor, DataMarketImplementation);
        }
        return result;
    }
}

export namespace DataMarketImplementation {
    export function toApi(
        market: DataMarket,
        exchangeApiConstructor: ExchangeApiConstructor,
        tradingMarketApiConstructor: TradingMarketApiConstructor,
    ) {
        return new DataMarketImplementation(market, exchangeApiConstructor, tradingMarketApiConstructor);
    }

    export function fromApi(value: DataMarketApi) {
        const implementation = value as DataMarketImplementation;
        return implementation.actual;
    }

    export function arrayToApi(
        value: readonly DataMarket[],
        exchangeApiConstructor: ExchangeApiConstructor,
        tradingMarketApiConstructor: TradingMarketApiConstructor,
    ): DataMarketApi[] {
        const count = value.length;
        const result = new Array<DataMarketApi>(count);
        for (let i = 0; i < count; i++) {
            result[i] = toApi(value[i], exchangeApiConstructor, tradingMarketApiConstructor);
        }
        return result;
    }

    export function arrayFromApi(value: readonly DataMarketApi[]): DataMarket[] {
        const count = value.length;
        const result = new Array<DataMarket>(count);
        for (let i = 0; i < count; i++) {
            const dataMarket = value[i];
            result[i] = fromApi(dataMarket);
        }
        return result;
    }

    export function listToArrayApi(
        list: ComparableList<DataMarket>,
        exchangeApiConstructor: ExchangeApiConstructor,
        tradingMarketApiConstructor: TradingMarketApiConstructor,
    ): DataMarketApi[] {
        const count = list.count;
        const result = new Array<DataMarketApi>(count);
        for (let i = 0; i < count; i++) {
            const board = list.getAt(i);
            result[i] = toApi(board, exchangeApiConstructor, tradingMarketApiConstructor);
        }
        return result;
    }
}
