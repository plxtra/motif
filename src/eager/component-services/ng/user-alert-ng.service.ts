import { Injectable } from '@angular/core';
import { UserAlertService } from '@plxtra/motif-core';

@Injectable({
    providedIn: 'root'
})
export class UserAlertNgService {
    private _service: UserAlertService;

    constructor() {
        this._service = new UserAlertService();
    }

    get service() { return this._service; }
}
