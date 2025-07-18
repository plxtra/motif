import { DataIvemId, DataMarket, Exchange, IvemId, Market, MarketIvemId, TradingIvemId, TradingMarket } from '../types';

/** @public */
export interface SymbolSvc {
    defaultExchange: Exchange;
    exchangeAnnouncerChar: string;
    marketSeparatorChar: string;
    exchangeHideMode: SymbolSvc.ExchangeHideMode;
    defaultMarketHidden: boolean;
    marketCodeAsLocalWheneverPossible: boolean;
    zenithSymbologySupportLevel: SymbolSvc.ZenithSymbologySupportLevel;

    parseDataIvemId(value: string): SymbolSvc.DataIvemIdParseDetails;
    parseTradingIvemId(value: string): SymbolSvc.TradingIvemIdParseDetails;
    parseIvemId(value: string): SymbolSvc.IvemIdParseDetails;

    marketIvemIdToDisplay<T extends Market>(marketIvemId: MarketIvemId<T> | undefined): string;
    dataIvemIdToDisplay(dataIvemId: DataIvemId | undefined): string;
    tradingIvemIdToDisplay(tradingIvemId: TradingIvemId | undefined): string;
    tradingIvemIdToNothingHiddenDisplay(routedIvemId: TradingIvemId): string;
    ivemIdToDisplay(ivemId: IvemId | undefined): string;

    tryGetDefaultDataIvemIdFromIvemId(ivemId: IvemId): DataIvemId | undefined;
    tryGetDefaultTradingIvemIdFromIvemId(ivemId: IvemId): TradingIvemId | undefined;
    tryGetBestDataIvemIdFromTradingIvemId(tradingIvemId: TradingIvemId): DataIvemId | undefined;
    tryGetBestTradingIvemIdFromDataIvemId(dataIvemId: DataIvemId): TradingIvemId | undefined;
}

/** @public */
export namespace SymbolSvc {
    export const enum ExchangeHideModeEnum {
        Never = 'Never',
        Default = 'Default',
        WheneverPossible = 'WheneverPossible',
    }
    export type ExchangeHideMode = keyof typeof ExchangeHideModeEnum;

    export const enum ZenithSymbologySupportLevelEnum {
        None = 'None',
        Parse = 'Parse',
        ParseAndDisplay = 'ParseAndDisplay',
    }
    export type ZenithSymbologySupportLevel = keyof typeof ZenithSymbologySupportLevelEnum;

    export type AllowedMarketIdsChangedEventHandler = (this: void) => void;
    export type AllowedExchangeIdsChangedEventHandler = (this: void) => void;

    export interface MarketIvemIdParseDetails<T extends Market> {
        errorText: string | undefined;
        marketIvemId: MarketIvemId<T> | undefined;
        isZenith: boolean;
        exchangeValidAndExplicit: boolean;
        marketValidAndExplicit: boolean;
        value: string;
    }

    export type DataIvemIdParseDetails = MarketIvemIdParseDetails<DataMarket>;
    export type TradingIvemIdParseDetails = MarketIvemIdParseDetails<TradingMarket>;

    export interface IvemIdParseDetails {
        errorText: string | undefined;
        ivemId: IvemId;
        isZenith: boolean;
        exchangeValidAndExplicit: boolean;
        value: string;
    }
}
