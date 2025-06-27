import { Integer } from '../../sys';
// eslint-disable-next-line import-x/no-cycle
import { DataMarket } from './data-market-api';
// eslint-disable-next-line import-x/no-cycle
import { Exchange } from './exchange-api';
import { TradingMarket } from './trading-market-api';

/** @public */
export interface ExchangeEnvironment {
    readonly mapKey: string;
    readonly display: string;
    readonly production: boolean;
    readonly zenithCode: ExchangeEnvironment.ZenithCode,
    readonly unknown: boolean,

    readonly exchangeCount: Integer;
    readonly exchanges: readonly Exchange[];

    readonly dataMarketCount: Integer;
    readonly dataMarkets: readonly DataMarket[];

    readonly tradingMarketCount: Integer;
    readonly tradingMarkets: readonly TradingMarket[];
}

/** @public */
export namespace ExchangeEnvironment {
    export type ZenithCode = string | null
}
