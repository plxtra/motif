import { OrderTimeInForce, OrderTimeInForceHandle } from '../../types';

/** @public */
export interface OrderTimeInForceSvc {
    toName(id: OrderTimeInForce): string;
    fromName(name: string): OrderTimeInForce | undefined;
    toDisplay(id: OrderTimeInForce): string;

    toHandle(id: OrderTimeInForce): OrderTimeInForceHandle;
    fromHandle(handle: OrderTimeInForceHandle): OrderTimeInForce | undefined;

    handleToName(handle: OrderTimeInForceHandle): string;
    handleFromName(name: string): OrderTimeInForceHandle | undefined;
    handleToDisplay(handle: OrderTimeInForceHandle): string;
}
