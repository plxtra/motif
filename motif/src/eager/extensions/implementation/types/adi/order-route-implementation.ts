import { OrderRoute } from '@plxtra/motif-core';
import {
    OrderRoute as OrderRouteApi
} from '../../../api';
import { OrderRouteAlgorithmImplementation } from './order-route-algorithm-implementation';

export class OrderRouteImplementation implements OrderRouteApi {
    constructor(readonly actual: OrderRoute) { }

    get algorithm() { return OrderRouteAlgorithmImplementation.toApi(this.actual.algorithmId); }
    get algorithmHandle() { return this.actual.algorithmId; }
}

export namespace OrderRouteImplementation {
    export function toApi(actual: OrderRoute) {
        return new OrderRouteImplementation(actual);
    }

    export function fromApi(orderRouteApi: OrderRouteApi) {
        const implementation = orderRouteApi as OrderRouteImplementation;
        return implementation.actual;
    }

    export function arrayToApi(value: readonly OrderRoute[]): OrderRouteApi[] {
        const count = value.length;
        const result = new Array<OrderRouteApi>(count);
        for (let i = 0; i < count; i++) {
            result[i] = toApi(value[i]);
        }
        return result;
    }

    export function arrayFromApi(value: readonly OrderRouteApi[]): OrderRoute[] {
        const count = value.length;
        const result = new Array<OrderRoute>(count);
        for (let i = 0; i < count; i++) {
            result[i] = fromApi(value[i]);
        }
        return result;
    }
}
