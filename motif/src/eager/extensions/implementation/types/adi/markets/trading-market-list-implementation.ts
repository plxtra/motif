import { MarketsService, TradingMarket } from '@plxtra/motif-core';
import { TradingMarket as TradingMarketApi, TradingMarketList as TradingMarketListApi } from '../../../../api';
import { DataMarketImplementation } from './data-market-api-implementation';
import { ExchangeImplementation } from './exchange-api-implementation';
import { MarketListImplementation } from './market-list-implementation';
import { TradingMarketImplementation } from './trading-market-api-implementation';

export class TradingMarketListImplementation extends MarketListImplementation<TradingMarketApi, TradingMarket> implements TradingMarketListApi {
    override itemToApi(value: TradingMarket): TradingMarketApi {
        return TradingMarketImplementation.toApi(value, ExchangeImplementation, DataMarketImplementation);
    }
    override itemFromApi(value: TradingMarketApi): TradingMarket {
        return (value as TradingMarketImplementation).actual;
    }
    override itemArrayToApi(value: TradingMarket[]): TradingMarketApi[] {
        const count = value.length;
        const result = new Array<TradingMarketApi>(count);
        for (let i = 0; i < count; i++) {
            const tradingMarket = value[i];
            result[i] = this.itemToApi(tradingMarket);
        }
        return result;
    }
}

export namespace TradingMarketListImplementation {
    export function toApi(value: MarketsService.Markets<TradingMarket>): TradingMarketListApi {
        return new TradingMarketListImplementation(value);
    }
}
