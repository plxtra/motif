import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef
} from '@angular/core';
import { Market, TradingIvemId, TradingMarket } from '@plxtra/motif-core';
import { MarketsNgService, SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import { MarketIvemIdInputNgComponent } from '../../ng/market-ivem-id-input-ng.directive';

@Component({
    selector: 'app-trading-ivem-id-input',
    templateUrl: './trading-ivem-id-input-ng.component.html',
    styleUrls: ['./trading-ivem-id-input-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class TradingIvemIdInputNgComponent extends MarketIvemIdInputNgComponent<TradingMarket> {
    private static typeInstanceCreateCount = 0;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        marketsNgService: MarketsNgService,
        symbolsNgService: SymbolsNgService
    ) {
        super(
            elRef,
            ++TradingIvemIdInputNgComponent.typeInstanceCreateCount,
            cdr,
            settingsNgService.service,
            marketsNgService.service,
            symbolsNgService.service,
            Market.TypeId.Trading,
            TradingIvemId,
        );
        this.inputId.set(`TradingIvemIdInput:${this.typeInstanceId}`);
    }
}

export namespace TradingIvemIdInputNgComponent {
    export const emptySymbol = '';
}
