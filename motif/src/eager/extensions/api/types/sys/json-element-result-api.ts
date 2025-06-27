import { Err, Ok } from './result-api';

/** @public */
export type JsonElementResult<T, E = string> = Ok<T, E> | JsonElementErr<T, E>;

/** @public */
export interface JsonElementErr<T = undefined, E = string> extends Err<T, E> {
    readonly code: JsonElementErr.Code;
}

/** @public */
export namespace JsonElementErr {
    export const enum CodeEnum {
        InvalidJsonText = 'InvalidJsonText',
        ElementIsNotDefined = 'ElementIsNotDefined',
        JsonValueIsNotDefined = 'JsonValueIsNotDefined',
        JsonValueIsNotOfTypeObject = 'JsonValueIsNotOfTypeObject',
        JsonValueIsNotOfTypeString = 'JsonValueIsNotOfTypeString',
        JsonValueIsNotOfTypeStringOrNull = 'JsonValueIsNotOfTypeStringOrNull',
        JsonValueIsNotOfTypeNumber = 'JsonValueIsNotOfTypeNumber',
        JsonValueIsNotOfTypeNumberOrNull = 'JsonValueIsNotOfTypeNumberOrNull',
        JsonValueIsNotOfTypeBoolean = 'JsonValueIsNotOfTypeBoolean',
        JsonValueIsNotOfTypeBooleanOrNull = 'JsonValueIsNotOfTypeBooleanOrNull',
        DecimalJsonValueIsNotOfTypeString = 'DecimalJsonValueIsNotOfTypeString',
        InvalidDecimal = 'InvalidDecimal',
        JsonValueIsNotAnArray = 'JsonValueIsNotAnArray',
        JsonValueArrayElementIsNotAnObject = 'JsonValueArrayElementIsNotAnObject',
        JsonValueArrayElementIsNotJson = 'JsonValueArrayElementIsNotJson',
        JsonValueArrayElementIsNotAString = 'JsonValueArrayElementIsNotAString',
        JsonValueArrayElementIsNotAStringOrNull = 'JsonValueArrayElementIsNotAStringOrNull',
        JsonValueArrayElementIsNotANumber = 'JsonValueArrayElementIsNotANumber',
        JsonValueArrayElementIsNotANumberOrNull = 'JsonValueArrayElementIsNotANumberOrNull',
        JsonValueArrayElementIsNotABoolean = 'JsonValueArrayElementIsNotABoolean',
        JsonValueArrayElementIsNotABooleanOrNull = 'JsonValueArrayElementIsNotABooleanOrNull',
    }

    export type Code = keyof typeof CodeEnum;
}
