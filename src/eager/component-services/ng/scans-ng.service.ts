import { Injectable } from '@angular/core';
import { ScansService } from '@plxtra/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root'
})
export class ScansNgService {
    private _service: ScansService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.scansService;
    }

    get service() { return this._service; }
}
