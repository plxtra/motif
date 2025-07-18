import { Injectable } from '@angular/core';
import { RevSourcedFieldCustomHeadings } from 'revgrid';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root'
})
export class GridFieldCustomHeadingsNgService {
    private _service: RevSourcedFieldCustomHeadings;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.customHeadingsService;
    }

    get service() { return this._service; }
}
