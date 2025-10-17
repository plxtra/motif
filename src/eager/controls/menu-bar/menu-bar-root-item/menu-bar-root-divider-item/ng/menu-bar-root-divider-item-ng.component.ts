import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MenuBarRenderItemComponentNgDirective } from '../../../ng/menu-bar-render-item-component-ng.directive';

@Component({
    selector: 'app-menu-bar-root-divider-item',
    templateUrl: './menu-bar-root-divider-item-ng.component.html',
    styleUrls: ['./menu-bar-root-divider-item-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuBarRootDividerItemNgComponent extends MenuBarRenderItemComponentNgDirective {
    private static typeInstanceCreateCount = 0;

    constructor() {
        super(++MenuBarRootDividerItemNgComponent.typeInstanceCreateCount);
    }
}
