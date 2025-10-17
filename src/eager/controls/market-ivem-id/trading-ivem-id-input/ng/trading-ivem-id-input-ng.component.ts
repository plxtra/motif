import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Market, TradingIvemId, TradingMarket } from '@plxtra/motif-core';
import { MarketIvemIdInputNgComponent } from '../../ng/market-ivem-id-input-ng.directive';
import { NgStyle } from '@angular/common';

@Component({
    selector: 'app-trading-ivem-id-input',
    templateUrl: './trading-ivem-id-input-ng.component.html',
    styleUrls: ['./trading-ivem-id-input-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgStyle]
})
export class TradingIvemIdInputNgComponent extends MarketIvemIdInputNgComponent<TradingMarket> {
    private static typeInstanceCreateCount = 0;

    constructor() {
        super(
            ++TradingIvemIdInputNgComponent.typeInstanceCreateCount,
            Market.TypeId.Trading,
            TradingIvemId,
        );
        this.inputId.set(`TradingIvemIdInput:${this.typeInstanceId}`);
    }
}

export namespace TradingIvemIdInputNgComponent {
    export const emptySymbol = '';
}
