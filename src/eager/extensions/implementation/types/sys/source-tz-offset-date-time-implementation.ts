import { SourceTzOffsetDateTime, UnreachableCaseError } from '@pbkware/js-utils';
import { ApiError as ApiErrorApi, TimezoneMode as TimezoneModeApi, TimezoneModeEnum as TimezoneModeEnumApi } from '../../../api';
import { UnreachableCaseApiErrorImplementation } from './api-error-api-implementation';

export namespace TimezoneModeImplementation {
    export function toApi(value: SourceTzOffsetDateTime.TimezoneModeId): TimezoneModeApi {
        switch (value) {
            case SourceTzOffsetDateTime.TimezoneModeId.Utc: return TimezoneModeEnumApi.Utc;
            case SourceTzOffsetDateTime.TimezoneModeId.Local: return TimezoneModeEnumApi.Local;
            case SourceTzOffsetDateTime.TimezoneModeId.Source: return TimezoneModeEnumApi.Source;
            default: throw new UnreachableCaseError('TMITA22011', value);
        }
    }

    export function fromApi(value: TimezoneModeApi): SourceTzOffsetDateTime.TimezoneModeId {
        const enumValue = value as TimezoneModeEnumApi;
        switch (enumValue) {
            case TimezoneModeEnumApi.Utc: return SourceTzOffsetDateTime.TimezoneModeId.Utc;
            case TimezoneModeEnumApi.Local: return SourceTzOffsetDateTime.TimezoneModeId.Local;
            case TimezoneModeEnumApi.Source: return SourceTzOffsetDateTime.TimezoneModeId.Source;
            default: {
                const code = ApiErrorApi.CodeEnum.InvalidSourceTzOffsetDateTimeApiTimezoneMode;
                throw new UnreachableCaseApiErrorImplementation(code, enumValue);
            }
        }
    }
}
