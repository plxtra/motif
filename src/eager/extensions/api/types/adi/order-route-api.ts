import { OrderRouteAlgorithm, OrderRouteAlgorithmHandle } from './order-route-algorithm-api';

/** @public */
export interface OrderRoute {
    readonly algorithm: OrderRouteAlgorithm;
    readonly algorithmHandle: OrderRouteAlgorithmHandle;
}
