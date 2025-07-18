import { ComparisonResult, SourceTzOffsetDateTime, TimezoneMode } from '../../types';

/** @public */
export interface SourceTzOffsetDateTimeSvc {
    getTimezonedDate(value: SourceTzOffsetDateTime, adjustment: TimezoneMode): Date;
    createCopy(value: SourceTzOffsetDateTime): SourceTzOffsetDateTime;
    isEqual(left: SourceTzOffsetDateTime, right: SourceTzOffsetDateTime): boolean;
    isUndefinableEqual(left: SourceTzOffsetDateTime | undefined, right: SourceTzOffsetDateTime | undefined): boolean;
    compare(left: SourceTzOffsetDateTime, right: SourceTzOffsetDateTime): ComparisonResult;
    compareUndefinable(
        left: SourceTzOffsetDateTime | undefined,
        right: SourceTzOffsetDateTime | undefined,
        undefinedIsLowest: boolean
    ): ComparisonResult;
}
