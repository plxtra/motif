import { Injectable } from '@angular/core';
import { SymbolDetailCacheService } from '@plxtra/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root'
})
export class SymbolDetailCacheNgService {
    private _service: SymbolDetailCacheService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.symbolDetailCacheService;
    }

    get service() { return this._service; }
}
