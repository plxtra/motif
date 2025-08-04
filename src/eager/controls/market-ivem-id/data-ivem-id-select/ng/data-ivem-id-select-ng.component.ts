import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
    DataIvemId,
    DataMarket,
    Market
} from '@plxtra/motif-core';
import { MarketIvemIdSelectNgDirective } from '../../ng/market-ivem-id-select-ng.directive';

@Component({
    selector: 'app-data-ivem-id-select',
    templateUrl: './data-ivem-id-select-ng.component.html',
    styleUrls: ['./data-ivem-id-select-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class DataIvemIdSelectNgComponent extends MarketIvemIdSelectNgDirective<DataMarket> {
    private static typeInstanceCreateCount = 0;

    constructor() {
        super(
            ++DataIvemIdSelectNgComponent.typeInstanceCreateCount,
            Market.TypeId.Data,
            DataIvemId,
            (dataMarket) => [dataMarket],
        );
    }
}
