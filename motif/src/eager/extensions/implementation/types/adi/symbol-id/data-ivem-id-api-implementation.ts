import { DataIvemId, DataMarket } from '@plxtra/motif-core';
import { DataIvemId as DataIvemIdApi, DataMarket as DataMarketApi } from '../../../../api';
import { DataMarketImplementation, ExchangeImplementation, TradingMarketImplementation } from '../markets/internal-api';
import { MarketIvemIdImplementation } from './market-ivem-id-api-implementation';

export class DataIvemIdImplementation extends MarketIvemIdImplementation<DataMarketApi, DataMarket> implements DataIvemIdApi {
    declare readonly actual: DataIvemId;

    get bestLitDataIvemId(): DataIvemIdApi | undefined {
        const actualBestLitDataIvemId = this.actual.bestLitDataIvemId;
        if (actualBestLitDataIvemId === undefined) {
            return undefined;
        } else {
            return DataIvemIdImplementation.toApi(actualBestLitDataIvemId);
        }
    }

    createCopy(): DataIvemIdApi {
        const actualCopy = this.actual.createCopy();
        return DataIvemIdImplementation.toApi(actualCopy);
    }

    protected getMarketApi(): DataMarketApi {
        return DataMarketImplementation.toApi(this.actual.market, ExchangeImplementation, TradingMarketImplementation);
    }
}

export namespace DataIvemIdImplementation {
    export function toApi(actual: DataIvemId) {
        return new DataIvemIdImplementation(actual);
    }

    export function fromApi(dataIvemIdApi: DataIvemIdApi) {
        const implementation = dataIvemIdApi as DataIvemIdImplementation;
        return implementation.actual;
    }

    export function arrayToApi(actualArray: readonly DataIvemId[]): DataIvemIdApi[] {
        const count = actualArray.length;
        const result = new Array<DataIvemIdApi>(count);
        for (let i = 0; i < count; i++) {
            const actual = actualArray[i];
            result[i] = toApi(actual);
        }
        return result;
    }

    export function arrayFromApi(dataIvemIdArrayApi: readonly DataIvemIdApi[]): DataIvemId[] {
        const count = dataIvemIdArrayApi.length;
        const result = new Array<DataIvemId>(count);
        for (let i = 0; i < count; i++) {
            const dataIvemIdApi = dataIvemIdArrayApi[i];
            result[i] = fromApi(dataIvemIdApi);
        }
        return result;
    }
}
