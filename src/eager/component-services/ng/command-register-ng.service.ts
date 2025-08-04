import { Injectable, inject } from '@angular/core';
import { CommandRegisterService } from '@plxtra/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root'
})
export class CommandRegisterNgService {
    private _service: CommandRegisterService;

    constructor() {
        const coreNgService = inject(CoreNgService);

        this._service = coreNgService.commandRegisterService;
    }

    get service() { return this._service; }
}
