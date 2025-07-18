import { DataMarket } from '../markets';
import { MarketIvemId } from './market-ivem-id-api';


/** @public */
export interface DataIvemId extends MarketIvemId<DataMarket> {
    createCopy(): DataIvemId;
}
