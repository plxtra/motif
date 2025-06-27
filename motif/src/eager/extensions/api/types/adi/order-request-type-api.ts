import { Handle } from '../sys';

/** @public */
export const enum OrderRequestTypeEnum {
    Place = 'Place',
    Amend = 'Amend',
    Cancel = 'Cancel',
    Move = 'Move',
}

/** @public */
export type OrderRequestType = keyof typeof OrderRequestTypeEnum;

/** @public */
export type OrderRequestTypeHandle = Handle;
