import { OrderTradeType } from '@plxtra/motif-core';
import {
    OrderTradeType as OrderExtendedSideApi,
    OrderTradeTypeHandle as OrderExtendedSideHandleApi,
    OrderExtendedSideSvc
} from '../../../api';
import { OrderExtendedSideImplementation } from '../../types/internal-api';

export class OrderExtendedSideSvcImplementation implements OrderExtendedSideSvc {
    toName(id: OrderExtendedSideApi) {
        const sideId = OrderExtendedSideImplementation.fromApi(id);
        return OrderTradeType.idToName(sideId);
    }

    fromName(name: string) {
        const sideId = OrderTradeType.tryNameToId(name);
        if (sideId === undefined) {
            return undefined;
        } else {
            return OrderExtendedSideImplementation.toApi(sideId);
        }
    }

    toDisplay(id: OrderExtendedSideApi) {
        const sideId = OrderExtendedSideImplementation.fromApi(id);
        return OrderTradeType.idToDisplay(sideId);
    }

    toHandle(id: OrderExtendedSideApi) {
        return OrderExtendedSideImplementation.fromApi(id);
    }

    fromHandle(handle: OrderExtendedSideHandleApi) {
        return OrderExtendedSideImplementation.toApi(handle);
    }

    handleToName(handle: OrderExtendedSideHandleApi) {
        return OrderTradeType.idToName(handle);
    }

    handleFromName(name: string) {
        return OrderTradeType.tryNameToId(name);
    }

    handleToDisplay(handle: OrderExtendedSideHandleApi) {
        return OrderTradeType.idToDisplay(handle);
    }
}
