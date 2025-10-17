import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
    Market,
    TradingIvemId,
    TradingMarket
} from '@plxtra/motif-core';
import { MarketIvemIdSelectNgDirective } from '../../ng/market-ivem-id-select-ng.directive';
import { NgSelectComponent, NgOptionTemplateDirective } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { SvgButtonNgComponent } from '../../../boolean/button/icon/svg-button/ng/svg-button-ng.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-trading-ivem-id-select',
    templateUrl: './trading-ivem-id-select-ng.component.html',
    styleUrls: ['./trading-ivem-id-select-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [NgSelectComponent, FormsModule, NgOptionTemplateDirective, SvgButtonNgComponent, AsyncPipe]
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
