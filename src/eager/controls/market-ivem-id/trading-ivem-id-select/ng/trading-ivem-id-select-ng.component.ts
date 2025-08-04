import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
    Market,
    TradingIvemId,
    TradingMarket
} from '@plxtra/motif-core';
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

    constructor() {
        super(
            ++TradingIvemIdSelectNgComponent.typeInstanceCreateCount,
            Market.TypeId.Trading,
            TradingIvemId,
            (_dataMarket, tradingMarkets) => tradingMarkets,
        );
    }
}
