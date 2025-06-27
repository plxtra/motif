import { DataMarket, MarketsService, TradingMarket } from '@plxtra/motif-core';
import {
    DataMarket as DataMarketApi,
    DataMarketList as DataMarketListApi,
    Exchange as ExchangeApi,
    ExchangeEnvironment as ExchangeEnvironmentApi,
    ExchangeEnvironmentList as ExchangeEnvironmentListApi,
    ExchangeList as ExchangeListApi,
    MarketBoard as MarketBoardApi,
    MarketBoardList as MarketBoardListApi,
    MarketsSvc,
    TradingMarket as TradingMarketApi,
    TradingMarketList as TradingMarketListApi
} from '../../../../api';
import {
    DataMarketImplementation,
    DataMarketListImplementation,
    ExchangeEnvironmentImplementation,
    ExchangeEnvironmentListImplementation,
    ExchangeImplementation,
    ExchangeListImplementation,
    MarketBoardImplementation,
    MarketBoardListImplementation,
    TradingMarketImplementation,
    TradingMarketListImplementation
} from '../../../types/internal-api';

export class MarketsSvcImplementation implements MarketsSvc {
    constructor(private readonly _marketsService: MarketsService) {

    }

    get exchangeEnvironments(): ExchangeEnvironmentListApi {
        return ExchangeEnvironmentListImplementation.toApi(this._marketsService.exchangeEnvironments);
    }

    get exchanges(): ExchangeListApi {
        return ExchangeListImplementation.toApi(this._marketsService.exchanges);
    }

    get dataMarkets(): DataMarketListApi {
        return DataMarketListImplementation.toApi(this._marketsService.dataMarkets);
    }

    get tradingMarkets(): TradingMarketListApi {
        return TradingMarketListImplementation.toApi(this._marketsService.tradingMarkets);
    }

    get marketBoards(): MarketBoardListApi {
        return MarketBoardListImplementation.toApi(this._marketsService.marketBoards);
    }

    get defaultExchangeEnvironmentExchanges(): ExchangeListApi {
        return ExchangeListImplementation.toApi(this._marketsService.defaultExchangeEnvironmentExchanges);
    }

    get defaultExchangeEnvironmentDataMarkets(): DataMarketListApi {
        return DataMarketListImplementation.toApi(this._marketsService.defaultExchangeEnvironmentDataMarkets);
    }

    get defaultExchangeEnvironmentTradingMarkets(): TradingMarketListApi {
        return TradingMarketListImplementation.toApi(this._marketsService.defaultExchangeEnvironmentTradingMarkets);
    }

    get defaultExchangeEnvironmentMarketBoards(): MarketBoardListApi {
        return MarketBoardListImplementation.toApi(this._marketsService.defaultExchangeEnvironmentMarketBoards);
    }

    get unknownExchangeEnvironments(): ExchangeEnvironmentListApi {
        return ExchangeEnvironmentListImplementation.toApi(this._marketsService.unknownExchangeEnvironments);
    }

    get unknownExchanges(): ExchangeListApi {
        return ExchangeListImplementation.toApi(this._marketsService.unknownExchanges);
    }

    get unknownDataMarkets(): DataMarketListApi {
        return DataMarketListImplementation.toApi(this._marketsService.unknownDataMarkets);
    }

    get unknownTradingMarkets(): TradingMarketListApi {
        return TradingMarketListImplementation.toApi(this._marketsService.unknownTradingMarkets);
    }

    get unknownMarketBoards(): MarketBoardListApi {
        return MarketBoardListImplementation.toApi(this._marketsService.unknownMarketBoards);
    }

    get genericUnknownExchangeEnvironment(): ExchangeEnvironmentApi {
        const environment = this._marketsService.genericUnknownExchangeEnvironment;
        return ExchangeEnvironmentImplementation.toApi(environment, ExchangeImplementation, DataMarketImplementation, TradingMarketImplementation);
    }

    get genericUnknownExchange(): ExchangeApi {
        const exchange = this._marketsService.genericUnknownExchange;
        return ExchangeImplementation.toApi(exchange);
    }

    get genericUnknownDataMarket(): DataMarketApi {
        const market = this._marketsService.genericUnknownDataMarket;
        return DataMarketImplementation.toApi(market, ExchangeImplementation, TradingMarketImplementation);
    }

    get genericUnknownTradingMarket(): TradingMarketApi {
        const market = this._marketsService.genericUnknownTradingMarket;
        return TradingMarketImplementation.toApi(market, ExchangeImplementation, DataMarketImplementation);
    }

    get genericUnknownMarketBoard(): MarketBoardApi {
        const board = this._marketsService.genericUnknownMarketBoard;
        return MarketBoardImplementation.toApi(board, ExchangeImplementation, DataMarketImplementation, TradingMarketImplementation);
    }

    get defaultExchangeEnvironment(): ExchangeEnvironmentApi {
        const environment = this._marketsService.genericUnknownExchangeEnvironment;
        return ExchangeEnvironmentImplementation.toApi(environment, ExchangeImplementation, DataMarketImplementation, TradingMarketImplementation);
    }

    get defaultDefaultExchange(): ExchangeApi {
        const exchange = this._marketsService.defaultDefaultExchange;
        return ExchangeImplementation.toApi(exchange);
    }

    tryGetExchangeEnvironment(zenithCode: ExchangeEnvironmentApi.ZenithCode, unknownAllowed?: boolean): ExchangeEnvironmentApi | undefined {
        const environment = this._marketsService.tryGetExchangeEnvironment(zenithCode, unknownAllowed ?? false);
        if (environment === undefined) {
            return undefined;
        } else {
            return ExchangeEnvironmentImplementation.toApi(environment, ExchangeImplementation, DataMarketImplementation, TradingMarketImplementation);
        }
    }

    getExchangeEnvironmentOrUnknown(zenithCode: ExchangeEnvironmentApi.ZenithCode): ExchangeEnvironmentApi {
        const environment = this._marketsService.getExchangeEnvironmentOrUnknown(zenithCode);
        return ExchangeEnvironmentImplementation.toApi(environment, ExchangeImplementation, DataMarketImplementation, TradingMarketImplementation);
    }

    tryGetExchange(zenithCode: string, unknownAllowed?: boolean): ExchangeApi | undefined {
        const exchange = this._marketsService.tryGetExchange(zenithCode, unknownAllowed ?? false);
        if (exchange === undefined) {
            return undefined;
        } else {
            return ExchangeImplementation.toApi(exchange);
        }
    }

    getExchangeOrUnknown(zenithCode: string): ExchangeApi {
        const exchange = this._marketsService.getExchangeOrUnknown(zenithCode);
        return ExchangeImplementation.toApi(exchange);
    }

    tryGetDefaultEnvironmentExchange(unenvironmentedZenithCode: string, unknownAllowed?: boolean): ExchangeApi | undefined {
        const exchange = this._marketsService.tryGetDefaultEnvironmentExchange(unenvironmentedZenithCode, unknownAllowed ?? false);
        if (exchange === undefined) {
            return undefined;
        } else {
            return ExchangeImplementation.toApi(exchange);
        }
    }

    getDefaultEnvironmentExchangeOrUnknown(unenvironmentedZenithCode: string): ExchangeApi {
        const exchange = this._marketsService.getDefaultEnvironmentExchangeOrUnknown(unenvironmentedZenithCode);
        return ExchangeImplementation.toApi(exchange);
    }

    getDataMarkets(zenithCodes: readonly string[], includeUnknown?: boolean): DataMarketApi[] {
        const actualMarkets = this._marketsService.getDataMarkets(zenithCodes, includeUnknown ?? false);
        return DataMarketImplementation.arrayToApi(actualMarkets, ExchangeImplementation, TradingMarketImplementation);
    }

    tryGetDataMarket(zenithCode: string, unknownAllowed?: boolean): DataMarketApi | undefined {
        const market = this._marketsService.tryGetDataMarket(zenithCode, unknownAllowed ?? false);
        if (market === undefined) {
            return undefined;
        } else {
            return DataMarketImplementation.toApi(market, ExchangeImplementation, TradingMarketImplementation);
        }
    }

    getDataMarketOrUnknown(zenithCode: string): DataMarketApi {
        const market = this._marketsService.getDataMarketOrUnknown(zenithCode);
        return DataMarketImplementation.toApi(market, ExchangeImplementation, TradingMarketImplementation);
    }

    tryGetDefaultEnvironmentDataMarket(unenvironmentedZenithCode: string, unknownAllowed?: boolean): DataMarketApi | undefined {
        const market = this._marketsService.tryGetDefaultEnvironmentDataMarket(unenvironmentedZenithCode, unknownAllowed ?? false);
        if (market === undefined) {
            return undefined;
        } else {
            return DataMarketImplementation.toApi(market, ExchangeImplementation, TradingMarketImplementation);
        }
    }

    getDefaultEnvironmentDataMarketOrUnknown(unenvironmentedZenithCode: string): DataMarketApi {
        const market = this._marketsService.getDefaultEnvironmentDataMarketOrUnknown(unenvironmentedZenithCode);
        return DataMarketImplementation.toApi(market, ExchangeImplementation, TradingMarketImplementation);
    }

    getTradingMarkets(zenithCodes: readonly string[], includeUnknown?: boolean): TradingMarketApi[] {
        const actualMarkets = this._marketsService.getTradingMarkets(zenithCodes, includeUnknown ?? false);
        return TradingMarketImplementation.arrayToApi(actualMarkets, ExchangeImplementation, DataMarketImplementation);
    }

    tryGetTradingMarket(zenithCode: string, unknownAllowed?: boolean): TradingMarketApi | undefined {
        const market = this._marketsService.tryGetTradingMarket(zenithCode, unknownAllowed ?? false);
        if (market === undefined) {
            return undefined;
        } else {
            return TradingMarketImplementation.toApi(market, ExchangeImplementation, DataMarketImplementation);
        }
    }

    getTradingMarketOrUnknown(zenithCode: string): TradingMarketApi {
        const market = this._marketsService.getTradingMarketOrUnknown(zenithCode);
        return TradingMarketImplementation.toApi(market, ExchangeImplementation, DataMarketImplementation);
    }

    tryGetDefaultEnvironmentTradingMarket(unenvironmentedZenithCode: string, unknownAllowed?: boolean): TradingMarketApi | undefined {
        const market = this._marketsService.tryGetDefaultEnvironmentTradingMarket(unenvironmentedZenithCode, unknownAllowed ?? false);
        if (market === undefined) {
            return undefined;
        } else {
            return TradingMarketImplementation.toApi(market, ExchangeImplementation, DataMarketImplementation);
        }
    }

    getDefaultEnvironmentTradingMarketOrUnknown(unenvironmentedZenithCode: string): TradingMarketApi {
        const market = this._marketsService.getDefaultEnvironmentTradingMarketOrUnknown(unenvironmentedZenithCode);
        return TradingMarketImplementation.toApi(market, ExchangeImplementation, DataMarketImplementation);
    }

    getMarketBoards(zenithCodes: readonly string[], includeUnknown?: boolean, market?: DataMarketApi): MarketBoardApi[] {
        const actualMarket = market === undefined ? undefined : DataMarketImplementation.fromApi(market);
        const actualBoards = this._marketsService.getMarketBoards(zenithCodes, includeUnknown ?? false, actualMarket);
        return MarketBoardImplementation.arrayToApi(actualBoards, ExchangeImplementation, DataMarketImplementation, TradingMarketImplementation);
    }

    tryGetMarketBoard(zenithCode: string, unknownAllowed?: boolean, market?: DataMarketApi): MarketBoardApi | undefined {
        const actualMarket = market === undefined ? undefined : DataMarketImplementation.fromApi(market);
        const board = this._marketsService.tryGetMarketBoard(zenithCode, unknownAllowed ?? false, actualMarket);
        if (board === undefined) {
            return undefined;
        } else {
            return MarketBoardImplementation.toApi(board, ExchangeImplementation, DataMarketImplementation, TradingMarketImplementation);
        }
    }

    getMarketBoardOrUnknown(zenithCode: string, market?: DataMarketApi): MarketBoardApi {
        const actualMarket = market === undefined ? undefined : DataMarketImplementation.fromApi(market);
        const board = this._marketsService.getMarketBoardOrUnknown(zenithCode, actualMarket);
        return MarketBoardImplementation.toApi(board, ExchangeImplementation, DataMarketImplementation, TradingMarketImplementation);
    }

    tryGetDefaultEnvironmentMarketBoard(unenvironmentedZenithCode: string, unknownAllowed?: boolean): MarketBoardApi | undefined {
        const board = this._marketsService.tryGetDefaultEnvironmentMarketBoard(unenvironmentedZenithCode, unknownAllowed ?? false);
        if (board === undefined) {
            return undefined;
        } else {
            return MarketBoardImplementation.toApi(board, ExchangeImplementation, DataMarketImplementation, TradingMarketImplementation);
        }
    }

    getDefaultEnvironmentMarketBoardOrUnknown(unenvironmentedZenithCode: string): MarketBoardApi {
        const board = this._marketsService.getDefaultEnvironmentMarketBoardOrUnknown(unenvironmentedZenithCode);
        return MarketBoardImplementation.toApi(board, ExchangeImplementation, DataMarketImplementation, TradingMarketImplementation);
    }
}

export namespace MarketsSvcImplementation {
    export function exchangeEnvironmentListToApiArray(list: MarketsService.ExchangeEnvironments): ExchangeEnvironmentApi[] {
        const count = list.count;
        const result = new Array<ExchangeEnvironmentApi>(count);
        for (let i = 0; i < count; i++) {
            const actualEnvironment = list.getAt(i);
            result[i] = ExchangeEnvironmentImplementation.toApi(actualEnvironment, ExchangeImplementation, DataMarketImplementation, TradingMarketImplementation);
        }
        return result;
    }

    export function exchangeListToApiArray(list: MarketsService.Exchanges): ExchangeApi[] {
        const count = list.count;
        const result = new Array<ExchangeApi>(count);
        for (let i = 0; i < count; i++) {
            const actualExchange = list.getAt(i);
            result[i] = ExchangeImplementation.toApi(actualExchange);
        }
        return result;
    }

    export function dataMarketListToApiArray(list: MarketsService.Markets<DataMarket>): DataMarketApi[] {
        const count = list.count;
        const result = new Array<DataMarketApi>(count);
        for (let i = 0; i < count; i++) {
            const actualMarket = list.getAt(i);
            result[i] = DataMarketImplementation.toApi(actualMarket, ExchangeImplementation, TradingMarketImplementation);
        }
        return result;
    }

    export function tradingMarketListToApiArray(list: MarketsService.Markets<TradingMarket>): TradingMarketApi[] {
        const count = list.count;
        const result = new Array<TradingMarketApi>(count);
        for (let i = 0; i < count; i++) {
            const actualMarket = list.getAt(i);
            result[i] = TradingMarketImplementation.toApi(actualMarket, ExchangeImplementation, DataMarketImplementation);
        }
        return result;
    }

    export function marketBoardListToApiArray(list: MarketsService.MarketBoards): MarketBoardApi[] {
        const count = list.count;
        const result = new Array<MarketBoardApi>(count);
        for (let i = 0; i < count; i++) {
            const actualBoard = list.getAt(i);
            result[i] = MarketBoardImplementation.toApi(actualBoard, ExchangeImplementation, DataMarketImplementation, TradingMarketImplementation);
        }
        return result;
    }
}
