import { ExchangeEnvironment } from '@plxtra/motif-core';
import {
    DataMarket as DataMarketApi,
    Exchange as ExchangeApi,
    ExchangeEnvironment as ExchangeEnvironmentApi,
    Integer as IntegerApi,
    TradingMarket as TradingMarketApi
} from '../../../../api';
import { DataMarketApiConstructor, ExchangeApiConstructor, TradingMarketApiConstructor } from '../../constructors';

export class ExchangeEnvironmentImplementation implements ExchangeEnvironmentApi {
    constructor(
        readonly actual: ExchangeEnvironment,
        private readonly _exchangeApiConstructor: ExchangeApiConstructor,
        private readonly _dataMarketApiConstructor: DataMarketApiConstructor,
        private readonly _tradingMarketApiConstructor: TradingMarketApiConstructor,
    ) { }

    get mapKey(): string { return this.actual.mapKey; }
    get display(): string { return this.actual.display; }
    get production(): boolean { return this.actual.production; }
    get zenithCode(): ExchangeEnvironmentApi.ZenithCode { return this.actual.zenithCode; }
    get unknown(): boolean { return this.actual.unknown; }

    get exchangeCount(): IntegerApi { return this.actual.exchangeCount; }
    get exchanges(): ExchangeApi[] {
        const exchanges = this.actual.exchanges;
        const count = exchanges.length;
        const result = new Array<ExchangeApi>(count);
        for (let i = 0; i < count; i++) {
            const exchange = exchanges[i];
            result[i] = new this._exchangeApiConstructor(exchange);
        }
        return result;
    }

    get dataMarketCount(): IntegerApi { return this.actual.dataMarketCount; }
    get dataMarkets(): DataMarketApi[] {
        const dataMarkets = this.actual.dataMarkets;
        const count = dataMarkets.length;
        const result = new Array<DataMarketApi>(count);
        for (let i = 0; i < count; i++) {
            const dataMarket = dataMarkets[i];
            result[i] = new this._dataMarketApiConstructor(dataMarket, this._exchangeApiConstructor, this._tradingMarketApiConstructor);
        }
        return result;
    }

    get tradingMarketCount(): IntegerApi { return this.actual.tradingMarketCount; }
    get tradingMarkets(): TradingMarketApi[] {
        const tradingMarkets = this.actual.tradingMarkets;
        const count = tradingMarkets.length;
        const result = new Array<TradingMarketApi>(count);
        for (let i = 0; i < count; i++) {
            const tradingMarket = tradingMarkets[i];
            result[i] = new this._tradingMarketApiConstructor(tradingMarket, this._exchangeApiConstructor, this._dataMarketApiConstructor);
        }
        return result;
    }
}

export namespace ExchangeEnvironmentImplementation {
    export function toApi(
        environment: ExchangeEnvironment,
        exchangeApiConstructor: ExchangeApiConstructor,
        dataMarketApiConstructor: DataMarketApiConstructor,
        tradingMarketApiConstructor: TradingMarketApiConstructor,
    ) {
        return new ExchangeEnvironmentImplementation(environment, exchangeApiConstructor, dataMarketApiConstructor, tradingMarketApiConstructor);
    }

    export function fromApi(value: ExchangeEnvironmentApi) {
        return (value as ExchangeEnvironmentImplementation).actual;
    }

    export function arrayToApi(
        environments: readonly ExchangeEnvironment[],
        exchangeApiConstructor: ExchangeApiConstructor,
        dataMarketApiConstructor: DataMarketApiConstructor,
        tradingMarketApiConstructor: TradingMarketApiConstructor,
    ): ExchangeEnvironmentApi[] {
        const count = environments.length;
        const result = new Array<ExchangeEnvironmentApi>(count);
        for (let i = 0; i < count; i++) {
            const exchange = environments[i];
            result[i] = new ExchangeEnvironmentImplementation(exchange, exchangeApiConstructor, dataMarketApiConstructor, tradingMarketApiConstructor);
        }
        return result;
    }
}
