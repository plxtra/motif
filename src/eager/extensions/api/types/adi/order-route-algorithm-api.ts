import { Handle } from '../sys';

/** @public */
export const enum OrderRouteAlgorithmEnum {
    Market = 'Market',
}

/** @public */
export type OrderRouteAlgorithm = keyof typeof OrderRouteAlgorithmEnum;

/** @public */
export type OrderRouteAlgorithmHandle = Handle;

