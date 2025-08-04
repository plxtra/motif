import { Injectable, inject } from '@angular/core';
import { RevReferenceableDataSourceDefinitionsStore } from 'revgrid';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class ReferenceableDataSourceDefinitionsStoreNgService {
    private _service: RevReferenceableDataSourceDefinitionsStore;

    constructor() {
        const coreNgService = inject(CoreNgService);

        this._service = coreNgService.referenceableDataSourceDefinitionsStoreService;
    }

    get service() { return this._service; }
}
