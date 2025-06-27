import { TradingIvemId, TradingMarket } from '@plxtra/motif-core';
import { DataIvemId as DataIvemIdApi, TradingIvemId as TradingIvemIdApi, TradingMarket as TradingMarketApi } from '../../../../api';
import { DataMarketImplementation, ExchangeImplementation, TradingMarketImplementation } from '../markets/internal-api';
import { DataIvemIdImplementation } from './data-ivem-id-api-implementation';
import { MarketIvemIdImplementation } from './market-ivem-id-api-implementation';

export class TradingIvemIdImplementation extends MarketIvemIdImplementation<TradingMarketApi, TradingMarket> implements TradingIvemIdApi {
    declare readonly actual: TradingIvemId;

    get bestLitDataIvemId(): DataIvemIdApi | undefined {
        const actualBestLitDataIvemId = this.actual.bestLitDataIvemId;
        if (actualBestLitDataIvemId === undefined) {
            return undefined;
        } else {
            return DataIvemIdImplementation.toApi(actualBestLitDataIvemId);
        }
    }

    createCopy(): TradingIvemIdApi {
        const actualCopy = this.actual.createCopy();
        return TradingIvemIdImplementation.toApi(actualCopy);
    }

    protected getMarketApi(): TradingMarketApi {
        return TradingMarketImplementation.toApi(this.actual.market, ExchangeImplementation, DataMarketImplementation);
    }
}

export namespace TradingIvemIdImplementation {
    export function toApi(actual: TradingIvemId) {
        return new TradingIvemIdImplementation(actual);
    }

    export function fromApi(tradingIvemIdApi: TradingIvemIdApi) {
        const implementation = tradingIvemIdApi as TradingIvemIdImplementation;
        return implementation.actual;
    }

    export function arrayToApi(actualArray: readonly TradingIvemId[]): TradingIvemIdApi[] {
        const count = actualArray.length;
        const result = new Array<TradingIvemIdApi>(count);
        for (let i = 0; i < count; i++) {
            const actual = actualArray[i];
            result[i] = toApi(actual);
        }
        return result;
    }

    export function arrayFromApi(tradingIvemIdArrayApi: readonly TradingIvemIdApi[]): TradingIvemId[] {
        const count = tradingIvemIdArrayApi.length;
        const result = new Array<TradingIvemId>(count);
        for (let i = 0; i < count; i++) {
            const tradingIvemIdApi = tradingIvemIdArrayApi[i];
            result[i] = fromApi(tradingIvemIdApi);
        }
        return result;
    }
}
