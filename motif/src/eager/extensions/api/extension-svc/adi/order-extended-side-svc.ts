import { OrderTradeType, OrderTradeTypeHandle } from '../../types';

/** @public */
export interface OrderExtendedSideSvc {
    toName(id: OrderTradeType): string;
    fromName(name: string): OrderTradeType | undefined;
    toDisplay(id: OrderTradeType): string;

    toHandle(id: OrderTradeType): OrderTradeTypeHandle;
    fromHandle(handle: OrderTradeTypeHandle): OrderTradeType | undefined;

    handleToName(handle: OrderTradeTypeHandle): string;
    handleFromName(name: string): OrderTradeTypeHandle | undefined;
    handleToDisplay(handle: OrderTradeTypeHandle): string;
}
