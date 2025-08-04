import { Injectable, inject } from '@angular/core';
import { CoreNgService } from 'component-services-ng-api';
import { LegacyTableRecordSourceDefinitionFactoryService } from '../legacy-table-record-source-definition-factory-service';
import { TableFieldSourceDefinitionCachingFactoryNgService } from './table-field-source-definition-caching-factory-ng.service';

@Injectable({
    providedIn: 'root',
})
export class LegacyTableRecordSourceDefinitionFactoryNgService {
    private _service: LegacyTableRecordSourceDefinitionFactoryService;

    constructor() {
        const coreNgService = inject(CoreNgService);
        const tableFieldSourceDefinitionCachingFactoryNgService = inject(TableFieldSourceDefinitionCachingFactoryNgService);

        const coreService = coreNgService.service;

        this._service = new LegacyTableRecordSourceDefinitionFactoryService(
            coreNgService.decimalFactoryService,
            coreNgService.marketsService,
            coreService.rankedDataIvemIdListDefinitionFactoryService,
            coreService.customHeadingsService,
            tableFieldSourceDefinitionCachingFactoryNgService.service, // Do NOT get directly from core service.  Make sure dependent on TableFieldSourceDefinitionCachingFactoryNgService
        );
    }

    get service() { return this._service; }
}
