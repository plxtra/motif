import { ReadonlyComparableList } from './readonly-comparable-list-api';
import { Integer } from './types-api';

/** @public */
export interface ComparableList<out T extends U, in U = T> extends ReadonlyComparableList<T, U> {
    capacityIncSize: Integer | undefined;

    capacity: Integer;

    clone(): ComparableList<T, U>;

    setAt(index: Integer, value: T): void;

    add(value: T): Integer;
    addRange(values: readonly T[]): void;
    addUndefinedRange(undefinedValueCount: Integer): void;
    addSubRange(values: readonly T[], subRangeStartIndex: Integer, subRangeCount: Integer): void;
    insert(index: Integer, value: T): void;
    insertRange(index: Integer, values: T[]): void;
    insertSubRange(index: Integer, values: readonly T[], subRangeStartIndex: Integer, subRangeCount: Integer): void;
    remove(value: T): void;
    removeAtIndex(index: Integer): void;
    removeAtIndices(removeIndices: Integer[], beforeRemoveRangeCallBack?: ComparableList.BeforeRemoveRangeCallBack): void;
    removeRange(index: Integer, deleteCount: Integer): void;
    removeItems(items: readonly T[], beforeRemoveRangeCallBack?: ComparableList.BeforeRemoveRangeCallBack): void;
    clear(): void;

    extract(value: T): T;
    shift(): T | undefined;

    exchange(index1: Integer, index2: Integer): void;
    move(curIndex: Integer, newIndex: Integer): void;
    moveRange(fromIndex: Integer, toIndex: Integer, count: Integer): void;

    setMinimumCapacity(value: Integer): void;
    setGrowthCapacity(growth: Integer): void;
    trimExcess(): void;

    sort(compareCallback?: ComparableList.CompareCallback<T>): void;
}

/** @public */
export namespace ComparableList {
    export type CompareCallback<T> = ReadonlyComparableList.CompareCallback<T>;
    export type BeforeRemoveRangeCallBack = (this: void, index: Integer, count: Integer) => void;
}
