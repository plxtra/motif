import { UnreachableCaseError } from '@pbkware/js-utils';
import { SymbolFieldId } from '@plxtra/motif-core';
import {
    ApiError as ApiErrorApi,
    SymbolField as SymbolFieldApi,
    SymbolFieldEnum as SymbolFieldEnumApi
} from '../../../api';
import { UnreachableCaseApiErrorImplementation } from '../sys/internal-api';

export namespace SymbolFieldImplementation {
    export function toApi(value: SymbolFieldId): SymbolFieldApi {
        switch (value) {
            case SymbolFieldId.Code: return SymbolFieldEnumApi.Code;
            case SymbolFieldId.Name: return SymbolFieldEnumApi.Name;
            case SymbolFieldId.Short: return SymbolFieldEnumApi.Short;
            case SymbolFieldId.Long: return SymbolFieldEnumApi.Long;
            case SymbolFieldId.Ticker: return SymbolFieldEnumApi.Ticker;
            case SymbolFieldId.Gics: return SymbolFieldEnumApi.Gics;
            case SymbolFieldId.Isin: return SymbolFieldEnumApi.Isin;
            case SymbolFieldId.Base: return SymbolFieldEnumApi.Base;
            case SymbolFieldId.Ric: return SymbolFieldEnumApi.Ric;
            default: throw new UnreachableCaseError('SFAISFITA40444', value);
        }
    }

    export function fromApi(value: SymbolFieldApi): SymbolFieldId {
        const enumValue = value as SymbolFieldEnumApi;
        switch (enumValue) {
            case SymbolFieldEnumApi.Code: return SymbolFieldId.Code;
            case SymbolFieldEnumApi.Name: return SymbolFieldId.Name;
            case SymbolFieldEnumApi.Short: return SymbolFieldId.Short;
            case SymbolFieldEnumApi.Long: return SymbolFieldId.Long;
            case SymbolFieldEnumApi.Ticker: return SymbolFieldId.Ticker;
            case SymbolFieldEnumApi.Gics: return SymbolFieldId.Gics;
            case SymbolFieldEnumApi.Isin: return SymbolFieldId.Isin;
            case SymbolFieldEnumApi.Base: return SymbolFieldId.Base;
            case SymbolFieldEnumApi.Ric: return SymbolFieldId.Ric;
            default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidSymbolField, enumValue);
        }
    }

    export function arrayToApi(value: readonly SymbolFieldId[]): SymbolFieldApi[] {
        const count = value.length;
        const result = new Array<SymbolFieldApi>(count);
        for (let i = 0; i < count; i++) {
            result[i] = toApi(value[i]);
        }
        return result;
    }
}
