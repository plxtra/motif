import { TimeInForce } from '@plxtra/motif-core';
import {
    OrderTimeInForce as OrderTimeInForceApi,
    OrderTimeInForceHandle as OrderTimeInForceHandleApi,
    OrderTimeInForceSvc
} from '../../../api';
import { OrderTimeInForceImplementation } from '../../types/internal-api';

export class OrderTimeInForceSvcImplementation implements OrderTimeInForceSvc {
    toName(id: OrderTimeInForceApi) {
        const timeInForceId = OrderTimeInForceImplementation.fromApi(id);
        return TimeInForce.idToName(timeInForceId);
    }

    fromName(name: string) {
        const timeInForceId = TimeInForce.tryNameToId(name);
        if (timeInForceId === undefined) {
            return undefined;
        } else {
            return OrderTimeInForceImplementation.toApi(timeInForceId);
        }
    }

    toDisplay(id: OrderTimeInForceApi) {
        const timeInForceId = OrderTimeInForceImplementation.fromApi(id);
        return TimeInForce.idToDisplay(timeInForceId);
    }

    toHandle(id: OrderTimeInForceApi) {
        return OrderTimeInForceImplementation.fromApi(id);
    }

    fromHandle(handle: OrderTimeInForceHandleApi) {
        return OrderTimeInForceImplementation.toApi(handle);
    }

    handleToName(handle: OrderTimeInForceHandleApi) {
        return TimeInForce.idToName(handle);
    }

    handleFromName(name: string) {
        return TimeInForce.tryNameToId(name);
    }

    handleToDisplay(handle: OrderTimeInForceHandleApi) {
        return TimeInForce.idToDisplay(handle);
    }
}
