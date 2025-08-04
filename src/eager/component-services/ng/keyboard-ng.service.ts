import { Injectable, inject } from '@angular/core';
import { KeyboardService } from '@plxtra/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root'
})
export class KeyboardNgService {
    readonly service: KeyboardService;

    constructor() {
        const coreNgService = inject(CoreNgService);

        this.service = coreNgService.keyboardService;
    }
}
