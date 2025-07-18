import { Injectable } from '@angular/core';
import { SessionInfoService } from '@plxtra/motif-core';

@Injectable({
    providedIn: 'root'
})
export class SessionInfoNgService {
    private _service: SessionInfoService;

    get service() { return this._service; }

    setSessionInfo(value: SessionInfoService) {
        this._service = value;
    }
}
