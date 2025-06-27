import { TradingMarket } from '../adi';
import { TradingMarketUiAction } from '../ui-action';
import { MarketSelect } from './market-select-api';

/** @public */
export interface TradingMarketSelect extends MarketSelect<TradingMarket>, TradingMarketUiAction {

}
