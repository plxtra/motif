import { ComparableList } from '@pbkware/js-utils';
import { MarketBoard } from '@plxtra/motif-core';
import {
    DataMarket as DataMarketApi,
    MarketBoard as MarketBoardApi,
    TradingState as TradingStateApi,
} from '../../../../api';
import { DataMarketApiConstructor, ExchangeApiConstructor, TradingMarketApiConstructor } from '../../constructors';
import { TradingStateImplementation } from '../trading-state-api-implementation';

export class MarketBoardImplementation implements MarketBoardApi {
    constructor(
        readonly actual: MarketBoard,
        private readonly _exchangeApiConstructor: ExchangeApiConstructor,
        private readonly _dataMarketApiConstructor: DataMarketApiConstructor,
        private readonly _tradingMarketApiConstructor: TradingMarketApiConstructor,
    ) { }

    get zenithCode(): string { return this.actual.zenithCode; }
    get unenvironmentedZenithCode(): string { return this.actual.unenvironmentedZenithCode; }
    get name(): string { return this.actual.name; }
    get display(): string { return this.actual.display; }
    get market(): DataMarketApi {
        const actualMarket = this.actual.market;
        return new this._dataMarketApiConstructor(actualMarket, this._exchangeApiConstructor, this._tradingMarketApiConstructor);
    }
    get unknown(): boolean { return this.actual.unknown; }
    get feedInitialising(): boolean { return this.actual.feedInitialising; }
    get status(): string | undefined { return this.actual.status; }
    get allows(): TradingStateApi.Allows | undefined {
        const allowIds = this.actual.allowIds;
        if (allowIds === undefined) {
            return undefined;
        } else {
            return TradingStateImplementation.Allow.arrayToApi(allowIds);
        }
    }
    get reason(): TradingStateApi.Reason | undefined {
        const reasonId = this.actual.reasonId;
        if (reasonId === undefined) {
            return undefined;
        } else {
            return TradingStateImplementation.Reason.toApi(reasonId);
        }
    }
}

export namespace MarketBoardImplementation {
    export function toApi(
        board: MarketBoard,
        exchangeApiConstructor: ExchangeApiConstructor,
        dataMarketApiConstructor: DataMarketApiConstructor,
        tradingMarketApiConstructor: TradingMarketApiConstructor,
    ) {
        return new MarketBoardImplementation(board, exchangeApiConstructor, dataMarketApiConstructor, tradingMarketApiConstructor);
    }

    export function fromApi(value: MarketBoardApi) {
        const implementation = value as MarketBoardImplementation;
        return implementation.actual;
    }

    export function arrayToApi(
        value: readonly MarketBoard[],
        exchangeApiConstructor: ExchangeApiConstructor,
        dataMarketApiConstructor: DataMarketApiConstructor,
        tradingMarketApiConstructor: TradingMarketApiConstructor,
    ): MarketBoardApi[] {
        const count = value.length;
        const result = new Array<MarketBoardApi>(count);
        for (let i = 0; i < count; i++) {
            result[i] = toApi(value[i], exchangeApiConstructor, dataMarketApiConstructor, tradingMarketApiConstructor);
        }
        return result;
    }

    export function listToArrayApi(
        list: ComparableList<MarketBoard>,
        exchangeApiConstructor: ExchangeApiConstructor,
        dataMarketApiConstructor: DataMarketApiConstructor,
        tradingMarketApiConstructor: TradingMarketApiConstructor,
    ): MarketBoardApi[] {
        const count = list.count;
        const result = new Array<MarketBoardApi>(count);
        for (let i = 0; i < count; i++) {
            const board = list.getAt(i);
            result[i] = toApi(board, exchangeApiConstructor, dataMarketApiConstructor, tradingMarketApiConstructor);
        }
        return result;
    }
}
