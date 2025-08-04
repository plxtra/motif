import { Injectable, NgZone, inject } from '@angular/core';
import { IdleService } from '@plxtra/motif-core';

@Injectable({
    providedIn: 'root',
})
export class IdleNgService {
    private _service: IdleService;

    constructor() {
        const ngZone = inject(NgZone);

        this._service = new IdleService();
        this._service.callbackExecuteEventer = (idleCallbackClosure) => {
            ngZone.runGuarded(idleCallbackClosure);
        }
    }

    get service() { return this._service; }
}
