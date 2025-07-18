import { UnreachableCaseError } from '@pbkware/js-utils';
import { OrderTradeTypeId } from '@plxtra/motif-core';
import {
    ApiError as ApiErrorApi,
    OrderTradeType as OrderTradeTypeApi,
    OrderTradeTypeEnum as OrderTradeTypeEnumApi
} from '../../../api';
import { UnreachableCaseApiErrorImplementation } from '../sys/internal-api';

export namespace OrderTradeTypeImplementation {
    export function toApi(value: OrderTradeTypeId): OrderTradeTypeApi {
        switch (value) {
            case OrderTradeTypeId.Buy: return OrderTradeTypeEnumApi.Buy;
            case OrderTradeTypeId.Sell: return OrderTradeTypeEnumApi.Sell;
            case OrderTradeTypeId.IntraDayShortSell: return OrderTradeTypeEnumApi.IntraDayShortSell;
            case OrderTradeTypeId.RegulatedShortSell: return OrderTradeTypeEnumApi.RegulatedShortSell;
            case OrderTradeTypeId.ProprietaryShortSell: return OrderTradeTypeEnumApi.ProprietaryShortSell;
            case OrderTradeTypeId.ProprietaryDayTrade: return OrderTradeTypeEnumApi.ProprietaryDayTrade;
            default: throw new UnreachableCaseError('OTTAITA34440', value);
        }
    }

    export function fromApi(value: OrderTradeTypeApi): OrderTradeTypeId {
        const enumValue = value as OrderTradeTypeEnumApi;
        switch (enumValue) {
            case OrderTradeTypeEnumApi.Buy: return OrderTradeTypeId.Buy;
            case OrderTradeTypeEnumApi.Sell: return OrderTradeTypeId.Sell;
            case OrderTradeTypeEnumApi.IntraDayShortSell: return OrderTradeTypeId.IntraDayShortSell;
            case OrderTradeTypeEnumApi.RegulatedShortSell: return OrderTradeTypeId.RegulatedShortSell;
            case OrderTradeTypeEnumApi.ProprietaryShortSell: return OrderTradeTypeId.ProprietaryShortSell;
            case OrderTradeTypeEnumApi.ProprietaryDayTrade: return OrderTradeTypeId.ProprietaryDayTrade;
            default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidOrderTradeType, enumValue);
        }
    }

    export function arrayToApi(value: readonly OrderTradeTypeId[]): OrderTradeTypeApi[] {
        const count = value.length;
        const result = new Array<OrderTradeTypeApi>(count);
        for (let i = 0; i < count; i++) {
            result[i] = toApi(value[i]);
        }
        return result;
    }

    export function arrayFromApi(value: readonly OrderTradeTypeApi[]): OrderTradeTypeId[] {
        const count = value.length;
        const result = new Array<OrderTradeTypeId>(count);
        for (let i = 0; i < count; i++) {
            result[i] = fromApi(value[i]);
        }
        return result;
    }
}
