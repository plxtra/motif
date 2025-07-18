import { UnreachableCaseError } from '@pbkware/js-utils';
import { CorrectnessId } from '@plxtra/motif-core';
import {
    ApiError as ApiErrorApi,
    Correctness as CorrectnessApi,
    CorrectnessEnum as CorrectnessEnumApi
} from '../../../api';
import { UnreachableCaseApiErrorImplementation } from './api-error-api-implementation';

export namespace CorrectnessImplementation {
    export function toApi(value: CorrectnessId): CorrectnessApi {
        switch (value) {
            case CorrectnessId.Good: return CorrectnessEnumApi.Good;
            case CorrectnessId.Usable: return CorrectnessEnumApi.Usable;
            case CorrectnessId.Suspect: return CorrectnessEnumApi.Suspect;
            case CorrectnessId.Error: return CorrectnessEnumApi.Error;
            default: throw new UnreachableCaseError('FCAITAU9000432338', value);
        }
    }

    export function fromApi(value: CorrectnessApi): CorrectnessId {
        const enumValue = value as CorrectnessEnumApi;
        switch (enumValue) {
            case CorrectnessEnumApi.Good: return CorrectnessId.Good;
            case CorrectnessEnumApi.Usable: return CorrectnessId.Usable;
            case CorrectnessEnumApi.Suspect: return CorrectnessId.Suspect;
            case CorrectnessEnumApi.Error: return CorrectnessId.Error;
            default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidCorrectness, enumValue);
        }
    }
}
