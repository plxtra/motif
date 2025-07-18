import { BinaryFind, Integer } from '../../types';

/** @public */
export interface BinaryFindSvc {
    any<T>(values: T[], compareItemFn: BinaryFind.CompareItemFn<T>): BinaryFind.Result;
    /** Finds any matching index in range.  Use if index values are unique */
    rangedAny<T>(values: T[], compareItemFn: BinaryFind.CompareItemFn<T>, index: Integer, count: Integer): BinaryFind.Result;
    /** Finds earliest matching index.  Use if index values are not unique */
    earliest<T>(values: T[], compareItemFn: BinaryFind.CompareItemFn<T>): BinaryFind.Result;
    /** Finds earliest matching index in range.  Use if index values are not unique */
    rangedEarliest<T>(values: T[], compareItemFn: BinaryFind.CompareItemFn<T>, index: Integer, count: Integer): BinaryFind.Result;
    /** Finds earliest matching index.  Use if index values are not unique */
    latest<T>(values: T[], compareItemFn: BinaryFind.CompareItemFn<T>): BinaryFind.Result;
    /** Finds latest matching index.  Use if index values are not unique */
    rangedLatest<T>(values: T[], compareItemFn: BinaryFind.CompareItemFn<T>, index: Integer, count: Integer): BinaryFind.Result;
}
