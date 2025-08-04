import { Injectable, inject } from '@angular/core';
import { RevSourcedFieldCustomHeadings } from 'revgrid';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root'
})
export class GridFieldCustomHeadingsNgService {
    private _service: RevSourcedFieldCustomHeadings;

    constructor() {
        const coreNgService = inject(CoreNgService);

        this._service = coreNgService.customHeadingsService;
    }

    get service() { return this._service; }
}
