import { DataMarket, MarketsService } from '@plxtra/motif-core';
import { DataMarket as DataMarketApi, DataMarketList as DataMarketListApi } from '../../../../api';
import { DataMarketImplementation } from './data-market-api-implementation';
import { ExchangeImplementation } from './exchange-api-implementation';
import { MarketListImplementation } from './market-list-implementation';
import { TradingMarketImplementation } from './trading-market-api-implementation';

export class DataMarketListImplementation extends MarketListImplementation<DataMarketApi, DataMarket> implements DataMarketListApi {
    override itemToApi(value: DataMarket): DataMarketApi {
        return DataMarketImplementation.toApi(value, ExchangeImplementation, TradingMarketImplementation);
    }
    override itemFromApi(value: DataMarketApi): DataMarket {
        return (value as DataMarketImplementation).actual;
    }
    override itemArrayToApi(value: DataMarket[]): DataMarketApi[] {
        const count = value.length;
        const result = new Array<DataMarketApi>(count);
        for (let i = 0; i < count; i++) {
            const dataMarket = value[i];
            result[i] = this.itemToApi(dataMarket);
        }
        return result;
    }
}

export namespace DataMarketListImplementation {
    export function toApi(value: MarketsService.Markets<DataMarket>): DataMarketListApi {
        return new DataMarketListImplementation(value);
    }
}
