import { Injectable, inject } from '@angular/core';
import { ReferenceableColumnLayoutsService } from '@plxtra/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class ReferenceableColumnLayoutsNgService {
    private _service: ReferenceableColumnLayoutsService;

    constructor() {
        const coreNgService = inject(CoreNgService);

        this._service = coreNgService.referenceableColumnLayoutsService;
    }

    get service() { return this._service; }
}
