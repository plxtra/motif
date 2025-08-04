import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-cash-holdings',
    templateUrl: './cash-holdings-ng.component.html',
    styleUrls: ['./cash-holdings-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class CashHoldingsNgComponent extends ContentComponentBaseNgDirective {
    private static typeInstanceCreateCount = 0;

    constructor() {
        super(++CashHoldingsNgComponent.typeInstanceCreateCount);
    }
}
