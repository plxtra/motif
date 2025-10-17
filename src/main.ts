import { enableProdMode, provideAppInitializer, inject, ErrorHandler, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { EagerRootNgModule } from 'root-ng-api';
import { environment } from './environments/environment';
import { DomSanitizer, BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { LogNgService } from './eager/root/ng/log-ng.service';
import { ConfigNgService } from './eager/root/ng/config-ng.service';
import { AuthGuardNgService } from './eager/root/ng/auth-guard-ng.service';
import { CurrentVersionGuardNgService } from './eager/root/ng/current-version-guard-ng.service';
import { ErrorHandlerNgService } from './eager/root/ng/error-handler-ng.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AppRoutingModule } from './eager/root/ng/app-routing.module';
import { EagerContentNgModule } from 'content-ng-api';
import { EagerControlsNgModule } from 'controls-ng-api';
import { EagerDesktopNgModule } from 'desktop-ng-api';
import { EagerExtensionsNgModule } from 'extensions-ng-api';
import { EagerOverlayNgModule } from 'overlay-ng-api';
import { FormsModule } from '@angular/forms';
import { RootNgComponent } from './eager/root/root/ng/root-ng.component';

if (environment.prodMode) {
    enableProdMode();
}

bootstrapApplication(RootNgComponent, {
    providers: [
        importProvidersFrom(AngularSvgIconModule.forRoot(), AppRoutingModule, BrowserModule, EagerContentNgModule, EagerControlsNgModule, EagerDesktopNgModule, EagerExtensionsNgModule, EagerOverlayNgModule, FormsModule),
        provideAppInitializer(() => {
            const initializerFn = ((domSanitizer: DomSanitizer, _logNgService: LogNgService, // Make sure log service is started ASAP
            configNgService: ConfigNgService) => ConfigNgService.getLoadConfigFtn(domSanitizer, configNgService))(inject(DomSanitizer), inject(LogNgService), inject(ConfigNgService));
            return initializerFn();
        }),
        AuthGuardNgService,
        CurrentVersionGuardNgService,
        { provide: ErrorHandler, useClass: ErrorHandlerNgService },
        provideHttpClient(withInterceptorsFromDi())
    ]
})
    .catch((err: unknown) => console.log(err));
