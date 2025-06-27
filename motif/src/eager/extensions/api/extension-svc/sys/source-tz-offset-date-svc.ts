import { ComparisonResult, SourceTzOffsetDate } from '../../types';

/** @public */
export interface SourceTzOffsetDateSvc {
    getAsMidnightLocalTimeDate(value: SourceTzOffsetDate): Date;
    createCopy(value: SourceTzOffsetDate): SourceTzOffsetDate;
    createFromUtcDate(value: Date): SourceTzOffsetDate;
    createFromLocalDate(value: Date): SourceTzOffsetDate;
    toUtcYYYYMMDDString(value: SourceTzOffsetDate): string;
    toUtcDashedYyyyMmDdString(value: SourceTzOffsetDate): string;
    isEqual(left: SourceTzOffsetDate, right: SourceTzOffsetDate): boolean;
    isUndefinableEqual(left: SourceTzOffsetDate | undefined, right: SourceTzOffsetDate | undefined): boolean;
    isEqualToDate(offsetDate: SourceTzOffsetDate, date: Date): boolean;
    compare(left: SourceTzOffsetDate, right: SourceTzOffsetDate): ComparisonResult;
    compareUndefinable(
        left: SourceTzOffsetDate | undefined,
        right: SourceTzOffsetDate | undefined,
        undefinedIsLowest: boolean
    ): ComparisonResult;
}
