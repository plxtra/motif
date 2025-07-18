import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef
} from '@angular/core';
import { DataIvemId, DataMarket, Market } from '@plxtra/motif-core';
import { MarketsNgService, SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import { MarketIvemIdInputNgComponent } from '../../ng/market-ivem-id-input-ng.directive';

@Component({
    selector: 'app-data-ivem-id-input',
    templateUrl: './data-ivem-id-input-ng.component.html',
    styleUrls: ['./data-ivem-id-input-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DataIvemIdInputNgComponent extends MarketIvemIdInputNgComponent<DataMarket> {
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
            ++DataIvemIdInputNgComponent.typeInstanceCreateCount,
            cdr,
            settingsNgService.service,
            marketsNgService.service,
            symbolsNgService.service,
            Market.TypeId.Data,
            DataIvemId,
        );
        this.inputId.set(`DataIvemIdInput:${this.typeInstanceId}`);
    }
}

export namespace DataIvemIdInputNgComponent {
    export const emptySymbol = '';
}
