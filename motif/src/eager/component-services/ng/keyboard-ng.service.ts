import { Injectable } from '@angular/core';
import { KeyboardService } from '@plxtra/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root'
})
export class KeyboardNgService {
    readonly service: KeyboardService;

    constructor(coreNgService: CoreNgService) {
        this.service = coreNgService.keyboardService;
    }
}
