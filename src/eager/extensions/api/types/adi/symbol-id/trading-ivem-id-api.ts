import { TradingMarket } from '../markets';
import { MarketIvemId } from './market-ivem-id-api';

/** @public */
export interface TradingIvemId extends MarketIvemId<TradingMarket>{
    createCopy(): TradingIvemId;
}
