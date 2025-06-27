import {
    DataMarket,
    DataMarketList,
    Exchange,
    ExchangeEnvironment,
    ExchangeEnvironmentList,
    ExchangeList,
    MarketBoard,
    MarketBoardList,
    TradingMarket,
    TradingMarketList
} from '../../../types';

/** @public */
export interface MarketsSvc {
    readonly exchangeEnvironments: ExchangeEnvironmentList;
    readonly exchanges: ExchangeList;
    readonly dataMarkets: DataMarketList;
    readonly tradingMarkets: TradingMarketList;
    readonly marketBoards: MarketBoardList;

    readonly defaultExchangeEnvironmentExchanges: ExchangeList;
    readonly defaultExchangeEnvironmentDataMarkets: DataMarketList;
    readonly defaultExchangeEnvironmentTradingMarkets: TradingMarketList;
    readonly defaultExchangeEnvironmentMarketBoards: MarketBoardList;

    readonly unknownExchangeEnvironments: ExchangeEnvironmentList;
    readonly unknownExchanges: ExchangeList;
    readonly unknownDataMarkets: DataMarketList;
    readonly unknownTradingMarkets: TradingMarketList;
    readonly unknownMarketBoards: MarketBoardList;

    readonly genericUnknownExchangeEnvironment: ExchangeEnvironment;
    readonly genericUnknownExchange: Exchange;
    readonly genericUnknownDataMarket: DataMarket;
    readonly genericUnknownTradingMarket: TradingMarket;
    readonly genericUnknownMarketBoard: MarketBoard;

    readonly defaultExchangeEnvironment: ExchangeEnvironment;
    readonly defaultDefaultExchange: Exchange;

    tryGetExchangeEnvironment(zenithCode: ExchangeEnvironment.ZenithCode, unknownAllowed?: boolean): ExchangeEnvironment | undefined;
    getExchangeEnvironmentOrUnknown(zenithCode: ExchangeEnvironment.ZenithCode): ExchangeEnvironment;

    tryGetExchange(zenithCode: string, unknownAllowed?: boolean): Exchange | undefined;
    getExchangeOrUnknown(zenithCode: string): Exchange;
    tryGetDefaultEnvironmentExchange(unenvironmentedZenithCode: string, unknownAllowed?: boolean): Exchange | undefined;
    getDefaultEnvironmentExchangeOrUnknown(unenvironmentedZenithCode: string): Exchange;

    getDataMarkets(zenithCodes: readonly string[], includeUnknown?: boolean): DataMarket[];
    tryGetDataMarket(zenithCode: string, unknownAllowed?: boolean): DataMarket | undefined;
    getDataMarketOrUnknown(zenithCode: string): DataMarket;
    tryGetDefaultEnvironmentDataMarket(unenvironmentedZenithCode: string, unknownAllowed?: boolean): DataMarket | undefined;
    getDefaultEnvironmentDataMarketOrUnknown(unenvironmentedZenithCode: string): DataMarket;

    getTradingMarkets(zenithCodes: readonly string[], includeUnknown?: boolean): TradingMarket[];
    tryGetTradingMarket(zenithCode: string, unknownAllowed?: boolean): TradingMarket | undefined;
    getTradingMarketOrUnknown(zenithCode: string): TradingMarket;
    tryGetDefaultEnvironmentTradingMarket(unenvironmentedZenithCode: string, unknownAllowed?: boolean): TradingMarket | undefined;
    getDefaultEnvironmentTradingMarketOrUnknown(unenvironmentedZenithCode: string): TradingMarket;

    /** Only specify market if boards are all from that market */
    getMarketBoards(zenithCodes: readonly string[], includeUnknown?: boolean, market?: DataMarket): MarketBoard[];
    tryGetMarketBoard(zenithCode: string, unknownAllowed?: boolean, market?: DataMarket): MarketBoard | undefined;
    getMarketBoardOrUnknown(zenithCode: string, market?: DataMarket): MarketBoard;
    tryGetDefaultEnvironmentMarketBoard(unenvironmentedZenithCode: string, unknownAllowed?: boolean): MarketBoard | undefined;
    getDefaultEnvironmentMarketBoardOrUnknown(unenvironmentedZenithCode: string): MarketBoard;
}
