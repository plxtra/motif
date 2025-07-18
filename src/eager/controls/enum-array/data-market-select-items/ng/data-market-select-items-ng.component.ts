import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewEncapsulation } from '@angular/core';
import { DataMarket } from '@plxtra/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { NgSelectOverlayNgService } from '../../../ng/ng-select-overlay-ng.service';
import { SelectItemsNgDirective } from '../../ng/select-items-ng.directive';

@Component({
    selector: 'app-data-market-select-items',
    templateUrl: './data-market-select-items-ng.component.html',
    styleUrls: ['./data-market-select-items-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class DataMarketSelectItemsNgComponent extends SelectItemsNgDirective<DataMarket> implements AfterViewInit {
    private static typeInstanceCreateCount = 0;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        ngSelectOverlayNgService: NgSelectOverlayNgService,
        settingsNgService: SettingsNgService
    ) {
        super(
            elRef,
            ++DataMarketSelectItemsNgComponent.typeInstanceCreateCount,
            cdr,
            ngSelectOverlayNgService,
            settingsNgService.service,
            ControlComponentBaseNgDirective.textControlStateColorItemIdArray,
        );

        this.inputId.set(`MarketSelectItems:${this.typeInstanceId}`);
    }
}
