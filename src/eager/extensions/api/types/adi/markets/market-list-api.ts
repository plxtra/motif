import { Correctness } from '../../sys';
import { ReadonlyComparableList } from '../../sys/readonly-comparable-list-api';
import { Market } from './market-api';

/** @public */
export interface MarketList<T extends Market> extends ReadonlyComparableList<T> {
    readonly marketType: Market.Type;

    readonly usable: boolean;
    readonly correctness: Correctness;
}
