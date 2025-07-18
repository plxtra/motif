import { ComparisonResult } from '../sys';

/** @public */
export interface BrokerageAccountGroup {
    readonly type: BrokerageAccountGroup.Type;
    readonly display: string;
    readonly upperDisplay: string;

    isSingle(): boolean;
    isAll(): boolean;

    isEqualTo(other: BrokerageAccountGroup): boolean;
    compareTo(other: BrokerageAccountGroup): ComparisonResult;
}

/** @public */
export namespace BrokerageAccountGroup {
    export const enum TypeEnum {
        Single = 'Single',
        All = 'All',
    }

    export type Type = keyof typeof TypeEnum;
}

/** @public */
export interface SingleBrokerageAccountGroup extends BrokerageAccountGroup {
    readonly accountZenithCode: string;
}

/** @public */
export interface AllBrokerageAccountGroup extends BrokerageAccountGroup {
}
