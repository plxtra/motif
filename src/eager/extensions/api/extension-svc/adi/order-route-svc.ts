import { MarketOrderRoute, OrderRoute } from '../../types';

/** @public */
export interface OrderRouteSvc {
    isEqual(left: OrderRoute, right: OrderRoute): boolean;
    isUndefinableEqual(left: OrderRoute | undefined, right: OrderRoute | undefined): boolean;
    isMarketRoute(route: OrderRoute): route is MarketOrderRoute;
}
