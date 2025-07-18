import { UnreachableCaseError } from '@pbkware/js-utils';
import { OrderTradeTypeId } from '@plxtra/motif-core';
import {
    ApiError as ApiErrorApi,
    OrderTradeType as OrderExtendedSideApi,
    OrderTradeTypeEnum as OrderExtendedSideEnumApi
} from '../../../api';
import { UnreachableCaseApiErrorImplementation } from '../sys/internal-api';

export namespace OrderExtendedSideImplementation {
    export function toApi(value: OrderTradeTypeId): OrderExtendedSideApi {
        switch (value) {
            case OrderTradeTypeId.Buy: return OrderExtendedSideEnumApi.Buy;
            case OrderTradeTypeId.Sell: return OrderExtendedSideEnumApi.Sell;
            case OrderTradeTypeId.IntraDayShortSell: return OrderExtendedSideEnumApi.IntraDayShortSell;
            case OrderTradeTypeId.RegulatedShortSell: return OrderExtendedSideEnumApi.RegulatedShortSell;
            case OrderTradeTypeId.ProprietaryShortSell: return OrderExtendedSideEnumApi.ProprietaryShortSell;
            case OrderTradeTypeId.ProprietaryDayTrade: return OrderExtendedSideEnumApi.ProprietaryDayTrade;
            default: throw new UnreachableCaseError('OSAITAU2400091112', value);
        }
    }

    export function fromApi(value: OrderExtendedSideApi): OrderTradeTypeId {
        const enumValue = value as OrderExtendedSideEnumApi;
        switch (enumValue) {
            case OrderExtendedSideEnumApi.Buy: return OrderTradeTypeId.Buy;
            case OrderExtendedSideEnumApi.Sell: return OrderTradeTypeId.Sell;
            case OrderExtendedSideEnumApi.IntraDayShortSell: return OrderTradeTypeId.IntraDayShortSell;
            case OrderExtendedSideEnumApi.RegulatedShortSell: return OrderTradeTypeId.RegulatedShortSell;
            case OrderExtendedSideEnumApi.ProprietaryShortSell: return OrderTradeTypeId.ProprietaryShortSell;
            case OrderExtendedSideEnumApi.ProprietaryDayTrade: return OrderTradeTypeId.ProprietaryDayTrade;
            default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidOrderTradeType, enumValue);
        }
    }

    export function arrayToApi(value: readonly OrderTradeTypeId[]): OrderExtendedSideApi[] {
        const count = value.length;
        const result = new Array<OrderExtendedSideApi>(count);
        for (let i = 0; i < count; i++) {
            result[i] = toApi(value[i]);
        }
        return result;
    }

    export function arrayFromApi(value: readonly OrderExtendedSideApi[]): OrderTradeTypeId[] {
        const count = value.length;
        const result = new Array<OrderTradeTypeId>(count);
        for (let i = 0; i < count; i++) {
            result[i] = fromApi(value[i]);
        }
        return result;
    }
}
