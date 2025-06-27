import {
    ComparisonResult as ComparisonResultApi,
    JsonElement as JsonElementApi,
    Market as MarketApi,
    MarketIvemId as MarketIvemIdApi,
    MarketIvemIdSvc,
    MarketList as MarketListApi,
    Result as ResultApi,
} from '../../../../api';

export abstract class MarketIvemIdSvcImplementation<T extends MarketApi> implements MarketIvemIdSvc<T> {
    abstract create(code: string, market: T): MarketIvemIdApi<T>;
    abstract isEqual(leftApi: MarketIvemIdApi<T>, rightApi: MarketIvemIdApi<T>): boolean;
    abstract isUndefinableEqual(leftApi: MarketIvemIdApi<T> | undefined, rightApi: MarketIvemIdApi<T> | undefined): boolean;
    abstract compare(leftApi: MarketIvemIdApi<T>, rightApi: MarketIvemIdApi<T>): ComparisonResultApi;
    abstract tryCreateFromJson(markets: MarketListApi<T>, element: JsonElementApi, unknownAllowed: boolean): ResultApi<MarketIvemIdApi<T>>;
}
