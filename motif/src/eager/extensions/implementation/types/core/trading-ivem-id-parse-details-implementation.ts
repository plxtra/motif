import { SymbolsService, TradingMarket } from '@plxtra/motif-core';
import { MarketIvemIdParseDetails as MarketIvemIdParseDetailsApi, TradingMarket as TradingMarketApi } from '../../../api';
import { TradingIvemIdImplementation } from '../adi/internal-api';

export namespace TradingIvemIdParseDetailsImplementation {
    export function toApi(details: SymbolsService.MarketIvemIdParseDetails<TradingMarket>): MarketIvemIdParseDetailsApi<TradingMarketApi> {
        const marketIvemId = details.marketIvemId;
        return {
            marketIvemId: TradingIvemIdImplementation.toApi(marketIvemId),
            exchangeValidAndExplicit: details.exchangeValidAndExplicit,
            marketValidAndExplicit: details.marketValidAndExplicit,
            errorText: details.errorText,
            parseText: details.value,
        };
    }
}
