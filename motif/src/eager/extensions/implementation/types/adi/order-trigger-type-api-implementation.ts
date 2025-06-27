import { UnreachableCaseError } from '@pbkware/js-utils';
import { OrderTriggerTypeId } from '@plxtra/motif-core';
import {
    ApiError as ApiErrorApi,
    OrderTriggerType as OrderTriggerTypeApi,
    OrderTriggerTypeEnum as OrderTriggerTypeEnumApi
} from '../../../api';
import { UnreachableCaseApiErrorImplementation } from '../sys/internal-api';

export namespace OrderTriggerTypeImplementation {
    export function toApi(value: OrderTriggerTypeId): OrderTriggerTypeApi {
        switch (value) {
            case OrderTriggerTypeId.Immediate: return OrderTriggerTypeEnumApi.Immediate;
            case OrderTriggerTypeId.Price: return OrderTriggerTypeEnumApi.Price;
            case OrderTriggerTypeId.TrailingPrice: return OrderTriggerTypeEnumApi.TrailingPrice;
            case OrderTriggerTypeId.PercentageTrailingPrice: return OrderTriggerTypeEnumApi.PercentageTrailingPrice;
            case OrderTriggerTypeId.Overnight: return OrderTriggerTypeEnumApi.Overnight;
            default: throw new UnreachableCaseError('OTTAITA34441', value);
        }
    }

    export function fromApi(value: OrderTriggerTypeApi): OrderTriggerTypeId {
        const enumValue = value as OrderTriggerTypeEnumApi;
        switch (enumValue) {
            case OrderTriggerTypeEnumApi.Immediate: return OrderTriggerTypeId.Immediate;
            case OrderTriggerTypeEnumApi.Price: return OrderTriggerTypeId.Price;
            case OrderTriggerTypeEnumApi.TrailingPrice: return OrderTriggerTypeId.TrailingPrice;
            case OrderTriggerTypeEnumApi.PercentageTrailingPrice: return OrderTriggerTypeId.PercentageTrailingPrice;
            case OrderTriggerTypeEnumApi.Overnight: return OrderTriggerTypeId.Overnight;
            default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidOrderTriggerType, enumValue);
        }
    }

    export function arrayToApi(value: readonly OrderTriggerTypeId[]): OrderTriggerTypeApi[] {
        const count = value.length;
        const result = new Array<OrderTriggerTypeApi>(count);
        for (let i = 0; i < count; i++) {
            result[i] = toApi(value[i]);
        }
        return result;
    }

    export function arrayFromApi(value: readonly OrderTriggerTypeApi[]): OrderTriggerTypeId[] {
        const count = value.length;
        const result = new Array<OrderTriggerTypeId>(count);
        for (let i = 0; i < count; i++) {
            result[i] = fromApi(value[i]);
        }
        return result;
    }
}
