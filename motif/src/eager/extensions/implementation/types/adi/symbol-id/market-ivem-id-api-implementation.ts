import { Market, MarketIvemId } from '@plxtra/motif-core';
import {
    DataMarket as DataMarketApi,
    Exchange as ExchangeApi,
    ExchangeEnvironment as ExchangeEnvironmentApi,
    IvemId as IvemIdApi,
    JsonElement as JsonElementApi,
    Market as MarketApi,
    MarketIvemId as MarketIvemIdApi,
} from '../../../../api';
import { JsonElementImplementation } from '../../sys/internal-api';
import { DataMarketImplementation, ExchangeEnvironmentImplementation, ExchangeImplementation, TradingMarketImplementation } from '../markets/internal-api';
import { IvemIdImplementation } from './ivem-id-implementation';

export abstract class MarketIvemIdImplementation<T extends MarketApi, A extends Market> implements MarketIvemIdApi<T> {
    constructor(
        readonly actual: MarketIvemId<A>,
    ) { }

    get code() { return this.actual.code; }
    get market(): T {
        return this.getMarketApi();
    }
    get name() { return this.actual.name; }
    get mapKey() { return this.actual.mapKey; }

    get exchangeEnvironmentExplicit(): boolean { return this.actual.exchangeEnvironmentExplicit; }
    get marketZenithCode(): string { return this.actual.marketZenithCode; }

    get exchangeEnvironment(): ExchangeEnvironmentApi {
        return ExchangeEnvironmentImplementation.toApi(this.actual.exchangeEnvironment, ExchangeImplementation, DataMarketImplementation, TradingMarketImplementation);
    }
    get exchange(): ExchangeApi {
        return ExchangeImplementation.toApi(this.actual.exchange);
    }
    abstract get bestLitDataIvemId(): MarketIvemIdApi<DataMarketApi> | undefined;


    createIvemId(): IvemIdApi {
        const ivemId = this.actual.ivemId;
        return IvemIdImplementation.toApi(ivemId);
    }

    saveToJson(elementApi: JsonElementApi): void {
        const element = JsonElementImplementation.fromApi(elementApi);
        this.actual.saveToJson(element);
    }

    abstract createCopy(): MarketIvemIdApi<T>;

    protected abstract getMarketApi(): T;
}

export namespace MarketIvemIdImplementation {
    export type ToApiFtn<T extends MarketApi, A extends Market> = (actual: MarketIvemId<A>) => MarketIvemIdApi<T>;

    export function fromMarketApi<T extends MarketApi, A extends Market>(value: MarketIvemIdApi<T>): MarketIvemId<A> {
        const implementation = value as MarketIvemIdImplementation<T, A>;
        return implementation.actual;
    }
}
