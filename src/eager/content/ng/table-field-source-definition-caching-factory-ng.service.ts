import { Injectable, inject } from '@angular/core';
import { TableFieldSourceDefinitionCachingFactory } from '@plxtra/motif-core';
import { CoreNgService } from '../../component-services/ng/core-ng.service';
import { TableFieldSourceDefinitionFactoryService } from '../table-field-source-definition-factory-service';

@Injectable({
    providedIn: 'root',
})
export class TableFieldSourceDefinitionCachingFactoryNgService {
    private _service: TableFieldSourceDefinitionCachingFactory;

    constructor() {
        const coreNgService = inject(CoreNgService);

        const coreService = coreNgService.service;

        const definitionFactoryService = new TableFieldSourceDefinitionFactoryService();

        coreService.setTableFieldSourceDefinitionFactory(definitionFactoryService);
        this._service = coreService.tableFieldSourceDefinitionCachingFactoryService;
    }

    get service() { return this._service; }

    touch() {
        // only used to flag as used to prevent compiler warning
    }
}
