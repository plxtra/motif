import { ChangeDetectionStrategy, Component, OnDestroy, inject } from '@angular/core';
import { MenuBarService } from '../../menu-bar-service';
import { MenuBarMenuComponentNgDirective } from '../../ng/menu-bar-menu-component-ng.directive';
import { MenuBarNgService } from '../../ng/menu-bar-ng.service';

@Component({
    selector: 'app-menu-bar-root-menu',
    templateUrl: './menu-bar-root-menu-ng.component.html',
    styleUrls: ['./menu-bar-root-menu-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class MenuBarRootMenuNgComponent extends MenuBarMenuComponentNgDirective implements OnDestroy {
    private readonly _menu: MenuBarService.RootMenu;

    constructor() {
        super(0);

        const menuBarNgService = inject(MenuBarNgService);

        this._menu = menuBarNgService.service.rootMenu;
        this._menu.renderEvent = (childMenu) => this.renderMenu(childMenu);
        this._menu.getIsMouseOverEvent = (mouseClientX, mouseClientY) => this.handleGetIsMouseOverEvent(mouseClientX, mouseClientY);
    }

    protected get menu() { return this._menu; }

    ngOnDestroy() {
        this.menu.renderEvent = undefined;
        this.menu.getIsMouseOverEvent = undefined;
    }

    private handleGetIsMouseOverEvent(mouseClientX: number, mouseClientY: number) {
        const domRect = this.rootHtmlElement.getBoundingClientRect();
        return mouseClientX >= domRect.left &&
            mouseClientX < domRect.right &&
            mouseClientY >= domRect.top &&
            mouseClientY < domRect.bottom;
    }
}
