import { Injectable, OnDestroy } from '@angular/core';
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

    constructor(
        extensionsAccessNgService: ExtensionsAccessNgService,
        decimalFactoryNgService: DecimalFactoryNgService,
        adiNgService: AdiNgService,
        settingsNgService: SettingsNgService,
        marketsNgService: MarketsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        storageNgService: AppStorageNgService,
        symbolsNgService: SymbolsNgService,
        menuBarNgService: MenuBarNgService,
        workspaceNgService: WorkspaceNgService,
        apiControlComponentNgFactoryService: ApiControlComponentFactoryNgService,
        apiContentComponentNgFactoryService: ApiContentComponentFactoryNgService,
    ) {
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
