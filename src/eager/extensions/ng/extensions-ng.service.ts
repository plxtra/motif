import { Injectable, OnDestroy, inject } from '@angular/core';
import {
    AdiNgService,
    AppStorageNgService,
    CommandRegisterNgService,
    DecimalFactoryNgService,
    MarketsNgService,
    SettingsNgService,
    SymbolsNgService
} from 'component-services-ng-api';
import { ExtensionsAccessNgService } from 'content-ng-api';
import { MenuBarNgService } from 'controls-ng-api';
import { WorkspaceNgService } from 'workspace-ng-api';
import { ExtensionsService } from '../extensions-service';
import { ApiContentComponentFactoryNgService } from './api-content-component-factory-ng.service';
import { ApiControlComponentFactoryNgService } from './api-control-component-factory-ng.service';

@Injectable({
    providedIn: 'root',
})
export class ExtensionsNgService implements OnDestroy {
    private _service: ExtensionsService;

    constructor() {
        const extensionsAccessNgService = inject(ExtensionsAccessNgService);
        const decimalFactoryNgService = inject(DecimalFactoryNgService);
        const adiNgService = inject(AdiNgService);
        const settingsNgService = inject(SettingsNgService);
        const marketsNgService = inject(MarketsNgService);
        const commandRegisterNgService = inject(CommandRegisterNgService);
        const storageNgService = inject(AppStorageNgService);
        const symbolsNgService = inject(SymbolsNgService);
        const menuBarNgService = inject(MenuBarNgService);
        const workspaceNgService = inject(WorkspaceNgService);
        const apiControlComponentNgFactoryService = inject(ApiControlComponentFactoryNgService);
        const apiContentComponentNgFactoryService = inject(ApiContentComponentFactoryNgService);

        this._service = new ExtensionsService(
            decimalFactoryNgService.service,
            adiNgService.service,
            settingsNgService.service,
            marketsNgService.service,
            commandRegisterNgService.service,
            storageNgService.service,
            symbolsNgService.service,
            menuBarNgService.service,
            workspaceNgService.service,
            apiControlComponentNgFactoryService, // only passes interface
            apiContentComponentNgFactoryService, // only passes interface
        );
        extensionsAccessNgService.setService(this._service);
        commandRegisterNgService.service.setInternalExtensionHandle(this._service.internalHandle);
    }

    get service() { return this._service; }

    ngOnDestroy() {
        this._service.destroy();
    }
}
