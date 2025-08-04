import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, createComponent, createEnvironmentInjector, EnvironmentInjector, ValueProvider, viewChild, ViewContainerRef, ViewRef, inject } from '@angular/core';
import { AssertInternalError, Line } from '@pbkware/js-utils';
import { MenuBarOverlayMenuNgComponent } from '../../menu-bar-overlay-menu/ng-api';
import { MenuBarService } from '../../menu-bar-service';
import { MenuBarNgService } from '../../ng/menu-bar-ng.service';

@Component({
    selector: 'app-menu-bar-overlay',
    templateUrl: './menu-bar-overlay-ng.component.html',
    styleUrls: ['./menu-bar-overlay-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class MenuBarOverlayNgComponent implements AfterViewInit {
    private readonly _cdr = inject(ChangeDetectorRef);
    private readonly _environmentInjector = inject(EnvironmentInjector);

    private readonly _menusContainerRefSignal = viewChild.required('menusContainer', { read: ViewContainerRef });

    private _menusContainerRef: ViewContainerRef;

    private readonly _menuBarService: MenuBarService;
    private readonly _activeMenus: MenuBarOverlayNgComponent.Menu[] = [];

    constructor() {
        const menuBarNgService = inject(MenuBarNgService);

        this._menuBarService = menuBarNgService.service;
        this._menuBarService.addOverlayChildMenuEvent = (menu, parentItemContactDocumentLine) =>
            this.handleAddOverlayChildMenuEvent(menu, parentItemContactDocumentLine);
        this._menuBarService.deleteOverlayChildMenuEvent = (menu) => this.handleDeleteOverlayChildMenuEvent(menu);
        this._menuBarService.clearOverlayChildMenusEvent = () => this.handleClearOverlayChildMenusEvent();
    }

    ngAfterViewInit(): void {
        this._menusContainerRef = this._menusContainerRefSignal();
    }

    private handleAddOverlayChildMenuEvent(childMenu: MenuBarService.ChildMenu, parentItemContactDocumentLine: Line) {
        const childMenuProvider: ValueProvider = {
            provide: MenuBarOverlayMenuNgComponent.ChildMenuInjectionToken,
            useValue: childMenu,
        };
        const parentItemContactDocumentLineProvider: ValueProvider = {
            provide: MenuBarOverlayMenuNgComponent.ParentItemContactDocumentLineInjectionToken,
            useValue: parentItemContactDocumentLine,
        };
        const newEnvironmentInjector = createEnvironmentInjector(
            [childMenuProvider, parentItemContactDocumentLineProvider],
            this._environmentInjector
        );
        const componentRef = createComponent(MenuBarOverlayMenuNgComponent, { environmentInjector: newEnvironmentInjector });
        const viewRef = componentRef.hostView;
        this._menusContainerRef.insert(viewRef);
        this._activeMenus.push({
            childMenu,
            viewRef,
        });
        this._cdr.markForCheck();
    }

    private handleDeleteOverlayChildMenuEvent(childMenu: MenuBarService.ChildMenu) {
        const activeMenuIdx = this._activeMenus.findIndex((activeMenu) => activeMenu.childMenu === childMenu);
        if (activeMenuIdx < 0) {
            throw new AssertInternalError('MBOCHDOCME877452');
        } else {
            const activeMenu = this._activeMenus[activeMenuIdx];
            const viewRefIdx = this._menusContainerRef.indexOf(activeMenu.viewRef);
            this._menusContainerRef.remove(viewRefIdx);
            this._activeMenus.splice(activeMenuIdx, 1);
            this._cdr.markForCheck();
        }
    }

    private handleClearOverlayChildMenusEvent() {
        this._menusContainerRef.clear();
        this._cdr.markForCheck();
    }
}

export namespace MenuBarOverlayNgComponent {
    export interface Menu {
        readonly childMenu: MenuBarService.ChildMenu;
        readonly viewRef: ViewRef;
    }
}
