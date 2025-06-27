import { Handle } from '../sys';

/** @public */
export const enum OrderTriggerTypeEnum {
    Immediate = 'Immediate',
    Price = 'Price',
    TrailingPrice = 'TrailingPrice',
    PercentageTrailingPrice = 'PercentageTrailingPrice',
    Overnight = 'Overnight',
}

/** @public */
export type OrderTriggerType = keyof typeof OrderTriggerTypeEnum;

/** @public */
export type OrderTriggerTypeHandle = Handle;
