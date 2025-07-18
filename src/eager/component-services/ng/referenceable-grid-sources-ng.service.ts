import { Injectable } from '@angular/core';
import { ReferenceableDataSourcesService } from '@plxtra/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class ReferenceableGridSourcesNgService {
    private _service: ReferenceableDataSourcesService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.referenceableDataSourcesService;
    }

    get service() { return this._service; }
}
