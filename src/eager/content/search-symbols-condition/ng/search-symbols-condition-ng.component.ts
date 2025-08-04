import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-search-symbols-condition-ng',
    templateUrl: './search-symbols-condition-ng.component.html',
    styleUrls: ['./search-symbols-condition-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SearchSymbolsConditionNgComponent extends ContentComponentBaseNgDirective {
    private static typeInstanceCreateCount = 0;

    constructor() {
        super(++SearchSymbolsConditionNgComponent.typeInstanceCreateCount);
    }
}
