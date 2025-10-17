import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-extensions-search',
    templateUrl: './extensions-search-ng.component.html',
    styleUrls: ['./extensions-search-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExtensionsSearchNgComponent extends ContentComponentBaseNgDirective {
    private static typeInstanceCreateCount = 0;

    constructor() {
        super(++ExtensionsSearchNgComponent.typeInstanceCreateCount);
    }
}
