import { ComparisonResult, JsonElement, Market, MarketIvemId, MarketList, Result } from '../../../types';

/** @public */
export interface MarketIvemIdSvc<T extends Market> {
    create(code: string, market: T): MarketIvemId<T>;
    isEqual(left: MarketIvemId<T>, right: MarketIvemId<T>): boolean;
    isUndefinableEqual(left: MarketIvemId<T> | undefined, right: MarketIvemId<T> | undefined): boolean;
    compare(left: MarketIvemId<T>, right: MarketIvemId<T>): ComparisonResult;
    tryCreateFromJson(markets: MarketList<T>, element: JsonElement, unknownAllowed: boolean): Result<MarketIvemId<T>>;
}
