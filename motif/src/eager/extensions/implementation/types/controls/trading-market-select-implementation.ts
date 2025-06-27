import { TradingMarket } from '@plxtra/motif-core';
import { TradingMarket as TradingMarketApi, TradingMarketSelect as TradingMarketSelectApi } from '../../../api';
import { DataMarketImplementation, ExchangeImplementation, TradingMarketImplementation } from '../adi/internal-api';
import { FactoryComponent } from '../component/internal-api';
import { MarketSelectImplementation } from './market-select-implementation';

export class TradingMarketSelectImplementation extends MarketSelectImplementation<TradingMarketApi, TradingMarket> implements TradingMarketSelectApi, FactoryComponent {
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
