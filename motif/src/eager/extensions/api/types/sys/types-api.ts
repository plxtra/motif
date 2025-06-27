/** @public */
export type Integer = number;

/** @public */
export type Guid = string;

/** @public */
export type TimeSpan = number;

/** @public */
export type Handle = Integer;

/** @public */
export type JsonValue = string | number | boolean | null | Json | object | JsonValueArray;
// export type JsonValue = string | number | boolean | null | Json | JsonValueArray;
/** @public */
export interface Json {
    [name: string]: JsonValue;
}
/** @public */
export type JsonValueArray = JsonValue[];
// export interface JsonValueArray extends Array<JsonValue> { }

/** @public */
export const enum ComparisonResult {
    LeftLessThanRight = -1,
    LeftEqualsRight = 0,
    LeftGreaterThanRight = 1,
}

/** @public */
export const enum PublisherTypeEnum {
    Builtin = 'Builtin',
    User = 'User',
    Organisation = 'Organisation',
}

/** @public */
export type PublisherType = keyof typeof PublisherTypeEnum;

/** @public */
export namespace PublisherType {
    export const builtin = 'Builtin';
    export const user = 'User';
    export const organisation = 'Organisation';
}
