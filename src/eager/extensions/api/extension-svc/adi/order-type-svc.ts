import { OrderType, OrderTypeHandle } from '../../types';

/** @public */
export interface OrderTypeSvc {
    toName(id: OrderType): string;
    fromName(name: string): OrderType | undefined;
    toDisplay(id: OrderType): string;
    isLimit(id: OrderType): boolean;

    toHandle(id: OrderType): OrderTypeHandle;
    fromHandle(handle: OrderTypeHandle): OrderType | undefined;

    handleToName(handle: OrderTypeHandle): string;
    handleFromName(name: string): OrderTypeHandle | undefined;
    handleToDisplay(handle: OrderTypeHandle): string;
    handleIsLimit(handle: OrderTypeHandle): boolean;
}
