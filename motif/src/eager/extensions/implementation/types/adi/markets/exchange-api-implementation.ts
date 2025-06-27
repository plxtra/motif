import { ComparableList } from '@pbkware/js-utils';
import { Exchange } from '@plxtra/motif-core';
import {
    DataMarket as DataMarketApi,
    Exchange as ExchangeApi,
    ExchangeEnvironment as ExchangeEnvironmentApi,
    Integer as IntegerApi,
    SymbolField as SymbolFieldApi,
    TradingMarket as TradingMarketApi,
} from '../../../../api';
import { SymbolFieldImplementation } from '../symbol-field-api-implementation';
import { DataMarketImplementation } from './data-market-api-implementation';
import { ExchangeEnvironmentImplementation } from './exchange-environment-api-implementation';
import { TradingMarketImplementation } from './trading-market-api-implementation';

export class ExchangeImplementation implements ExchangeApi {
    constructor(readonly actual: Exchange) { }

    get mapKey(): string { return this.actual.mapKey; }
    get zenithCode(): string { return this.actual.zenithCode; }
    get unenvironmentedZenithCode(): string { return this.actual.unenvironmentedZenithCode; }
    get exchangeEnvironment(): ExchangeEnvironmentApi {
        return ExchangeEnvironmentImplementation.toApi(this.actual.exchangeEnvironment, ExchangeImplementation, DataMarketImplementation, TradingMarketImplementation);
    }
    get unknown(): boolean { return this.actual.unknown; }
    get abbreviatedDisplay(): string { return this.actual.abbreviatedDisplay; }
    get fullDisplay(): string { return this.actual.fullDisplay; }
    get displayPriority(): number | undefined { return this.actual.displayPriority; }

    get allowedSymbolNameFieldIds(): SymbolFieldApi[] {
        return SymbolFieldImplementation.arrayToApi(this.actual.allowedSymbolNameFieldIds);
    }
    get defaultSymbolNameFieldId(): SymbolFieldApi {
        return SymbolFieldImplementation.toApi(this.actual.defaultSymbolNameFieldId);
    }
    get allowedSymbolSearchFieldIds(): readonly SymbolFieldApi[] {
        return SymbolFieldImplementation.arrayToApi(this.actual.allowedSymbolSearchFieldIds);
    }
    get defaultSymbolSearchFieldIds(): readonly SymbolFieldApi[] {
        return SymbolFieldImplementation.arrayToApi(this.actual.defaultSymbolSearchFieldIds);
    }

    get dataMarketCount(): IntegerApi { return this.actual.dataMarkets.length; }
    get dataMarkets(): DataMarketApi[] {
        return DataMarketImplementation.arrayToApi(this.actual.dataMarkets, ExchangeImplementation, TradingMarketImplementation);
    }

    get tradingMarketCount(): IntegerApi { return this.actual.tradingMarkets.length; }
    get tradingMarkets(): readonly TradingMarketApi[] {
        return TradingMarketImplementation.arrayToApi(this.actual.tradingMarkets, ExchangeImplementation, DataMarketImplementation);
    }

    get isDefaultDefault(): boolean { return this.actual.isDefaultDefault; }
    get exchangeEnvironmentIsDefault(): boolean { return this.actual.exchangeEnvironmentIsDefault; }
    get symbologyCode(): string { return this.actual.symbologyCode; }
    get defaultLitMarket(): DataMarketApi | undefined {
        const actualDefaultLitMarket = this.actual.defaultLitMarket;
        if (actualDefaultLitMarket === undefined) {
            return undefined;
        } else {
            return DataMarketImplementation.toApi(actualDefaultLitMarket, ExchangeImplementation, TradingMarketImplementation);
        }
    }
    get defaultTradingMarket(): TradingMarketApi | undefined {
        const actualDefaultTradingMarket = this.actual.defaultTradingMarket;
        if (actualDefaultTradingMarket === undefined) {
            return undefined;
        } else {
            return TradingMarketImplementation.toApi(actualDefaultTradingMarket, ExchangeImplementation, DataMarketImplementation);
        }
    }

    // getMarkets<T extends MarketApi>(marketType: MarketApi.Type): T[] {
    //     const marketTypeId = MarketImplementation.Type.toApi(marketType);
    //     const markets = this._actual.getMarkets(marketTypeId) as T;
    //     MarketImplementation.arrayToApi(marketTypeId, markets)
    // }
    // getDefaultMarket<T extends MarketApi>(marketTypeId: MarketApi.Type): T {

    // }
}

export namespace ExchangeImplementation {
    export function toApi(exchange: Exchange): ExchangeApi {
        return new ExchangeImplementation(exchange);
    }

    export function fromApi(exchangeApi: ExchangeApi) {
        const implementation = exchangeApi as ExchangeImplementation;
        return implementation.actual;
    }

    export function arrayToApi(exchanges: readonly Exchange[]): ExchangeApi[] {
        const count = exchanges.length;
        const result = new Array<ExchangeApi>(count);
        for (let i = 0; i < count; i++) {
            const exchange = exchanges[i];
            result[i] = new ExchangeImplementation(exchange);
        }
        return result;
    }

    export function listToArrayApi(list: ComparableList<Exchange>): ExchangeApi[] {
        const count = list.count;
        const result = new Array<ExchangeApi>(count);
        for (let i = 0; i < count; i++) {
            const board = list.getAt(i);
            result[i] = toApi(board);
        }
        return result;
    }
}
