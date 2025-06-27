import { DataMarket, SymbolsService } from '@plxtra/motif-core';
import { DataMarket as DataMarketApi, MarketIvemIdParseDetails as MarketIvemIdParseDetailsApi } from '../../../api';
import { DataIvemIdImplementation } from '../adi/internal-api';

export namespace DataIvemIdParseDetailsImplementation {
    export function toApi(details: SymbolsService.MarketIvemIdParseDetails<DataMarket>): MarketIvemIdParseDetailsApi<DataMarketApi> {
        const marketIvemId = details.marketIvemId;
        return {
            marketIvemId: DataIvemIdImplementation.toApi(marketIvemId),
            exchangeValidAndExplicit: details.exchangeValidAndExplicit,
            marketValidAndExplicit: details.marketValidAndExplicit,
            errorText: details.errorText,
            parseText: details.value,
        };
    }
}
