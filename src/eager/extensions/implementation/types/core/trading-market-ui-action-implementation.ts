import { TradingMarket } from '@plxtra/motif-core';
import { TradingMarket as TradingMarketApi, TradingMarketUiAction as TradingMarketUiActionApi } from '../../../api';
import { DataMarketImplementation, ExchangeImplementation, TradingMarketImplementation } from '../adi/internal-api';
import { MarketUiActionImplementation } from './market-ui-action-implementation';

export class TradingMarketUiActionImplementation extends MarketUiActionImplementation<TradingMarketApi, TradingMarket> implements TradingMarketUiActionApi {
    protected toApi(value: TradingMarket): TradingMarketApi {
        return TradingMarketImplementation.toApi(value, ExchangeImplementation, DataMarketImplementation);
    }

    protected fromApi(value: TradingMarketApi): TradingMarket {
        return TradingMarketImplementation.fromApi(value);
    }

    protected arrayToApi(value: readonly TradingMarket[]): TradingMarketApi[] {
        return TradingMarketImplementation.arrayToApi(value, ExchangeImplementation, DataMarketImplementation);
    }

    protected arrayFromApi(value: readonly TradingMarketApi[]): TradingMarket[] {
        return TradingMarketImplementation.arrayFromApi(value);
    }
}
