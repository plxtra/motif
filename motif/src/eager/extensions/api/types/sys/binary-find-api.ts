import { ComparisonResult, Integer } from './types-api';

/** @public */
export namespace BinaryFind {
    export interface Result {
        found: boolean;
        index: Integer;
    }
    export type CompareItemFn<in T> = (this: void, item: T) => ComparisonResult;
}
