import { UnreachableCaseError } from '@pbkware/js-utils';
import { TradingState } from '@plxtra/motif-core';
import { ApiError as ApiErrorApi, TradingState as TradingStateApi } from '../../../api';
import { UnreachableCaseApiErrorImplementation } from '../sys/internal-api';

export class TradingStateImplementation implements TradingStateApi {
    constructor(protected readonly _actual: TradingState) { }

    get name(): string { return this._actual.name; }
    get allows(): TradingStateApi.Allows {
        return TradingStateImplementation.Allow.arrayToApi(this._actual.allowIds);
    }
    get reason(): TradingStateApi.Reason {
        return TradingStateImplementation.Reason.toApi(this._actual.reasonId);
    }
}

export namespace TradingStateImplementation {
    export function toApi(value: TradingState): TradingStateApi {
        return new TradingStateImplementation(value);
    }

    export function arrayToApi(value: readonly TradingState[]): TradingStateApi[] {
        const count = value.length;
        const result = new Array<TradingStateApi>(count);
        for (let i = 0; i < count; i++) {
            result[i] = toApi(value[i]);
        }
        return result;
    }

    export namespace Allow {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function toApi(value: TradingState.AllowId): TradingStateApi.Allow {
            switch (value) {
                case TradingState.AllowId.OrderPlace: return TradingStateApi.AllowEnum.OrderPlace;
                case TradingState.AllowId.OrderAmend: return TradingStateApi.AllowEnum.OrderAmend;
                case TradingState.AllowId.OrderCancel: return TradingStateApi.AllowEnum.OrderCancel;
                case TradingState.AllowId.OrderMove: return TradingStateApi.AllowEnum.OrderMove;
                case TradingState.AllowId.Match: return TradingStateApi.AllowEnum.Match;
                case TradingState.AllowId.ReportCancel: return TradingStateApi.AllowEnum.ReportCancel;
                default: throw new UnreachableCaseError('TSAIATA50112', value);
            }
        }

        export function fromApi(value: TradingStateApi.Allow): TradingState.AllowId {
            const enumValue = value as TradingStateApi.AllowEnum;
            switch (enumValue) {
                case TradingStateApi.AllowEnum.OrderPlace: return TradingState.AllowId.OrderPlace;
                case TradingStateApi.AllowEnum.OrderAmend: return TradingState.AllowId.OrderAmend;
                case TradingStateApi.AllowEnum.OrderCancel: return TradingState.AllowId.OrderCancel;
                case TradingStateApi.AllowEnum.OrderMove: return TradingState.AllowId.OrderMove;
                case TradingStateApi.AllowEnum.Match: return TradingState.AllowId.Match;
                case TradingStateApi.AllowEnum.ReportCancel: return TradingState.AllowId.ReportCancel;
                default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidTradingStateAllow, enumValue);
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function arrayToApi(value: readonly TradingState.AllowId[]): TradingStateApi.Allow[] {
            const count = value.length;
            const result = new Array<TradingStateApi.Allow>(count);
            for (let i = 0; i < count; i++) {
                result[i] = toApi(value[i]);
            }
            return result;
        }
    }

    export namespace Reason {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function toApi(value: TradingState.ReasonId): TradingStateApi.Reason {
            switch (value) {
                case TradingState.ReasonId.Unknown: return TradingStateApi.ReasonEnum.Unknown;
                case TradingState.ReasonId.Normal: return TradingStateApi.ReasonEnum.Normal;
                case TradingState.ReasonId.Suspend: return TradingStateApi.ReasonEnum.Suspend;
                case TradingState.ReasonId.TradingHalt: return TradingStateApi.ReasonEnum.TradingHalt;
                case TradingState.ReasonId.NewsRelease: return TradingStateApi.ReasonEnum.NewsRelease;
                default: throw new UnreachableCaseError('TSAIRTA50112', value);
            }
        }

        export function fromApi(value: TradingStateApi.Reason): TradingState.ReasonId {
            const enumValue = value as TradingStateApi.ReasonEnum;
            switch (enumValue) {
                case TradingStateApi.ReasonEnum.Unknown: return TradingState.ReasonId.Unknown;
                case TradingStateApi.ReasonEnum.Normal: return TradingState.ReasonId.Normal;
                case TradingStateApi.ReasonEnum.Suspend: return TradingState.ReasonId.Suspend;
                case TradingStateApi.ReasonEnum.TradingHalt: return TradingState.ReasonId.TradingHalt;
                case TradingStateApi.ReasonEnum.NewsRelease: return TradingState.ReasonId.NewsRelease;
                default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidTradingStateReason, enumValue);
            }
        }
    }
}
