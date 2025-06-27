import { OrderRoute } from './order-route-api';

/** @public */
export interface MarketOrderRoute extends OrderRoute {
    readonly marketZenithCode: string;
}
