import { ExchangeEnvironment, MarketsService } from '@plxtra/motif-core';
import { ExchangeEnvironment as ExchangeEnvironmentApi, ExchangeEnvironmentList as ExchangeEnvironmentListApi } from '../../../../api';
import { ReadonlyApiComparableListImplementation } from '../../sys/internal-api';
import { DataMarketImplementation } from './data-market-api-implementation';
import { ExchangeImplementation } from './exchange-api-implementation';
import { ExchangeEnvironmentImplementation } from './exchange-environment-api-implementation';
import { TradingMarketImplementation } from './trading-market-api-implementation';

export class ExchangeEnvironmentListImplementation extends ReadonlyApiComparableListImplementation<ExchangeEnvironmentApi, ExchangeEnvironment> implements ExchangeEnvironmentListApi {
    declare readonly actual: MarketsService.ExchangeEnvironments;

    override itemToApi(value: ExchangeEnvironment): ExchangeEnvironmentApi {
        return ExchangeEnvironmentImplementation.toApi(value, ExchangeImplementation, DataMarketImplementation, TradingMarketImplementation);
    }
    override itemFromApi(value: ExchangeEnvironmentApi): ExchangeEnvironment {
        return ExchangeEnvironmentImplementation.fromApi(value);
    }
    override itemArrayToApi(value: ExchangeEnvironment[]): ExchangeEnvironmentApi[] {
        const count = value.length;
        const result = new Array<ExchangeEnvironmentApi>(count);
        for (let i = 0; i < count; i++) {
            const tradingMarket = value[i];
            result[i] = this.itemToApi(tradingMarket);
        }
        return result;
    }
}

export namespace ExchangeEnvironmentListImplementation {
    export function toApi(value: MarketsService.ExchangeEnvironments): ExchangeEnvironmentListApi {
        return new ExchangeEnvironmentListImplementation(value);
    }

    export function fromApi(value: ExchangeEnvironmentListApi): MarketsService.ExchangeEnvironments {
        const implementation = value as ExchangeEnvironmentListImplementation;
        return implementation.actual;
    }
}
