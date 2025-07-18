import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DesktopNgComponent } from 'desktop-ng-api';
import { AuthCallbackNgComponent } from '../auth-callback/ng/auth-callback-ng.component';
import { NotCurrentVersionNgComponent } from '../not-current-version/ng-api';
import { SignedOutNgComponent } from '../signed-out/ng/signed-out-ng.component';
import { StartupNgComponent } from '../startup/ng-api';
import { AuthGuardNgService } from './auth-guard-ng.service';
import { CurrentVersionGuardNgService } from './current-version-guard-ng.service';

const routes: Routes = [
    {
        path: '',
        children: [],
        canActivate: [CurrentVersionGuardNgService, AuthGuardNgService]
    },
    {
        path: 'not-current-version',
        component: NotCurrentVersionNgComponent
    },
    {
        path: 'auth-callback',
        component: AuthCallbackNgComponent
    },
    {
        path: 'startup',
        component: StartupNgComponent,
        canActivate: [CurrentVersionGuardNgService, AuthGuardNgService]
    },
    {
        path: 'desktop',
        component: DesktopNgComponent,
        canActivate: [CurrentVersionGuardNgService, AuthGuardNgService]
    },
    {
        path: 'signed-out',
        component: SignedOutNgComponent,
        canActivate: [AuthGuardNgService]
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {})
    ],
    exports: [
        RouterModule
    ],
    declarations: []
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppRoutingModule { }
