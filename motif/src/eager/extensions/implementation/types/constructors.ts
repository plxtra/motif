import { DataMarket, Exchange, TradingMarket } from '@plxtra/motif-core';
import { DataMarket as DataMarketApi, Exchange as ExchangeApi, TradingMarket as TradingMarketApi } from '../../api';

export type ExchangeApiConstructor = new(exchange: Exchange) => ExchangeApi;

export type DataMarketApiConstructor = new(
    actual: DataMarket,
    exchangeApiConstructor: ExchangeApiConstructor,
    tradingMarketApiConstructor: TradingMarketApiConstructor,
) => DataMarketApi;

export type TradingMarketApiConstructor = new(
    actual: TradingMarket,
    exchangeApiConstructor: ExchangeApiConstructor,
    dataMarketApiConstructor: DataMarketApiConstructor,
) => TradingMarketApi;

