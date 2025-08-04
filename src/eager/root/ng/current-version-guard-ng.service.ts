import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Version } from 'generated-internal-api';
import { ConfigNgService } from './config-ng.service';

@Injectable({
    providedIn: 'root'
})
export class CurrentVersionGuardNgService  {
    private _router = inject(Router);
    private _configNgService = inject(ConfigNgService);


    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this._configNgService.version === Version.app)  {
            return true;
        } else {
            return this._router.createUrlTree(['/not-current-version']);
        }
    }
}
