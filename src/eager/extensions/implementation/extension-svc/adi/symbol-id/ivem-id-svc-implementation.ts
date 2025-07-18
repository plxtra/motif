import { IvemId } from '@plxtra/motif-core';
import {
    ComparisonResult as ComparisonResultApi,
    Exchange as ExchangeApi,
    IvemId as IvemIdApi,
    IvemIdSvc
} from '../../../../api';
import {
    ComparisonResultImplementation,
    ExchangeImplementation,
    IvemIdImplementation
} from '../../../types/internal-api';

export class IvemIdSvcImplementation implements IvemIdSvc {
    create(code: string, exchange: ExchangeApi): IvemIdApi {
        const actualExchange = ExchangeImplementation.fromApi(exchange);
        const ivemId = new IvemId(code, actualExchange);
        return IvemIdImplementation.toApi(ivemId);
    }

    isEqual(leftApi: IvemIdApi, rightApi: IvemIdApi): boolean {
        const left = IvemIdImplementation.fromApi(leftApi);
        const right = IvemIdImplementation.fromApi(rightApi);
        return IvemId.isEqual(left, right);
    }

    isUndefinableEqual(leftApi: IvemIdApi | undefined, rightApi: IvemIdApi | undefined): boolean {
        const left = leftApi === undefined ? undefined : IvemIdImplementation.fromApi(leftApi);
        const right = rightApi === undefined ? undefined : IvemIdImplementation.fromApi(rightApi);
        return IvemId.isUndefinableEqual(left, right);
    }

    compare(leftApi: IvemIdApi, rightApi: IvemIdApi): ComparisonResultApi {
        const left = IvemIdImplementation.fromApi(leftApi);
        const right = IvemIdImplementation.fromApi(rightApi);
        const result = IvemId.compare(left, right);
        return ComparisonResultImplementation.toApi(result);
    }
}
