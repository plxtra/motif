import { Injectable } from '@angular/core';
import { SettingsService } from '@plxtra/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root'
})
export class SettingsNgService {
    private _service: SettingsService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.settingsService;
    }

    get service() { return this._service; }
}
