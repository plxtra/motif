import { UnreachableCaseError } from '@pbkware/js-utils';
import { FeedClassId } from '@plxtra/motif-core';
import {
    ApiError as ApiErrorApi,
    FeedClass as FeedClassApi,
    FeedClassEnum as FeedClassEnumApi
} from '../../../api';
import { UnreachableCaseApiErrorImplementation } from '../sys/internal-api';

export namespace FeedClassImplementation {
    export function toApi(value: FeedClassId): FeedClassApi {
        switch (value) {
            case FeedClassId.Authority: return FeedClassEnumApi.Authority;
            case FeedClassId.Market: return FeedClassEnumApi.Market;
            case FeedClassId.News: return FeedClassEnumApi.News;
            case FeedClassId.Trading: return FeedClassEnumApi.Trading;
            case FeedClassId.Watchlist: return FeedClassEnumApi.Watchlist;
            case FeedClassId.Scanner: return FeedClassEnumApi.Scanner;
            case FeedClassId.Channel: return FeedClassEnumApi.Channel;
            default: throw new UnreachableCaseError('FCAITAU9000432338', value);
        }
    }

    export function fromApi(value: FeedClassApi): FeedClassId {
        const enumValue = value as FeedClassEnumApi;
        switch (enumValue) {
            case FeedClassEnumApi.Authority: return FeedClassId.Authority;
            case FeedClassEnumApi.Market: return FeedClassId.Market;
            case FeedClassEnumApi.News: return FeedClassId.News;
            case FeedClassEnumApi.Trading: return FeedClassId.Trading;
            case FeedClassEnumApi.Watchlist: return FeedClassId.Watchlist;
            case FeedClassEnumApi.Scanner: return FeedClassId.Scanner;
            case FeedClassEnumApi.Channel: return FeedClassId.Channel;
            default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidFeedClass, enumValue);
        }
    }
}
