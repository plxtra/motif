import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    ViewEncapsulation
} from '@angular/core';
import {
    DataIvemId,
    DataMarket,
    Market
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
    selector: 'app-data-ivem-id-select',
    templateUrl: './data-ivem-id-select-ng.component.html',
    styleUrls: ['./data-ivem-id-select-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class DataIvemIdSelectNgComponent extends MarketIvemIdSelectNgDirective<DataMarket> {
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
            ++DataIvemIdSelectNgComponent.typeInstanceCreateCount,
            cdr,
            decimalFactoryNgService.service,
            commandRegisterNgService.service,
            ngSelectOverlayNgService,
            settingsNgService.service,
            marketsNgService.service,
            adiNgService.service,
            symbolsService,
            symbolDetailCacheNgService.service,
            Market.TypeId.Data,
            DataIvemId,
            (dataMarket) => [dataMarket],
        );
    }
}
