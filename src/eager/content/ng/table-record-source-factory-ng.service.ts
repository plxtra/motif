import { Injectable } from '@angular/core';
import { CoreNgService } from '../../component-services/ng/core-ng.service';
import { TableRecordSourceFactoryService } from '../table-record-source-factory-service';
import { TableFieldSourceDefinitionCachingFactoryNgService } from './table-field-source-definition-caching-factory-ng.service';

@Injectable({
    providedIn: 'root',
})
export class TableRecordSourceFactoryNgService {
    private _service: TableRecordSourceFactoryService;

    constructor(
        coreNgService: CoreNgService,
        tableFieldSourceDefinitionCachingFactoryNgService: TableFieldSourceDefinitionCachingFactoryNgService,
    ) {
        const coreService = coreNgService.service;
        const tableFieldSourceDefinitionCachingFactory = tableFieldSourceDefinitionCachingFactoryNgService.service;

        this._service = new TableRecordSourceFactoryService(
            coreService.decimalFactory,
            coreService.marketsService,
            coreService.adiService,
            coreService.symbolsService,
            coreService.symbolDetailCacheService,
            coreService.rankedDataIvemIdListFactoryService,
            coreService.watchmakerService,
            coreService.notificationChannelsService,
            coreService.scansService,
            coreService.textFormatterService,
            coreService.customHeadingsService,
            tableFieldSourceDefinitionCachingFactory, // Do NOT get directly from core service.  Make sure dependent on TableFieldSourceDefinitionCachingFactory
        );

        coreService.setTableRecordSourceFactory(this._service, tableFieldSourceDefinitionCachingFactory.definitionFactory);
    }

    get service() { return this._service; }

    touch() {
        // only used to flag as used to prevent compiler warning
    }
}
