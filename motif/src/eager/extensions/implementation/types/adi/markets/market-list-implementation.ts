import { Market, MarketsService } from '@plxtra/motif-core';
import {
    Correctness as CorrectnessApi,
    Market as MarketApi,
    MarketList as MarketListApi
} from '../../../../api';
import { CorrectnessImplementation, ReadonlyApiComparableListImplementation } from '../../sys/internal-api';
import { MarketImplementation } from './market-api-implementation';

export abstract class MarketListImplementation<T extends MarketApi, A extends Market> extends ReadonlyApiComparableListImplementation<T, A> implements MarketListApi<T> {
    declare readonly actual: MarketsService.Markets<A>;

    get marketType(): MarketApi.Type { return MarketImplementation.Type.toApi(this.actual.marketTypeId); }

    get usable(): boolean { return this.actual.usable; }
    get correctness(): CorrectnessApi { return CorrectnessImplementation.toApi(this.actual.correctnessId); }
}

export namespace MarketListImplementation {
    export function fromApi<T extends MarketApi, A extends Market>(value: MarketListApi<T>): MarketsService.Markets<A> {
        const implementation = value as MarketListImplementation<T, A>;
        return implementation.actual;
    }
}
