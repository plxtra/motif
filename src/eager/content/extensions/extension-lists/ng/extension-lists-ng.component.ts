import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';
import { InstalledExtensionListNgComponent } from '../../installed-extension-list/ng/installed-extension-list-ng.component';
import { AvailableExtensionListNgComponent } from '../../available-extension-list/ng/available-extension-list-ng.component';

@Component({
    selector: 'app-extension-lists',
    templateUrl: './extension-lists-ng.component.html',
    styleUrls: ['./extension-lists-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [InstalledExtensionListNgComponent, AvailableExtensionListNgComponent]
})
export class ExtensionListsNgComponent extends ContentComponentBaseNgDirective {
    private static typeInstanceCreateCount = 0;

    constructor() {
        super(++ExtensionListsNgComponent.typeInstanceCreateCount);
    }
}
