import { JsonElement, UnreachableCaseError } from '@pbkware/js-utils';
import {
    ApiError as ApiErrorApi,
    JsonElementErr as JsonElementErrApi
} from '../../../api';
import { UnreachableCaseApiErrorImplementation } from './api-error-api-implementation';
import { ErrImplementation } from './result-api-implementation';

export class JsonElementErrImplementation<T> extends ErrImplementation<T> implements JsonElementErrApi<T> {
    readonly code: JsonElementErrApi.Code;

    constructor(private readonly _errorId: JsonElement.ErrorId) {
        const code = JsonElementErrImplementation.ErrorId.toApi(_errorId);
        super(code)
        this.code = code;
    }

    override isErr(): this is JsonElementErrApi<T> {
        return true;
    }
}

export namespace JsonElementErrImplementation {
    export function create<T>(errorId: JsonElement.ErrorId): JsonElementErrApi<T> {
        return new JsonElementErrImplementation(errorId);
    }

    export namespace ErrorId {
        export function toApi(value: JsonElement.ErrorId): JsonElementErrApi.Code {
            switch (value) {
                case JsonElement.ErrorId.InvalidJsonText: return JsonElementErrApi.CodeEnum.InvalidJsonText;
                case JsonElement.ErrorId.ElementIsNotDefined: return JsonElementErrApi.CodeEnum.ElementIsNotDefined;
                case JsonElement.ErrorId.JsonValueIsNotDefined: return JsonElementErrApi.CodeEnum.JsonValueIsNotDefined;
                case JsonElement.ErrorId.JsonValueIsNotOfTypeObject: return JsonElementErrApi.CodeEnum.JsonValueIsNotOfTypeObject;
                case JsonElement.ErrorId.JsonValueIsNotOfTypeString: return JsonElementErrApi.CodeEnum.JsonValueIsNotOfTypeString;
                case JsonElement.ErrorId.JsonValueIsNotOfTypeStringOrNull: return JsonElementErrApi.CodeEnum.JsonValueIsNotOfTypeStringOrNull;
                case JsonElement.ErrorId.JsonValueIsNotOfTypeNumber: return JsonElementErrApi.CodeEnum.JsonValueIsNotOfTypeNumber;
                case JsonElement.ErrorId.JsonValueIsNotOfTypeNumberOrNull: return JsonElementErrApi.CodeEnum.JsonValueIsNotOfTypeNumberOrNull;
                case JsonElement.ErrorId.JsonValueIsNotOfTypeBoolean: return JsonElementErrApi.CodeEnum.JsonValueIsNotOfTypeBoolean;
                case JsonElement.ErrorId.JsonValueIsNotOfTypeBooleanOrNull: return JsonElementErrApi.CodeEnum.JsonValueIsNotOfTypeBooleanOrNull;
                case JsonElement.ErrorId.DecimalJsonValueIsNotOfTypeString: return JsonElementErrApi.CodeEnum.DecimalJsonValueIsNotOfTypeString;
                case JsonElement.ErrorId.InvalidDecimal: return JsonElementErrApi.CodeEnum.InvalidDecimal;
                case JsonElement.ErrorId.JsonValueIsNotAnArray: return JsonElementErrApi.CodeEnum.JsonValueIsNotAnArray;
                case JsonElement.ErrorId.JsonValueArrayElementIsNotAnObject: return JsonElementErrApi.CodeEnum.JsonValueArrayElementIsNotAnObject;
                case JsonElement.ErrorId.JsonValueArrayElementIsNotJson: return JsonElementErrApi.CodeEnum.JsonValueArrayElementIsNotJson;
                case JsonElement.ErrorId.JsonValueArrayElementIsNotAString: return JsonElementErrApi.CodeEnum.JsonValueArrayElementIsNotAString;
                case JsonElement.ErrorId.JsonValueArrayElementIsNotAStringOrNull: return JsonElementErrApi.CodeEnum.JsonValueArrayElementIsNotAStringOrNull;
                case JsonElement.ErrorId.JsonValueArrayElementIsNotANumber: return JsonElementErrApi.CodeEnum.JsonValueArrayElementIsNotANumber;
                case JsonElement.ErrorId.JsonValueArrayElementIsNotANumberOrNull: return JsonElementErrApi.CodeEnum.JsonValueArrayElementIsNotANumberOrNull;
                case JsonElement.ErrorId.JsonValueArrayElementIsNotABoolean: return JsonElementErrApi.CodeEnum.JsonValueArrayElementIsNotABoolean;
                case JsonElement.ErrorId.JsonValueArrayElementIsNotABooleanOrNull: return JsonElementErrApi.CodeEnum.JsonValueArrayElementIsNotABooleanOrNull;
                default:
                    throw new UnreachableCaseError('JERAIEOTA55598', value);
            }
        }

        export function fromApi(value: JsonElementErrApi.Code): JsonElement.ErrorId {
            const enumValue = value as JsonElementErrApi.CodeEnum;
            switch (enumValue) {
                case JsonElementErrApi.CodeEnum.InvalidJsonText: return JsonElement.ErrorId.InvalidJsonText;
                case JsonElementErrApi.CodeEnum.ElementIsNotDefined: return JsonElement.ErrorId.ElementIsNotDefined;
                case JsonElementErrApi.CodeEnum.JsonValueIsNotDefined: return JsonElement.ErrorId.JsonValueIsNotDefined;
                case JsonElementErrApi.CodeEnum.JsonValueIsNotOfTypeObject: return JsonElement.ErrorId.JsonValueIsNotOfTypeObject;
                case JsonElementErrApi.CodeEnum.JsonValueIsNotOfTypeString: return JsonElement.ErrorId.JsonValueIsNotOfTypeString;
                case JsonElementErrApi.CodeEnum.JsonValueIsNotOfTypeStringOrNull: return JsonElement.ErrorId.JsonValueIsNotOfTypeStringOrNull;
                case JsonElementErrApi.CodeEnum.JsonValueIsNotOfTypeNumber: return JsonElement.ErrorId.JsonValueIsNotOfTypeNumber;
                case JsonElementErrApi.CodeEnum.JsonValueIsNotOfTypeNumberOrNull: return JsonElement.ErrorId.JsonValueIsNotOfTypeNumberOrNull;
                case JsonElementErrApi.CodeEnum.JsonValueIsNotOfTypeBoolean: return JsonElement.ErrorId.JsonValueIsNotOfTypeBoolean;
                case JsonElementErrApi.CodeEnum.JsonValueIsNotOfTypeBooleanOrNull: return JsonElement.ErrorId.JsonValueIsNotOfTypeBooleanOrNull;
                case JsonElementErrApi.CodeEnum.DecimalJsonValueIsNotOfTypeString: return JsonElement.ErrorId.DecimalJsonValueIsNotOfTypeString;
                case JsonElementErrApi.CodeEnum.InvalidDecimal: return JsonElement.ErrorId.InvalidDecimal;
                case JsonElementErrApi.CodeEnum.JsonValueIsNotAnArray: return JsonElement.ErrorId.JsonValueIsNotAnArray;
                case JsonElementErrApi.CodeEnum.JsonValueArrayElementIsNotAnObject: return JsonElement.ErrorId.JsonValueArrayElementIsNotAnObject;
                case JsonElementErrApi.CodeEnum.JsonValueArrayElementIsNotJson: return JsonElement.ErrorId.JsonValueArrayElementIsNotJson;
                case JsonElementErrApi.CodeEnum.JsonValueArrayElementIsNotAString: return JsonElement.ErrorId.JsonValueArrayElementIsNotAString;
                case JsonElementErrApi.CodeEnum.JsonValueArrayElementIsNotAStringOrNull: return JsonElement.ErrorId.JsonValueArrayElementIsNotAStringOrNull;
                case JsonElementErrApi.CodeEnum.JsonValueArrayElementIsNotANumber: return JsonElement.ErrorId.JsonValueArrayElementIsNotANumber;
                case JsonElementErrApi.CodeEnum.JsonValueArrayElementIsNotANumberOrNull: return JsonElement.ErrorId.JsonValueArrayElementIsNotANumberOrNull;
                case JsonElementErrApi.CodeEnum.JsonValueArrayElementIsNotABoolean: return JsonElement.ErrorId.JsonValueArrayElementIsNotABoolean;
                case JsonElementErrApi.CodeEnum.JsonValueArrayElementIsNotABooleanOrNull: return JsonElement.ErrorId.JsonValueArrayElementIsNotABooleanOrNull;
                default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidJsonELementErrorCode, enumValue);
            }
        }
    }
}
