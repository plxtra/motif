import { Injectable } from '@angular/core';
import { RevReferenceableDataSourceDefinitionsStore } from 'revgrid';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class ReferenceableDataSourceDefinitionsStoreNgService {
    private _service: RevReferenceableDataSourceDefinitionsStore;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.referenceableDataSourceDefinitionsStoreService;
    }

    get service() { return this._service; }
}
