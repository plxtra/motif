import { Injectable, inject } from '@angular/core';
import { AdiService } from '@plxtra/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class AdiNgService {
    private _service: AdiService;

    constructor() {
        const coreNgService = inject(CoreNgService);

        this._service = coreNgService.adiService;
    }

    get service() { return this._service; }
}
