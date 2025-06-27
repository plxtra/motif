import { Injectable } from '@angular/core';
import { MarketsService } from '@plxtra/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class MarketsNgService {
    private readonly _service: MarketsService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.marketsService;
    }

    get service() { return this._service; }
}
