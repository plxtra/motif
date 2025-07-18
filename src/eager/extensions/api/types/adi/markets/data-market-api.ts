import { SourceTzOffsetDate, SourceTzOffsetDateTime } from '../../sys';
import { Correctness } from '../../sys/correctness-api';
import { FeedStatus } from '../feed-status-api';
import { TradingState } from '../trading-state-api';
// eslint-disable-next-line import-x/no-cycle
import { Market } from './market-api';
// eslint-disable-next-line import-x/no-cycle
import { MarketBoard } from './market-board-api';
// eslint-disable-next-line import-x/no-cycle
import { TradingMarket } from './trading-market-api';

/** @public */
export interface DataMarket extends Market {
    readonly marketBoards: MarketBoard[];

    readonly feedStatus: FeedStatus;
    readonly tradingDate: SourceTzOffsetDate | undefined;
    readonly marketTime: SourceTzOffsetDateTime | undefined;
    readonly status: string | undefined;
    readonly tradingStateAllows: TradingState.Allows | undefined;
    readonly tradingStateReason: TradingState.Reason | undefined;
    readonly usable: boolean;
    readonly correctness: Correctness;
    readonly tradingStates: TradingState[];
    readonly bestTradingMarket: TradingMarket | undefined;
    readonly bestLitForTradingMarkets: TradingMarket[];
}
