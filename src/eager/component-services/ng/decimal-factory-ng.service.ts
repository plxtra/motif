import { Injectable, inject } from '@angular/core';
import { DecimalFactoryService } from '../decimal-factory-service';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root'
})
export class DecimalFactoryNgService {
    private _service: DecimalFactoryService;

    constructor() {
        const coreNgService = inject(CoreNgService);

        this._service = coreNgService.decimalFactoryService;
    }

    get service() { return this._service; }
}
