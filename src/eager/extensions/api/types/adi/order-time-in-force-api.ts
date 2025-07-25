import { Handle } from '../sys/types-api';

/** @public */
export const enum OrderTimeInForceEnum {
    UntilCancel = 'UntilCancel',
    UntilExpiryDate = 'UntilExpiryDate',
    Today = 'Today',
    FillAndKill = 'FillAndKill',
    FillOrKill = 'FillOrKill',
    AllOrNone = 'AllOrNone',
}

/** @public */
export type OrderTimeInForce = keyof typeof OrderTimeInForceEnum;

/** @public */
export type OrderTimeInForceHandle = Handle;
