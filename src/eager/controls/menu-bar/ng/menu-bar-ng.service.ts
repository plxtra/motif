import { Injectable, inject } from '@angular/core';
import { CommandRegisterNgService, KeyboardNgService } from 'component-services-ng-api';
import { MenuBarService } from '../menu-bar-service';

@Injectable({
    providedIn: 'root'
})
export class MenuBarNgService {
    private _service: MenuBarService;

    constructor() {
        const commandRegisterNgService = inject(CommandRegisterNgService);
        const keyboardNgService = inject(KeyboardNgService);

        this._service = new MenuBarService(commandRegisterNgService.service, keyboardNgService.service);
    }

    get service() { return this._service; }
}
