import { DataIvemId, DataMarket, MarketIvemId } from '@plxtra/motif-core';
import {
    ComparisonResult as ComparisonResultApi,
    DataIvemId as DataIvemIdApi,
    DataIvemIdSvc,
    DataMarket as DataMarketApi,
    DataMarketList as DataMarketListApi,
    JsonElement as JsonElementApi,
    Result as ResultApi
} from '../../../../api';
import {
    ComparisonResultImplementation,
    DataIvemIdImplementation,
    DataMarketImplementation,
    DataMarketListImplementation,
    ErrImplementation,
    JsonElementImplementation,
    OkImplementation
} from '../../../types/internal-api';
import { MarketIvemIdSvcImplementation } from './market-ivem-id-svc-implementation';

export class DataIvemIdSvcImplementation extends MarketIvemIdSvcImplementation<DataMarketApi> implements DataIvemIdSvc {
    create(code: string, market: DataMarketApi): DataIvemIdApi {
        const actualMarket = DataMarketImplementation.fromApi(market);
        const actualDataIvemId = new DataIvemId(code, actualMarket);
        return DataIvemIdImplementation.toApi(actualDataIvemId);
    }

    isEqual(leftApi: DataIvemIdApi, rightApi: DataIvemIdApi): boolean {
        const left = DataIvemIdImplementation.fromApi(leftApi);
        const right = DataIvemIdImplementation.fromApi(rightApi);
        return DataIvemId.isEqual(left, right);
    }

    isUndefinableEqual(leftApi: DataIvemIdApi | undefined, rightApi: DataIvemIdApi | undefined): boolean {
        const left = leftApi === undefined ? undefined : DataIvemIdImplementation.fromApi(leftApi);
        const right = rightApi === undefined ? undefined : DataIvemIdImplementation.fromApi(rightApi);
        return DataIvemId.isUndefinableEqual(left, right);
    }

    compare(leftApi: DataIvemIdApi, rightApi: DataIvemIdApi): ComparisonResultApi {
        const left = DataIvemIdImplementation.fromApi(leftApi);
        const right = DataIvemIdImplementation.fromApi(rightApi);
        const result = DataIvemId.compare(left, right);
        return ComparisonResultImplementation.toApi(result);
    }

    tryCreateFromJson(markets: DataMarketListApi, element: JsonElementApi, unknownAllowed: boolean): ResultApi<DataIvemIdApi> {
        const actualMarkets = DataMarketListImplementation.fromApi<DataMarketApi, DataMarket>(markets);
        const actualElement = JsonElementImplementation.fromApi(element);
        const tryCreateResult = MarketIvemId.tryCreateFromJson(actualMarkets, actualElement, DataIvemId, unknownAllowed);
        if (tryCreateResult.isOk()) {
            const actualDataIvemId = tryCreateResult.value;
            const dataItemIdApi = DataIvemIdImplementation.toApi(actualDataIvemId);
            return new OkImplementation(dataItemIdApi);
        } else {
            return new ErrImplementation(tryCreateResult.error);
        }
    }
}
