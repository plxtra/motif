import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
    DataIvemId,
    DataMarket,
    Market
} from '@plxtra/motif-core';
import { MarketIvemIdSelectNgDirective } from '../../ng/market-ivem-id-select-ng.directive';
import { NgSelectComponent, NgOptionTemplateDirective } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { SvgButtonNgComponent } from '../../../boolean/button/icon/svg-button/ng/svg-button-ng.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-data-ivem-id-select',
    templateUrl: './data-ivem-id-select-ng.component.html',
    styleUrls: ['./data-ivem-id-select-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [NgSelectComponent, FormsModule, NgOptionTemplateDirective, SvgButtonNgComponent, AsyncPipe]
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
