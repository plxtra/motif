import { MarketOrderRoute } from '@plxtra/motif-core';
import { MarketOrderRoute as MarketOrderRouteApi } from '../../../api';
import { OrderRouteImplementation } from './order-route-implementation';

export class MarketOrderRouteImplementation extends OrderRouteImplementation implements MarketOrderRouteApi {
    declare readonly actual: MarketOrderRoute;

    get marketZenithCode(): string { return this.actual.marketZenithCode; }
}

export namespace MarketOrderRouteImplementation {
    export function marketToApi(actual: MarketOrderRoute) {
        return new MarketOrderRouteImplementation(actual);
    }

    export function marketFromApi(marketOrderRouteApi: MarketOrderRouteApi) {
        const implementation = marketOrderRouteApi as MarketOrderRouteImplementation;
        return implementation.actual;
    }

    export function marketArrayToApi(value: readonly MarketOrderRoute[]): MarketOrderRouteApi[] {
        const count = value.length;
        const result = new Array<MarketOrderRouteApi>(count);
        for (let i = 0; i < count; i++) {
            result[i] = marketToApi(value[i]);
        }
        return result;
    }

    export function marketArrayFromApi(value: readonly MarketOrderRouteApi[]): MarketOrderRoute[] {
        const count = value.length;
        const result = new Array<MarketOrderRoute>(count);
        for (let i = 0; i < count; i++) {
            result[i] = marketFromApi(value[i]);
        }
        return result;
    }
}
