import { Exchange, MarketsService } from '@plxtra/motif-core';
import { Exchange as ExchangeApi, ExchangeList as ExchangeListApi } from '../../../../api';
import { ReadonlyApiComparableListImplementation } from '../../sys/internal-api';
import { ExchangeImplementation } from './exchange-api-implementation';

export class ExchangeListImplementation extends ReadonlyApiComparableListImplementation<ExchangeApi, Exchange> implements ExchangeListApi {
    declare readonly actual: MarketsService.Exchanges;

    override itemToApi(value: Exchange): ExchangeApi {
        return ExchangeImplementation.toApi(value);
    }
    override itemFromApi(value: ExchangeApi): Exchange {
        return ExchangeImplementation.fromApi(value);
    }
    override itemArrayToApi(value: Exchange[]): ExchangeApi[] {
        const count = value.length;
        const result = new Array<ExchangeApi>(count);
        for (let i = 0; i < count; i++) {
            const tradingMarket = value[i];
            result[i] = this.itemToApi(tradingMarket);
        }
        return result;
    }
}

export namespace ExchangeListImplementation {
    export function toApi(value: MarketsService.Exchanges): ExchangeListApi {
        return new ExchangeListImplementation(value);
    }

    export function fromApi(value: ExchangeListApi): MarketsService.Exchanges {
        const implementation = value as ExchangeListImplementation;
        return implementation.actual;
    }
}
