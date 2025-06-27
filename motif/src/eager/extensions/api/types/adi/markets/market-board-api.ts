import { TradingState } from '../trading-state-api';
// eslint-disable-next-line import-x/no-cycle
import { DataMarket } from './data-market-api';

/** @public */
export interface MarketBoard {
    readonly zenithCode: string,
    readonly name: string,
    readonly display: string,
    readonly market: DataMarket,
    readonly unenvironmentedZenithCode: string;
    readonly unknown: boolean;
    readonly feedInitialising: boolean;
    readonly status: string | undefined;
    readonly allows: TradingState.Allows | undefined;
    readonly reason: TradingState.Reason | undefined;
}
