import { BinarySearchResult, ComparableList } from '@pbkware/js-utils';
import {
    BinaryFind as BinaryFindApi,
    ComparisonResult as ComparisonResultApi,
    Integer as IntegerApi,
    ReadonlyComparableList as ReadonlyComparableListApi,
} from '../../../api';
import { ComparisonResultImplementation } from './types-api-implementation';

export abstract class ReadonlyApiComparableListImplementation<out T extends U, A, in U = T> implements ReadonlyComparableListApi<T, U> {
    constructor(readonly actual: ComparableList<A>) {
    }

    get items(): readonly T[] { return this.itemArrayToApi(this.actual.items); }
    get lastIndex(): number { return this.actual.lastIndex; }

    get count(): number { return this.actual.count; }

    getAt(index: IntegerApi): T {
        return this.itemToApi(this.actual.getAt(index));
    }

    toArray(): readonly T[] {
        return this.itemArrayToApi(this.actual.toArray());
    }

    rangeToArray(index: IntegerApi, count: IntegerApi): T[] {
        return this.itemArrayToApi(this.actual.rangeToArray(index, count));
    }

    first(): T {
        return this.itemToApi(this.actual.first());
    }

    last(): T {
        return this.itemToApi(this.actual.last());
    }

    contains(value: T): boolean {
        const actual = this.itemFromApi(value);
        return this.actual.contains(actual);
    }

    has(predicate: (value: T, index: IntegerApi) => boolean): boolean {
        return this.actual.has((actualItem, index) => {
            const apiItem = this.itemToApi(actualItem);
            return predicate(apiItem, index);
        });
    }

    indexOf(value: T): IntegerApi {
        const actualItem = this.itemFromApi(value);
        return this.actual.indexOf(actualItem);
    }

    find(predicate: (value: T, index: IntegerApi) => boolean): T | undefined {
        const foundActual = this.actual.find((actualItem, index) => {
            const apiItem = this.itemToApi(actualItem);
            return predicate(apiItem, index);
        });

        if (foundActual === undefined) {
            return undefined;
        } else {
            return this.itemToApi(foundActual);
        }
    }

    findIndex(predicate: (value: T, index: IntegerApi) => boolean): number {
        return this.actual.findIndex((actualItem, index) => {
            const apiItem = this.itemToApi(actualItem);
            return predicate(apiItem, index);
        });
    }

    compareItems(left: T, right: T): ComparisonResultApi {
        const actualResult = this.actual.compareItems(this.itemFromApi(left), this.itemFromApi(right));
        return ComparisonResultImplementation.toApi(actualResult);
    }

    binarySearchEarliest(item: T, compareCallback: ReadonlyComparableListApi.CompareCallback<T> | undefined): BinaryFindApi.Result {
        const actualItem = this.itemFromApi(item);

        let actualResult: BinarySearchResult;
        if (compareCallback === undefined) {
            actualResult = this.actual.binarySearchEarliest(actualItem, undefined);
        } else {
            actualResult = this.actual.binarySearchEarliest(actualItem, (left, right) => {
                const apiComparisonResult = compareCallback(this.itemToApi(left), this.itemToApi(right));
                return ComparisonResultImplementation.fromApi(apiComparisonResult);
            });
        }

        return actualResult; // Can return actual as same shape
    }

    binarySearchLatest(item: T, compareCallback: ReadonlyComparableListApi.CompareCallback<T> | undefined): BinaryFindApi.Result {
        const actualItem = this.itemFromApi(item);

        let actualResult: BinarySearchResult;
        if (compareCallback === undefined) {
            actualResult = this.actual.binarySearchLatest(actualItem, undefined);
        } else {
            actualResult = this.actual.binarySearchLatest(actualItem, (left, right) => {
                const apiComparisonResult = compareCallback(this.itemToApi(left), this.itemToApi(right));
                return ComparisonResultImplementation.fromApi(apiComparisonResult);
            });
        }

        return actualResult; // Can return actual as same shape
    }

    binarySearchAny(item: T, compareCallback: ReadonlyComparableListApi.CompareCallback<T> | undefined): BinaryFindApi.Result {
        const actualItem = this.itemFromApi(item);

        let actualResult: BinarySearchResult;
        if (compareCallback === undefined) {
            actualResult = this.actual.binarySearchAny(actualItem, undefined);
        } else {
            actualResult = this.actual.binarySearchAny(actualItem, (left, right) => {
                const apiComparisonResult = compareCallback(this.itemToApi(left), this.itemToApi(right));
                return ComparisonResultImplementation.fromApi(apiComparisonResult);
            });
        }

        return actualResult; // Can return actual as same shape
    }

    binaryFindEarliest(compareToFn: BinaryFindApi.CompareItemFn<T>): BinaryFindApi.Result {
        const actualResult = this.actual.binaryFindEarliest((actualItem) => {
            const apiComparisonResult = compareToFn(this.itemToApi(actualItem));
            return ComparisonResultImplementation.fromApi(apiComparisonResult);
        });

        return actualResult; // Can return actual as same shape
    }

    binaryFindLatest(compareToFn: BinaryFindApi.CompareItemFn<T>): BinaryFindApi.Result {
        const actualResult = this.actual.binaryFindLatest((actualItem) => {
            const apiComparisonResult = compareToFn(this.itemToApi(actualItem));
            return ComparisonResultImplementation.fromApi(apiComparisonResult);
        });

        return actualResult; // Can return actual as same shape
    }

    binaryFindAny(compareToFn: BinaryFindApi.CompareItemFn<T>): BinaryFindApi.Result {
        const actualResult = this.actual.binaryFindAny((actualItem) => {
            const apiComparisonResult = compareToFn(this.itemToApi(actualItem));
            return ComparisonResultImplementation.fromApi(apiComparisonResult);
        });

        return actualResult; // Can return actual as same shape
    }

    abstract itemToApi(value: A): T;
    abstract itemFromApi(value: T): A;
    abstract itemArrayToApi(value: A[]): T[];
}
