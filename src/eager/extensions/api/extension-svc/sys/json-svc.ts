import { Json, JsonElement, JsonValue } from '../../types';

/** @public */
export interface JsonSvc {
    isJson(value: JsonValue): value is Json;
    isJsonObject(value: JsonValue): value is Json | object;
    createJsonElement(json?: Json): JsonElement;
    tryCreateJsonElementFromJsonValue(jsonValue: JsonValue | undefined): JsonElement | undefined;
}
