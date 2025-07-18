import { SourceTzOffsetDate } from '@pbkware/js-utils';
import {
    ComparisonResult as ComparisonResultApi,
    SourceTzOffsetDate as SourceTzOffsetDateApi,
    SourceTzOffsetDateSvc
} from '../../../api';
import { ComparisonResultImplementation } from '../../types/internal-api';

export class SourceTzOffsetDateSvcImplementation implements SourceTzOffsetDateSvc {
    getAsMidnightLocalTimeDate(value: SourceTzOffsetDateApi): Date {
        return SourceTzOffsetDate.getAsMidnightLocalTimeDate(value);
    }

    createCopy(value: SourceTzOffsetDateApi): SourceTzOffsetDateApi {
        return SourceTzOffsetDate.createCopy(value);
    }

    createFromUtcDate(value: Date): SourceTzOffsetDateApi {
        return SourceTzOffsetDate.createFromUtcDate(value);
    }

    createFromLocalDate(value: Date): SourceTzOffsetDateApi {
        return SourceTzOffsetDate.createFromLocalDate(value);
    }

    toUtcYYYYMMDDString(value: SourceTzOffsetDateApi): string {
        return SourceTzOffsetDate.toUtcYYYYMMDDString(value);
    }

    toUtcDashedYyyyMmDdString(value: SourceTzOffsetDateApi): string {
        return SourceTzOffsetDate.toUtcDashedYyyyMmDdString(value);
    }

    isEqual(left: SourceTzOffsetDateApi, right: SourceTzOffsetDateApi): boolean {
        return SourceTzOffsetDate.isEqual(left, right);
    }

    isUndefinableEqual(left: SourceTzOffsetDateApi | undefined, right: SourceTzOffsetDateApi | undefined): boolean {
        return SourceTzOffsetDate.isUndefinableEqual(left, right);
    }

    isEqualToDate(offsetDate: SourceTzOffsetDateApi, date: Date): boolean {
        return SourceTzOffsetDate.isEqualToDate(offsetDate, date);
    }

    compare(left: SourceTzOffsetDateApi, right: SourceTzOffsetDateApi): ComparisonResultApi {
        const result = SourceTzOffsetDate.compare(left, right);
        return ComparisonResultImplementation.toApi(result);
    }

    compareUndefinable(
        left: SourceTzOffsetDateApi | undefined,
        right: SourceTzOffsetDateApi | undefined,
        undefinedIsLowest: boolean
    ): ComparisonResultApi {
        const result = SourceTzOffsetDate.compareUndefinable(left, right, undefinedIsLowest);
        return ComparisonResultImplementation.toApi(result);
    }
}
