import { Injectable, NgZone } from '@angular/core';
import { IdleService } from '@plxtra/motif-core';

@Injectable({
    providedIn: 'root',
})
export class IdleNgService {
    private _service: IdleService;

    constructor(ngZone: NgZone) {
        this._service = new IdleService();
        this._service.callbackExecuteEventer = (idleCallbackClosure) => {
            ngZone.runGuarded(idleCallbackClosure);
        }
    }

    get service() { return this._service; }
}
