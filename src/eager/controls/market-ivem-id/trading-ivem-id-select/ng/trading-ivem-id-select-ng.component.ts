import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    ViewEncapsulation
} from '@angular/core';
import {
    Market,
    TradingIvemId,
    TradingMarket
} from '@plxtra/motif-core';
import {
    AdiNgService,
    CommandRegisterNgService,
    DecimalFactoryNgService,
    MarketsNgService,
    SettingsNgService,
    SymbolDetailCacheNgService,
    SymbolsNgService
} from 'component-services-ng-api';
import { NgSelectOverlayNgService } from '../../../ng/ng-select-overlay-ng.service';
import { MarketIvemIdSelectNgDirective } from '../../ng/market-ivem-id-select-ng.directive';

@Component({
    selector: 'app-trading-ivem-id-select',
    templateUrl: './trading-ivem-id-select-ng.component.html',
    styleUrls: ['./trading-ivem-id-select-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class TradingIvemIdSelectNgComponent extends MarketIvemIdSelectNgDirective<TradingMarket> {
    private static typeInstanceCreateCount = 0;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        decimalFactoryNgService: DecimalFactoryNgService,
        commandRegisterNgService: CommandRegisterNgService,
        ngSelectOverlayNgService: NgSelectOverlayNgService,
        settingsNgService: SettingsNgService,
        marketsNgService: MarketsNgService,
        adiNgService: AdiNgService,
        symbolsNgService: SymbolsNgService,
        symbolDetailCacheNgService: SymbolDetailCacheNgService,
    ) {
        const symbolsService = symbolsNgService.service;

        super(
            elRef,
            ++TradingIvemIdSelectNgComponent.typeInstanceCreateCount,
            cdr,
            decimalFactoryNgService.service,
            commandRegisterNgService.service,
            ngSelectOverlayNgService,
            settingsNgService.service,
            marketsNgService.service,
            adiNgService.service,
            symbolsService,
            symbolDetailCacheNgService.service,
            Market.TypeId.Trading,
            TradingIvemId,
            (_dataMarket, tradingMarkets) => tradingMarkets,
        );
    }
}
