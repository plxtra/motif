import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DataIvemId, DataMarket, Market } from '@plxtra/motif-core';
import { MarketIvemIdInputNgComponent } from '../../ng/market-ivem-id-input-ng.directive';
import { NgStyle } from '@angular/common';

@Component({
    selector: 'app-data-ivem-id-input',
    templateUrl: './data-ivem-id-input-ng.component.html',
    styleUrls: ['./data-ivem-id-input-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgStyle]
})
export class DataIvemIdInputNgComponent extends MarketIvemIdInputNgComponent<DataMarket> {
    private static typeInstanceCreateCount = 0;

    constructor() {
        super(
            ++DataIvemIdInputNgComponent.typeInstanceCreateCount,
            Market.TypeId.Data,
            DataIvemId,
        );
        this.inputId.set(`DataIvemIdInput:${this.typeInstanceId}`);
    }
}

export namespace DataIvemIdInputNgComponent {
    export const emptySymbol = '';
}
