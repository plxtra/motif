import { AfterViewInit, ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { DataMarket } from '@plxtra/motif-core';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
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

    constructor() {
        super(
            ++DataMarketSelectItemsNgComponent.typeInstanceCreateCount,
            ControlComponentBaseNgDirective.textControlStateColorItemIdArray,
        );

        this.inputId.set(`MarketSelectItems:${this.typeInstanceId}`);
    }
}
