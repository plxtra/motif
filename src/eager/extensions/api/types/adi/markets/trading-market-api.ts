import { OrderRouteAlgorithm } from '../order-route-algorithm-api';
import { OrderTimeInForce } from '../order-time-in-force-api';
import { OrderTradeType } from '../order-trade-type-api';
import { OrderTriggerType } from '../order-trigger-type-api';
import { OrderType } from '../order-type-api';
// eslint-disable-next-line import-x/no-cycle
import { DataMarket } from './data-market-api';
// eslint-disable-next-line import-x/no-cycle
import { Exchange } from './exchange-api';
// eslint-disable-next-line import-x/no-cycle
import { Market } from './market-api';

/** @public */
export interface TradingMarket extends Market {
    readonly bestLitDataMarket: DataMarket | undefined;
    readonly orderRouteAlgorithmId: OrderRouteAlgorithm; // Currently only algorithm supported

    readonly allowedOrderTypeIds: readonly OrderType[];
    /** Recommended order type to be initially shown in an order pad */
    readonly defaultOrderTypeId: OrderType;
    readonly allowedOrderTimeInForceIds: readonly OrderTimeInForce[];
    /** Recommended order validity to be initially shown in an order pad */
    readonly defaultOrderTimeInForceId: OrderTimeInForce;
    /** Order validities for Market Order Type */
    readonly marketOrderTypeAllowedTimeInForceIds: readonly OrderTimeInForce[];
    readonly allowedOrderTriggerTypeIds: readonly OrderTriggerType[];
    readonly allowedOrderTradeTypeIds: readonly OrderTradeType[];

    readonly symbologySupportedExchanges: readonly Exchange[];

    // areExchangeSymbolsSupported(exchange: Exchange): boolean;
    isOrderTypeAllowed(orderTypeId: OrderType): boolean;
    isOrderTradeTypeAllowed(orderTradeTypeId: OrderTradeType): boolean;
    getAllowedTimeInForcesForOrderType(orderTypeId: OrderType): readonly OrderTimeInForce[];
}
