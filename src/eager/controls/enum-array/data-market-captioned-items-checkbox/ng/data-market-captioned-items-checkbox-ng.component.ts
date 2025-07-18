import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy } from '@angular/core';
import { DataMarket } from '@plxtra/motif-core';
import { MarketsNgService, SettingsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { CaptionedItemsCheckboxNgDirective } from '../../ng/captioned-items-checkbox-ng.directive';

@Component({
    selector: 'app-data-market-captioned-items-checkbox',
    templateUrl: './data-market-captioned-items-checkbox-ng.component.html',
    styleUrls: ['./data-market-captioned-items-checkbox-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DataMarketCaptionedItemsCheckboxNgComponent extends CaptionedItemsCheckboxNgDirective<DataMarket> implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        marketsNgService: MarketsNgService,
    ) {
        super(
            elRef,
            ++DataMarketCaptionedItemsCheckboxNgComponent.typeInstanceCreateCount,
            cdr,
            settingsNgService.service,
            ControlComponentBaseNgDirective.clickControlStateColorItemIdArray,
            marketsNgService.service.genericUnknownDataMarket,
        );
        this.inputId.set(`MarketCaptionedItemsCheckbox:${this.typeInstanceId}`);
    }
}
