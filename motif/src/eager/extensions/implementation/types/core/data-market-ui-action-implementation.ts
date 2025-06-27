import { DataMarket } from '@plxtra/motif-core';
import { DataMarket as DataMarketApi, DataMarketUiAction as DataMarketUiActionApi } from '../../../api';
import { DataMarketImplementation, ExchangeImplementation, TradingMarketImplementation } from '../adi/internal-api';
import { MarketUiActionImplementation } from './market-ui-action-implementation';

export class DataMarketUiActionImplementation extends MarketUiActionImplementation<DataMarketApi, DataMarket> implements DataMarketUiActionApi {
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
