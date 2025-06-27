import { OrderRoute } from '@plxtra/motif-core';
import {
    MarketOrderRoute as MarketOrderRouteApi,
    OrderRoute as OrderRouteApi,
    OrderRouteSvc
} from '../../../api';
import { OrderRouteImplementation } from '../../types/internal-api';

export class OrderRouteSvcImplementation implements OrderRouteSvc {
    isEqual(left: OrderRouteApi, right: OrderRouteApi) {
        const leftActual = OrderRouteImplementation.fromApi(left);
        const rightActual = OrderRouteImplementation.fromApi(right);
        return OrderRoute.isEqual(leftActual, rightActual);
    }

    isUndefinableEqual(left: OrderRouteApi | undefined, right: OrderRouteApi | undefined) {
        const leftActual = left === undefined ? undefined : OrderRouteImplementation.fromApi(left);
        const rightActual = right === undefined ? undefined : OrderRouteImplementation.fromApi(right);
        return OrderRoute.isUndefinableEqual(leftActual, rightActual);
    }

    isMarketRoute(route: OrderRouteApi): route is MarketOrderRouteApi {
        const actual = OrderRouteImplementation.fromApi(route);
        return OrderRoute.isMarket(actual);
    }
}

