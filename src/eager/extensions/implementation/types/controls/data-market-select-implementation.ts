import { DataMarket } from '@plxtra/motif-core';
import { DataMarket as DataMarketApi, DataMarketSelect as DataMarketSelectApi } from '../../../api';
import { DataMarketImplementation, ExchangeImplementation, TradingMarketImplementation } from '../adi/internal-api';
import { FactoryComponent } from '../component/internal-api';
import { MarketSelectImplementation } from './market-select-implementation';

export class DataMarketSelectImplementation extends MarketSelectImplementation<DataMarketApi, DataMarket> implements DataMarketSelectApi, FactoryComponent {
    protected toApi(value: DataMarket): DataMarketApi {
        return DataMarketImplementation.toApi(value, ExchangeImplementation, TradingMarketImplementation);
    }

    protected fromApi(value: DataMarketApi): DataMarket {
        return DataMarketImplementation.fromApi(value);
    }

    protected arrayToApi(value: readonly DataMarket[]): DataMarketApi[] {
        return DataMarketImplementation.arrayToApi(value, ExchangeImplementation, TradingMarketImplementation);
    }

    protected arrayFromApi(value: readonly DataMarketApi[]): DataMarket[] {
        return DataMarketImplementation.arrayFromApi(value);
    }
}
