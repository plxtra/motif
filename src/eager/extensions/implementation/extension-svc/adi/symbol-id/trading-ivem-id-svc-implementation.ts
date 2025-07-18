import { MarketIvemId, TradingIvemId, TradingMarket } from '@plxtra/motif-core';
import {
    ComparisonResult as ComparisonResultApi,
    JsonElement as JsonElementApi,
    Result as ResultApi,
    TradingIvemId as TradingIvemIdApi,
    TradingIvemIdSvc,
    TradingMarket as TradingMarketApi,
    TradingMarketList as TradingMarketListApi,
} from '../../../../api';
import {
    ComparisonResultImplementation,
    ErrImplementation,
    JsonElementImplementation,
    OkImplementation,
    TradingIvemIdImplementation,
    TradingMarketImplementation,
    TradingMarketListImplementation
} from '../../../types/internal-api';
import { MarketIvemIdSvcImplementation } from './market-ivem-id-svc-implementation';

export class TradingIvemIdSvcImplementation extends MarketIvemIdSvcImplementation<TradingMarketApi> implements TradingIvemIdSvc {
    create(code: string, market: TradingMarketApi): TradingIvemIdApi {
        const actualMarket = TradingMarketImplementation.fromApi(market);
        const actualTradingIvemId = new TradingIvemId(code, actualMarket);
        return TradingIvemIdImplementation.toApi(actualTradingIvemId);
    }

    isEqual(leftApi: TradingIvemIdApi, rightApi: TradingIvemIdApi): boolean {
        const left = TradingIvemIdImplementation.fromApi(leftApi);
        const right = TradingIvemIdImplementation.fromApi(rightApi);
        return TradingIvemId.isEqual(left, right);
    }

    isUndefinableEqual(leftApi: TradingIvemIdApi | undefined, rightApi: TradingIvemIdApi | undefined): boolean {
        const left = leftApi === undefined ? undefined : TradingIvemIdImplementation.fromApi(leftApi);
        const right = rightApi === undefined ? undefined : TradingIvemIdImplementation.fromApi(rightApi);
        return TradingIvemId.isUndefinableEqual(left, right);
    }

    compare(leftApi: TradingIvemIdApi, rightApi: TradingIvemIdApi): ComparisonResultApi {
        const left = TradingIvemIdImplementation.fromApi(leftApi);
        const right = TradingIvemIdImplementation.fromApi(rightApi);
        const result = TradingIvemId.compare(left, right);
        return ComparisonResultImplementation.toApi(result);
    }

    tryCreateFromJson(markets: TradingMarketListApi, element: JsonElementApi, unknownAllowed: boolean): ResultApi<TradingIvemIdApi> {
        const actualMarkets = TradingMarketListImplementation.fromApi<TradingMarketApi, TradingMarket>(markets);
        const actualElement = JsonElementImplementation.fromApi(element);
        const tryCreateResult = MarketIvemId.tryCreateFromJson(actualMarkets, actualElement, TradingIvemId, unknownAllowed);
        if (tryCreateResult.isOk()) {
            const actualTradingIvemId = tryCreateResult.value;
            const TradingItemIdApi = TradingIvemIdImplementation.toApi(actualTradingIvemId);
            return new OkImplementation(TradingItemIdApi);
        } else {
            return new ErrImplementation(tryCreateResult.error);
        }
    }
}
