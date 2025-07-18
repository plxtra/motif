import { OrderType } from '@plxtra/motif-core';
import {
    OrderType as OrderTypeApi,
    OrderTypeHandle as OrderTypeHandleApi,
    OrderTypeSvc
} from '../../../api';
import { OrderTypeImplementation } from '../../types/internal-api';

export class OrderTypeSvcImplementation implements OrderTypeSvc {
    toName(id: OrderTypeApi) {
        const typeId = OrderTypeImplementation.fromApi(id);
        return OrderType.idToName(typeId);
    }

    fromName(name: string) {
        const typeId = OrderType.tryNameToId(name);
        if (typeId === undefined) {
            return undefined;
        } else {
            return OrderTypeImplementation.toApi(typeId);
        }
    }

    toDisplay(id: OrderTypeApi) {
        const typeId = OrderTypeImplementation.fromApi(id);
        return OrderType.idToDisplay(typeId);
    }

    isLimit(id: OrderTypeApi) {
        const typeId = OrderTypeImplementation.fromApi(id);
        return OrderType.isLimit(typeId);
    }

    toHandle(id: OrderTypeApi) {
        return OrderTypeImplementation.fromApi(id);
    }

    fromHandle(handle: OrderTypeHandleApi) {
        return OrderTypeImplementation.toApi(handle);
    }

    handleToName(handle: OrderTypeHandleApi) {
        return OrderType.idToName(handle);
    }

    handleFromName(name: string) {
        return OrderType.tryNameToId(name);
    }

    handleToDisplay(handle: OrderTypeHandleApi) {
        return OrderType.idToDisplay(handle);
    }

    handleIsLimit(handle: OrderTypeHandleApi) {
        return OrderType.isLimit(handle);
    }
}
