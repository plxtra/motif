import { ComparisonResult, Exchange, IvemId } from '../../../types';

/** @public */
export interface IvemIdSvc {
    create(code: string, exchange: Exchange): IvemId;
    isEqual(left: IvemId, right: IvemId): boolean;
    isUndefinableEqual(left: IvemId | undefined, right: IvemId | undefined): boolean;
    compare(left: IvemId, right: IvemId): ComparisonResult;
}
