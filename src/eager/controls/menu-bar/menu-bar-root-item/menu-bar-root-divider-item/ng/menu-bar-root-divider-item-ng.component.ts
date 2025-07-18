import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef } from '@angular/core';
import { MenuBarNgService } from '../../../ng/menu-bar-ng.service';
import { MenuBarRenderItemComponentNgDirective } from '../../../ng/menu-bar-render-item-component-ng.directive';

@Component({
    selector: 'app-menu-bar-root-divider-item',
    templateUrl: './menu-bar-root-divider-item-ng.component.html',
    styleUrls: ['./menu-bar-root-divider-item-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class MenuBarRootDividerItemNgComponent extends MenuBarRenderItemComponentNgDirective {
    private static typeInstanceCreateCount = 0;

    constructor(elRef: ElementRef<HTMLElement>, cdr: ChangeDetectorRef, menuBarNgService: MenuBarNgService) {
        super(elRef, ++MenuBarRootDividerItemNgComponent.typeInstanceCreateCount, cdr, menuBarNgService);
    }
}
