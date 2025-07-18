import { Integer } from '../../sys';
import { SymbolField } from '../symbol-field-api';
// eslint-disable-next-line import-x/no-cycle
import { DataMarket } from './data-market-api';
// eslint-disable-next-line import-x/no-cycle
import { ExchangeEnvironment } from './exchange-environment-api';
// eslint-disable-next-line import-x/no-cycle
import { TradingMarket } from './trading-market-api';

/** @public */
export interface Exchange {
    readonly mapKey: string;
    readonly zenithCode: string,
    readonly unenvironmentedZenithCode: string,
    readonly exchangeEnvironment: ExchangeEnvironment,
    readonly unknown: boolean,
    readonly abbreviatedDisplay: string;
    readonly fullDisplay: string;
    readonly displayPriority: number | undefined;
    readonly allowedSymbolNameFieldIds: readonly SymbolField[];
    readonly defaultSymbolNameFieldId: SymbolField;
    readonly allowedSymbolSearchFieldIds: readonly SymbolField[];
    readonly defaultSymbolSearchFieldIds: readonly SymbolField[];

    readonly dataMarketCount: Integer;
    readonly dataMarkets: readonly DataMarket[];

    readonly tradingMarketCount: Integer;
    readonly tradingMarkets: readonly TradingMarket[];

    readonly isDefaultDefault: boolean;
    readonly exchangeEnvironmentIsDefault: boolean;
    readonly symbologyCode: string;
    readonly defaultLitMarket: DataMarket | undefined;
    readonly defaultTradingMarket: TradingMarket | undefined;

    // getMarkets(marketTypeId: Market.Type): Market[];
    // getDefaultMarket(marketTypeId: Market.Type): Market;

}
