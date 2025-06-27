import { DecimalFactory, JsonElement, JsonValue } from '@pbkware/js-utils';
import { Json as JsonApi, JsonElement as JsonElementApi, JsonSvc, JsonValue as JsonValueApi } from '../../../api';
import { JsonElementImplementation } from '../../types/internal-api';

export class JsonSvcImplementation implements JsonSvc {
    constructor(private readonly _decimalFactory: DecimalFactory) { }

    isJson(value: JsonValueApi): value is JsonApi {
        return JsonValue.isJson(value);
    }

    isJsonObject(value: JsonValueApi): value is JsonApi | object {
        return JsonValue.isJsonObject(value);
    }

    createJsonElement(json?: JsonApi): JsonElementApi {
        const element = new JsonElement(json);
        return JsonElementImplementation.toApi(element, this._decimalFactory);
    }

    tryCreateJsonElementFromJsonValue(jsonValue: JsonValueApi | undefined): JsonElementApi | undefined {
        let json: JsonApi | undefined;
        if (jsonValue === undefined) {
            return undefined;
        } else {
            if (!JsonValue.isJson(jsonValue)) {
                return undefined;
            } else {
                json = jsonValue;
                return this.createJsonElement(json);
            }
        }
    }
}
