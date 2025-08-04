import { Injectable, inject } from '@angular/core';
import { TextFormatterService } from '@plxtra/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class TextFormatterNgService {
    private _service: TextFormatterService;

    constructor() {
        const coreNgService = inject(CoreNgService);

        this._service = coreNgService.textFormatterService;
    }

    get service() { return this._service; }
}
