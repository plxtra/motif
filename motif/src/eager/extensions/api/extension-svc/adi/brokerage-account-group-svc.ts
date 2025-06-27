import {
    AllBrokerageAccountGroup,
    BrokerageAccountGroup,
    ComparisonResult,
    SingleBrokerageAccountGroup
} from '../../types';

/** @public */
export interface BrokerageAccountGroupSvc {
    createAll(): AllBrokerageAccountGroup;
    createSingle(accountZenithCode: string): SingleBrokerageAccountGroup;

    isSingle(group: BrokerageAccountGroup): group is SingleBrokerageAccountGroup;

    isEqual(left: BrokerageAccountGroup, right: BrokerageAccountGroup): boolean;
    isUndefinableEqual(left: BrokerageAccountGroup | undefined, right: BrokerageAccountGroup | undefined): boolean;

    compare(left: BrokerageAccountGroup, right: BrokerageAccountGroup): ComparisonResult;
    compareUndefinable(left: BrokerageAccountGroup | undefined, right: BrokerageAccountGroup | undefined): ComparisonResult;
}
