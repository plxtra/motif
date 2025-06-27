import { SourceTzOffsetDateTime } from '@pbkware/js-utils';
import {
    ComparisonResult as ComparisonResultApi,
    SourceTzOffsetDateTime as SourceTzOffsetDateTimeApi,
    SourceTzOffsetDateTimeSvc,
    TimezoneMode as TimezoneModeApi
} from '../../../api';
import { ComparisonResultImplementation, TimezoneModeImplementation } from '../../types/internal-api';

export class SourceTzOffsetDateTimeSvcImplementation implements SourceTzOffsetDateTimeSvc {
    getTimezonedDate(value: SourceTzOffsetDateTimeApi, adjustmentApi: TimezoneModeApi): Date {
        const adjustment = TimezoneModeImplementation.fromApi(adjustmentApi);
        return SourceTzOffsetDateTime.getTimezonedDate(value, adjustment);
    }

    createCopy(value: SourceTzOffsetDateTimeApi): SourceTzOffsetDateTimeApi {
        return SourceTzOffsetDateTime.createCopy(value);
    }

    isEqual(left: SourceTzOffsetDateTimeApi, right: SourceTzOffsetDateTimeApi): boolean {
        return SourceTzOffsetDateTime.isEqual(left, right);
    }

    isUndefinableEqual(left: SourceTzOffsetDateTimeApi | undefined, right: SourceTzOffsetDateTimeApi | undefined): boolean {
        return SourceTzOffsetDateTime.isUndefinableEqual(left, right);
    }

    compare(left: SourceTzOffsetDateTimeApi, right: SourceTzOffsetDateTimeApi): ComparisonResultApi {
        const result = SourceTzOffsetDateTime.compare(left, right);
        return ComparisonResultImplementation.toApi(result);
    }

    compareUndefinable(
        left: SourceTzOffsetDateTimeApi | undefined,
        right: SourceTzOffsetDateTimeApi | undefined,
        undefinedIsLowest: boolean
    ): ComparisonResultApi {
        const result = SourceTzOffsetDateTime.compareUndefinable(left, right, undefinedIsLowest);
        return ComparisonResultImplementation.toApi(result);
    }
}
