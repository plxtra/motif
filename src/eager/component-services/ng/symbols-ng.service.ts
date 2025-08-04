import { Injectable, inject } from '@angular/core';
import { DataIvemId, DataMarket, SymbolsService, TradingIvemId, TradingMarket } from '@plxtra/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root'
})
export class SymbolsNgService {
    private _service: SymbolsService;

    constructor() {
        const coreNgService = inject(CoreNgService);

        this._service = coreNgService.symbolsService;
    }

    get service() { return this._service; }

    dataIvemIdToDisplay(dataIvemId: DataIvemId): string {
        return this._service.dataIvemIdToDisplay(dataIvemId);
    }

    parseDataIvemId(value: string): SymbolsService.MarketIvemIdParseDetails<DataMarket> {
        return this._service.parseDataIvemId(value);
    }

    tradingIvemIdToDisplay(tradingIvemId: TradingIvemId): string {
        return this._service.tradingIvemIdToDisplay(tradingIvemId);
    }

    parseTradingIvemId(value: string): SymbolsService.MarketIvemIdParseDetails<TradingMarket> {
        return this._service.parseTradingIvemId(value);
    }
}
