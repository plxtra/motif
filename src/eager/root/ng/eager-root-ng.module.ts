// import { OverlayModule } from '@angular/cdk/overlay';
// import { PortalModule } from '@angular/cdk/portal';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ErrorHandler, NgModule, inject, provideAppInitializer } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { EagerContentNgModule } from 'content-ng-api';
import { EagerControlsNgModule } from 'controls-ng-api';
import { EagerDesktopNgModule } from 'desktop-ng-api';
import { EagerExtensionsNgModule } from 'extensions-ng-api';
import { EagerOverlayNgModule } from 'overlay-ng-api';
import { EagerWorkspaceNgModule } from 'workspace-ng-api';
import { AuthCallbackNgComponent } from '../auth-callback/ng-api';
import { BottomAdvertStripNgComponent } from '../bottom-advert-strip/ng/bottom-advert-strip-ng.component';
import { NotCurrentVersionNgComponent } from '../not-current-version/ng-api';
import { RootNgComponent } from '../root/ng-api';
import { SignedOutNgComponent } from '../signed-out/ng-api';
import { StartupNgComponent } from '../startup/ng-api';
import { StaticInitialise } from '../static-initialise';
import { UserAlertNgComponent } from '../user-alert/ng-api';
import { AppRoutingModule } from './app-routing.module';
import { AuthGuardNgService } from './auth-guard-ng.service';
import { ConfigNgService } from './config-ng.service';
import { CurrentVersionGuardNgService } from './current-version-guard-ng.service';
import { ErrorHandlerNgService } from './error-handler-ng.service';
import { LogNgService } from './log-ng.service';

@NgModule({
    declarations: [
        AuthCallbackNgComponent,
        BottomAdvertStripNgComponent,
        NotCurrentVersionNgComponent,
        RootNgComponent,
        SignedOutNgComponent,
        StartupNgComponent,
        UserAlertNgComponent,
    ],
    bootstrap: [RootNgComponent],
    imports: [
        AngularSvgIconModule.forRoot(),
        AppRoutingModule,
        BrowserModule,
        EagerContentNgModule,
        EagerControlsNgModule,
        EagerDesktopNgModule,
        EagerExtensionsNgModule,
        EagerOverlayNgModule,
        EagerWorkspaceNgModule,
        FormsModule], providers: [
        provideAppInitializer(() => {
            const initializerFn = ((domSanitizer: DomSanitizer, _logNgService: LogNgService, // Make sure log service is started ASAP
                configNgService: ConfigNgService) => ConfigNgService.getLoadConfigFtn(domSanitizer, configNgService))(inject(DomSanitizer), inject(LogNgService), inject(ConfigNgService));
            return initializerFn();
        }),
        AuthGuardNgService,
        CurrentVersionGuardNgService,
        { provide: ErrorHandler, useClass: ErrorHandlerNgService },
        provideHttpClient(withInterceptorsFromDi()),
    ]
})

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class EagerRootNgModule {
    constructor() {
        StaticInitialise.initialise();
    }
}
