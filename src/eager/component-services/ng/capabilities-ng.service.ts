import { Injectable } from '@angular/core';
import { CapabilitiesService } from '@plxtra/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root'
})
export class CapabilitiesNgService {
    private _service: CapabilitiesService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.capabilitiesService;
    }

    get service() { return this._service; }
}
