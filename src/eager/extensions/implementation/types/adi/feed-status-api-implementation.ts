import { UnreachableCaseError } from '@pbkware/js-utils';
import { FeedStatusId } from '@plxtra/motif-core';
import {
    ApiError as ApiErrorApi,
    FeedStatus as FeedStatusApi,
    FeedStatusEnum as FeedStatusEnumApi
} from '../../../api';
import { UnreachableCaseApiErrorImplementation } from '../sys/internal-api';

export namespace FeedStatusImplementation {
    export function toApi(value: FeedStatusId): FeedStatusApi {
        switch (value) {
            case FeedStatusId.Initialising: return FeedStatusEnumApi.Initialising;
            case FeedStatusId.Active: return FeedStatusEnumApi.Active;
            case FeedStatusId.Closed: return FeedStatusEnumApi.Closed;
            case FeedStatusId.Inactive: return FeedStatusEnumApi.Inactive;
            case FeedStatusId.Impaired: return FeedStatusEnumApi.Impaired;
            case FeedStatusId.Expired: return FeedStatusEnumApi.Expired;
            default: throw new UnreachableCaseError('FSAITA50199', value);
        }
    }

    export function fromApi(value: FeedStatusApi): FeedStatusId {
        const enumValue = value as FeedStatusEnumApi;
        switch (enumValue) {
            case FeedStatusEnumApi.Initialising: return FeedStatusId.Initialising;
            case FeedStatusEnumApi.Active: return FeedStatusId.Active;
            case FeedStatusEnumApi.Closed: return FeedStatusId.Closed;
            case FeedStatusEnumApi.Inactive: return FeedStatusId.Inactive;
            case FeedStatusEnumApi.Impaired: return FeedStatusId.Impaired;
            case FeedStatusEnumApi.Expired: return FeedStatusId.Expired;
            default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidFeedStatus, enumValue);
        }
    }
}
