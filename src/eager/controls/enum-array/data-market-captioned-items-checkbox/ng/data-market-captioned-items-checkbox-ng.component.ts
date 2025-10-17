import { ChangeDetectionStrategy, Component, OnDestroy, inject } from '@angular/core';
import { DataMarket } from '@plxtra/motif-core';
import { MarketsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { CaptionedItemsCheckboxNgDirective } from '../../ng/captioned-items-checkbox-ng.directive';
import { NgStyle } from '@angular/common';

@Component({
    selector: 'app-data-market-captioned-items-checkbox',
    templateUrl: './data-market-captioned-items-checkbox-ng.component.html',
    styleUrls: ['./data-market-captioned-items-checkbox-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgStyle]
})
export class DataMarketCaptionedItemsCheckboxNgComponent extends CaptionedItemsCheckboxNgDirective<DataMarket> implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    constructor() {
        const marketsNgService = inject(MarketsNgService);

        super(
            ++DataMarketCaptionedItemsCheckboxNgComponent.typeInstanceCreateCount,
            ControlComponentBaseNgDirective.clickControlStateColorItemIdArray,
            marketsNgService.service.genericUnknownDataMarket,
        );
        this.inputId.set(`MarketCaptionedItemsCheckbox:${this.typeInstanceId}`);
    }
}
