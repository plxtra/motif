import { Injectable, OnDestroy } from '@angular/core';
import {
    AdiService,
    AppStorageService,
    CapabilitiesService,
    CellPainterFactoryService,
    CommandRegisterService,
    CoreService,
    KeyboardService,
    MarketsService,
    MotifServicesService,
    NotificationChannelsService,
    ReferenceableColumnLayoutsService,
    ReferenceableDataSourceDefinitionsStoreService,
    ReferenceableDataSourcesService,
    ScansService,
    SettingsService,
    StandardTableFieldSourceDefinitionCachingFactoryService,
    SymbolDetailCacheService,
    SymbolsService,
    TextFormatterService
} from '@plxtra/motif-core';
import { RevSourcedFieldCustomHeadings } from 'revgrid';
import { DecimalFactoryService } from '../decimal-factory-service';

@Injectable({
    providedIn: 'root'
})
export class CoreNgService implements OnDestroy {
    readonly decimalFactoryService: DecimalFactoryService;
    private readonly _service: CoreService;

    constructor() {
        const decimalFactoryService = new DecimalFactoryService();
        this.decimalFactoryService = decimalFactoryService;
        this._service = new CoreService(decimalFactoryService);
        this._service.symbolsService.settingsServiceLinked = true;
    }

    get service() { return this._service; }

    get settingsService(): SettingsService { return this._service.settingsService; }
    get motifServicesService(): MotifServicesService { return this._service.motifServicesService; }
    get appStorageService(): AppStorageService { return this._service.appStorageService; }
    get adiService(): AdiService { return this._service.adiService; }
    get marketsService(): MarketsService { return this._service.marketsService; }
    get capabilitiesService(): CapabilitiesService { return this._service.capabilitiesService; }
    get symbolsService(): SymbolsService { return this._service.symbolsService; }
    get symbolDetailCacheService(): SymbolDetailCacheService { return this._service.symbolDetailCacheService; }
    get notificationChannelsService(): NotificationChannelsService { return this._service.notificationChannelsService; }
    get scansService(): ScansService { return this._service.scansService; }

    get textFormatterService(): TextFormatterService { return this._service.textFormatterService; }
    get customHeadingsService(): RevSourcedFieldCustomHeadings { return this._service.customHeadingsService; }
    get tableFieldSourceDefinitionCachingFactoryService(): StandardTableFieldSourceDefinitionCachingFactoryService {
        return this._service.tableFieldSourceDefinitionCachingFactoryService;
    }
    get referenceableColumnLayoutsService(): ReferenceableColumnLayoutsService { return this._service.referenceableColumnLayoutsService; }
    get referenceableDataSourceDefinitionsStoreService(): ReferenceableDataSourceDefinitionsStoreService { return this._service.referenceableDataSourceDefinitionsStoreService; }
    get referenceableDataSourcesService(): ReferenceableDataSourcesService { return this._service.referenceableDataSourcesService; }
    get cellPainterFactoryService(): CellPainterFactoryService { return this._service.cellPainterFactoryService; }
    get commandRegisterService(): CommandRegisterService { return this._service.commandRegisterService; }
    get keyboardService(): KeyboardService { return this._service.keyboardService; }

    ngOnDestroy() {
        this._service.finalise();
    }
}
