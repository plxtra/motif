import { ChangeDetectorRef, Directive, inject } from '@angular/core';
import { Integer } from '@pbkware/js-utils';
import { ComponentBaseNgDirective } from 'component-ng-api';
import { MenuBarService } from '../menu-bar-service';
import { MenuBarNgService } from './menu-bar-ng.service';

@Directive()
export abstract class MenuBarComponentNgDirective extends ComponentBaseNgDirective {
    protected readonly menuBarService: MenuBarService;

    private readonly _cdr = inject(ChangeDetectorRef);

    constructor(typeInstanceCreateId: Integer) {
        super(typeInstanceCreateId);

        const menuBarNgService = inject(MenuBarNgService);
        this.menuBarService = menuBarNgService.service;
    }

    protected markForCheck() {
        this._cdr.markForCheck();
    }
}
