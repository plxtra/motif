import { Handle } from '../sys';

/** @public */
export const enum OrderTypeEnum {
    Limit = 'Limit',
    Best = 'Best',
    Market = 'Market',
    MarketToLimit = 'MarketToLimit',
}

/** @public */
export type OrderType = keyof typeof OrderTypeEnum;

/** @public */
export type OrderTypeHandle = Handle;
