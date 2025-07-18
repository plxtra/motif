import { DataMarket } from '../adi';
import { DataMarketUiAction } from '../ui-action';
import { MarketSelect } from './market-select-api';

/** @public */
export interface DataMarketSelect extends MarketSelect<DataMarket>, DataMarketUiAction {

}
