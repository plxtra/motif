import { Integer, MarketBoard } from '../../../types';

/** @public */
export interface MarketBoardSvc {
    indexOfInArray(boards: readonly MarketBoard[], zenithCode: string): Integer;
    findInArray(boards: readonly MarketBoard[], zenithCode: string): MarketBoard | undefined
}
