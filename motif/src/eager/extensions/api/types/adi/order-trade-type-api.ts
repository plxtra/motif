import { Handle } from '../sys';

/** @public */
export const enum OrderTradeTypeEnum {
    Buy = 'Buy',
    Sell = 'Sell',
    IntraDayShortSell = 'IntraDayShortSell',
    RegulatedShortSell = 'RegulatedShortSell',
    ProprietaryShortSell = 'ProprietaryShortSell',
    ProprietaryDayTrade ='ProprietaryDayTrade',
}

/** @public */
export type OrderTradeType = keyof typeof OrderTradeTypeEnum;

/** @public */
export type OrderTradeTypeHandle = Handle;
