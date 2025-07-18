import { Handle } from '../sys';

/** @public */
export const enum CurrencyIdEnum {
    Aud = 'Aud',
    Usd = 'Usd',
    Myr = 'Myr',
}

/** @public */
export type CurrencyId = keyof typeof CurrencyIdEnum;

/** @public */
export type CurrencyIdHandle = Handle;
