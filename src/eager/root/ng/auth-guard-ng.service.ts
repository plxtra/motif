import { Injectable, inject } from '@angular/core';

import { SessionService } from '../session-service';
import { SessionNgService } from './session-ng.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuardNgService  {
    private readonly _sessionService: SessionService;

    constructor() {
        const sessionNgService = inject(SessionNgService);

        this._sessionService = sessionNgService.session;
    }

    canActivate(): boolean {
        if (this._sessionService.isLoggedIn()) {
            return true;
        } else {
            this._sessionService.startAuthentication();
            return false;
        }
    }
}
