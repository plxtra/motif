import { Injectable, inject } from '@angular/core';
import { UserAlertNgService } from 'component-services-ng-api';
import { OpenIdService } from '../open-id-service';

@Injectable({
    providedIn: 'root'
})
export class OpenIdNgService {
    private readonly _service: OpenIdService;

    constructor() {
        const userAlertNgService = inject(UserAlertNgService);

        this._service = new OpenIdService(userAlertNgService.service);
    }

    get service() { return this._service; }
}
