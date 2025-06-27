import { ComparableList } from '@pbkware/js-utils';
import {
    BinaryFind,
    ComparableList as ComparableListApi,
    ComparisonResult as ComparisonResultApi,
    Integer as IntegerApi
} from '../../../api';
import { ComparisonResultImplementation } from './types-api-implementation';

export class ComparableListImplementation<T extends U, U = T> implements ComparableListApi<T, U> {
    constructor(protected readonly _actual: ComparableList<T, U>) {}

    get items() {
        return this._actual.items;
    }

    get actual() {
        return this._actual;
    }

    get lastIndex() {
        return this._actual.lastIndex;
    }

    get capacityIncSize() {
        return this._actual.capacityIncSize;
    }
    set capacityIncSize(value: IntegerApi | undefined) {
        this._actual.capacityIncSize = value;
    }

    get capacity() {
        return this._actual.capacity;
    }
    set capacity(value: IntegerApi) {
        this._actual.capacity = value;
    }
    get count() {
        return this._actual.count;
    }
    set count(value: IntegerApi) {
        this._actual.count = value;
    }

    clone(): ComparableListApi<T, U> {
        const actualClone = this._actual.clone();
        return ComparableListImplementation.baseToApi(actualClone);
    }

    getAt(index: IntegerApi): T {
        return this._actual.getAt(index);
    }

    setAt(index: IntegerApi, value: T): void {
        this._actual.setAt(index, value);
    }

    toArray(): readonly T[] {
        return this._actual.toArray();
    }

    rangeToArray(index: IntegerApi, count: IntegerApi): T[] {
        return this._actual.rangeToArray(index, count);
    }

    add(value: T): IntegerApi {
        return this._actual.add(value);
    }

    addRange(values: readonly T[]): void {
        this._actual.addRange(values);
    }

    addUndefinedRange(undefinedValueCount: IntegerApi): void {
        this._actual.addUndefinedRange(undefinedValueCount);
    }

    addSubRange(
        values: readonly T[],
        subRangeStartIndex: IntegerApi,
        subRangeCount: IntegerApi
    ): void {
        this._actual.addSubRange(values, subRangeStartIndex, subRangeCount);
    }

    insert(index: IntegerApi, value: T): void {
        this._actual.insert(index, value);
    }

    insertRange(index: IntegerApi, values: readonly T[]): void {
        this._actual.insertRange(index, values);
    }

    insertSubRange(index: IntegerApi, values: readonly T[], subRangeStartIndex: IntegerApi, subRangeCount: IntegerApi): void {
        this._actual.insertSubRange(index, values, subRangeStartIndex, subRangeCount);
    }

    remove(value: T): void {
        this._actual.remove(value);
    }

    removeAtIndex(index: IntegerApi): void {
        this._actual.removeAtIndex(index);
    }

    removeAtIndices(removeIndices: IntegerApi[], beforeRemoveRangeCallBack?: ComparableListApi.BeforeRemoveRangeCallBack): void {
        this._actual.removeAtIndices(removeIndices, beforeRemoveRangeCallBack);
    }

    removeRange(index: IntegerApi, deleteCount: IntegerApi): void {
        this._actual.removeRange(index, deleteCount);
    }

    removeItems(items: readonly T[], beforeRemoveRangeCallBack?: ComparableListApi.BeforeRemoveRangeCallBack): void {
        this._actual.removeItems(items, beforeRemoveRangeCallBack);
    }


    clear(): void {
        this._actual.clear();
    }

    extract(value: T): T {
        return this._actual.extract(value);
    }

    shift(): T | undefined {
        return this._actual.shift();
    }

    exchange(left: IntegerApi, right: IntegerApi): void {
        this._actual.exchange(left, right);
    }

    move(curIndex: IntegerApi, newIndex: IntegerApi): void {
        this._actual.move(curIndex, newIndex);
    }

    moveRange(fromIndex: IntegerApi, toIndex: IntegerApi, count: IntegerApi): void {
        this._actual.moveRange(fromIndex, toIndex, count);
    }

    first(): T {
        return this._actual.first();
    }

    last(): T {
        return this._actual.last();
    }

    setGrowthCapacity(growth: IntegerApi): void {
        this._actual.setGrowthCapacity(growth);
    }

    setMinimumCapacity(value: IntegerApi): void {
        this._actual.setMinimumCapacity(value);
    }

    trimExcess(): void {
        this._actual.trimExcess();
    }

    contains(value: T): boolean {
        return this._actual.contains(value);
    }

    has(predicate: (value: T, index: IntegerApi) => boolean): boolean {
        return this._actual.has(predicate);
    }

    indexOf(value: T): IntegerApi {
        return this._actual.indexOf(value);
    }

    find(predicate: (value: T, index: IntegerApi) => boolean): T | undefined {
        return this._actual.find(predicate);
    }

    findIndex(predicate: (value: T, index: IntegerApi) => boolean): number {
        return this._actual.findIndex(predicate);
    }

    compareItems(left: T, right: T): ComparisonResultApi {
        const result = this._actual.compareItems(left, right);
        return ComparisonResultImplementation.toApi(result);
    }

    sort(compareCallback?: ComparableListApi.CompareCallback<T>): void {
        if (compareCallback === undefined) {
            this._actual.sort(undefined);
        } else {
            this._actual.sort((left, right) => {
                const comparisonResult = compareCallback(left, right);
                return ComparisonResultImplementation.fromApi(comparisonResult);
            });
        }
    }

    binarySearchEarliest(item: T, compareCallback?: ComparableListApi.CompareCallback<T>): BinaryFind.Result {
        if (compareCallback === undefined) {
            return this._actual.binarySearchEarliest(item, undefined);
        } else {
            return this._actual.binarySearchEarliest(item, (left, right) => {
                const comparisonResult = compareCallback(left, right);
                return ComparisonResultImplementation.fromApi(comparisonResult);
            });
        }
    }

    binarySearchLatest(item: T, compareCallback?: ComparableListApi.CompareCallback<T>): BinaryFind.Result {
        if (compareCallback === undefined) {
            return this._actual.binarySearchLatest(item, undefined);
        } else {
            return this._actual.binarySearchLatest(item, (left, right) => {
                const comparisonResult = compareCallback(left, right);
                return ComparisonResultImplementation.fromApi(comparisonResult);
            });
        }
    }

    binarySearchAny(item: T, compareCallback?: ComparableListApi.CompareCallback<T>): BinaryFind.Result {
        if (compareCallback === undefined) {
            return this._actual.binarySearchAny(item, undefined);
        } else {
            return this._actual.binarySearchAny(item, (left, right) => {
                const comparisonResult = compareCallback(left, right);
                return ComparisonResultImplementation.fromApi(comparisonResult);
            });
        }
    }

    binaryFindEarliest(compareToFn: BinaryFind.CompareItemFn<T>): BinaryFind.Result {
        return this._actual.binaryFindEarliest((item) => {
            const comparisonResult = compareToFn(item);
            return ComparisonResultImplementation.fromApi(comparisonResult);
        });
    }

    binaryFindLatest(compareToFn: BinaryFind.CompareItemFn<T>): BinaryFind.Result {
        return this._actual.binaryFindLatest((item) => {
            const comparisonResult = compareToFn(item);
            return ComparisonResultImplementation.fromApi(comparisonResult);
        });
    }

    binaryFindAny(compareToFn: BinaryFind.CompareItemFn<T>): BinaryFind.Result {
        return this._actual.binaryFindAny((item) => {
            const comparisonResult = compareToFn(item);
            return ComparisonResultImplementation.fromApi(comparisonResult);
        });
    }
}

export namespace ComparableListImplementation {
    export function baseToApi<T extends U, U = T>(value: ComparableList<T, U>): ComparableListApi<T, U> {
        return new ComparableListImplementation(value);
    }

    export function baseFromApi<T extends U, U = T>(value: ComparableListApi<T, U>) {
        const implementation = value as ComparableListImplementation<T, U>;
        return implementation.actual;
    }
}
