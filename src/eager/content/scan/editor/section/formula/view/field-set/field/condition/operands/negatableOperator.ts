import { RootAndNodeComponentInstanceIdPair } from 'component-internal-api';

export interface NegatableOperator {
    readonly not: boolean;
    negateOperator(modifier: RootAndNodeComponentInstanceIdPair): boolean;
}
