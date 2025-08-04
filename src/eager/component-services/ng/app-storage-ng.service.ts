import { Injectable, inject } from '@angular/core';
import { AppStorageService } from '@plxtra/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class AppStorageNgService {
    private _service: AppStorageService;

    constructor() {
        const coreNgService = inject(CoreNgService);

        this._service = coreNgService.appStorageService;
    }

    get service() { return this._service; }
}
