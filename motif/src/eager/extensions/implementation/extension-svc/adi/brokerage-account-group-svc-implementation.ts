import { BrokerageAccountGroup, MarketsService } from '@plxtra/motif-core';
import {
    AllBrokerageAccountGroup as AllBrokerageAccountGroupApi,
    BrokerageAccountGroup as BrokerageAccountGroupApi,
    BrokerageAccountGroupSvc,
    SingleBrokerageAccountGroup as SingleBrokerageAccountGroupApi
} from '../../../api';
import {
    AllBrokerageAccountGroupImplementation,
    BrokerageAccountGroupImplementation,
    ComparisonResultImplementation,
    SingleBrokerageAccountGroupImplementation
} from '../../types/internal-api';
import { SvcImplementation } from '../svc-implementation';

export class BrokerageAccountGroupSvcImplementation extends SvcImplementation implements BrokerageAccountGroupSvc {
    constructor(private readonly _marketsService: MarketsService) {
        super();
    }

    destroy() {
        // No resources to clean up
    }

    createAll(): AllBrokerageAccountGroupApi {
        const group = BrokerageAccountGroup.createAll();
        return new AllBrokerageAccountGroupImplementation(group);
    }

    createSingle(accountZenithCode: string) {
        const group = BrokerageAccountGroup.createSingle(this._marketsService, accountZenithCode);
        return new SingleBrokerageAccountGroupImplementation(group);
    }

    isSingle(groupApi: BrokerageAccountGroupApi): groupApi is SingleBrokerageAccountGroupApi {
        const actualGroup = BrokerageAccountGroupImplementation.fromApi(groupApi);
        return actualGroup.isSingle();
    }

    isEqual(left: BrokerageAccountGroupApi, right: BrokerageAccountGroupApi) {
        const actualLeft = BrokerageAccountGroupImplementation.fromApi(left);
        const actualRight = BrokerageAccountGroupImplementation.fromApi(right);
        return BrokerageAccountGroup.isEqual(actualLeft, actualRight);
    }

    isUndefinableEqual(left: BrokerageAccountGroupApi | undefined, right: BrokerageAccountGroupApi | undefined) {
        const actualLeft = left === undefined ? undefined : BrokerageAccountGroupImplementation.fromApi(left);
        const actualRight = right === undefined ? undefined : BrokerageAccountGroupImplementation.fromApi(right);
        return BrokerageAccountGroup.isUndefinableEqual(actualLeft, actualRight);
    }

    compare(left: BrokerageAccountGroupApi, right: BrokerageAccountGroupApi) {
        const actualLeft = BrokerageAccountGroupImplementation.fromApi(left);
        const actualRight = BrokerageAccountGroupImplementation.fromApi(right);
        const comparisonResult = BrokerageAccountGroup.compare(actualLeft, actualRight);
        return ComparisonResultImplementation.toApi(comparisonResult);
    }

    compareUndefinable(left: BrokerageAccountGroupApi | undefined, right: BrokerageAccountGroupApi | undefined) {
        const actualLeft = left === undefined ? undefined : BrokerageAccountGroupImplementation.fromApi(left);
        const actualRight = right === undefined ? undefined : BrokerageAccountGroupImplementation.fromApi(right);
        const comparisonResult = BrokerageAccountGroup.compareUndefinable(actualLeft, actualRight);
        return ComparisonResultImplementation.toApi(comparisonResult);
    }
}
