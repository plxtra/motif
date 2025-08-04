import { Injectable, inject } from '@angular/core';
import { MarketsService } from '@plxtra/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class MarketsNgService {
    private readonly _service: MarketsService;

    constructor() {
        const coreNgService = inject(CoreNgService);

        this._service = coreNgService.marketsService;
    }

    get service() { return this._service; }
}
