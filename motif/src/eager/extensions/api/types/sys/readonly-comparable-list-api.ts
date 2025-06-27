import { BinaryFind } from './binary-find-api';
import { ComparisonResult, Integer } from './types-api';

/** @public */
export interface ReadonlyComparableList<out T extends U, in U = T> {
    readonly items: readonly T[];
    count: Integer;
    readonly lastIndex: Integer;

    getAt(index: Integer): T;

    toArray(): readonly T[];
    rangeToArray(index: Integer, count: Integer): T[];

    first(): T;
    last(): T;

    contains(value: T): boolean;
    has(predicate: (value: T, index: Integer) => boolean): boolean;

    indexOf(value: T): Integer;
    find(predicate: (value: T, index: Integer) => boolean): T | undefined;
    findIndex(predicate: (value: T, index: Integer) => boolean): number;

    compareItems(left: T, right: T): ComparisonResult;

    binarySearchEarliest(item: T, compareCallback?: ReadonlyComparableList.CompareCallback<T>): BinaryFind.Result;
    binarySearchLatest(item: T, compareCallback?: ReadonlyComparableList.CompareCallback<T>): BinaryFind.Result;
    binarySearchAny(item: T, compareCallback?: ReadonlyComparableList.CompareCallback<T>): BinaryFind.Result;

    binaryFindEarliest(compareToFn: BinaryFind.CompareItemFn<T>): BinaryFind.Result
    binaryFindLatest(compareToFn: BinaryFind.CompareItemFn<T>): BinaryFind.Result
    binaryFindAny(compareToFn: BinaryFind.CompareItemFn<T>): BinaryFind.Result
}

/** @public */
export namespace ReadonlyComparableList {
    export type CompareCallback<T> = (this: void, left: T, right: T) => ComparisonResult;
}
