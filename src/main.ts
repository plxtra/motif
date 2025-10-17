import { enableProdMode, provideAppInitializer, inject, ErrorHandler, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { environment } from './environments/environment';
import { DomSanitizer, bootstrapApplication } from '@angular/platform-browser';
import { LogNgService } from './eager/root/ng/log-ng.service';
import { ConfigNgService } from './eager/root/ng/config-ng.service';
import { AuthGuardNgService } from './eager/root/ng/auth-guard-ng.service';
import { CurrentVersionGuardNgService } from './eager/root/ng/current-version-guard-ng.service';
import { ErrorHandlerNgService } from './eager/root/ng/error-handler-ng.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AngularSvgIconModule, SvgIconRegistryService } from 'angular-svg-icon';
import { routes } from './eager/root/ng/app.routes';
import { SvgButtonNgComponent } from 'controls-ng-api';
import { RootNgComponent } from './eager/root/root/ng/root-ng.component';
import { NgSelectConfig } from '@ng-select/ng-select';
import { SettingsNgService } from './eager/component-services/ng/settings-ng.service';
import { NgSelectUtilsModule } from 'controls-internal-api';
import { provideRouter } from '@angular/router';

if (environment.prodMode) {
    enableProdMode();
}

bootstrapApplication(RootNgComponent, {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(withInterceptorsFromDi()),

        { provide: ErrorHandler, useClass: ErrorHandlerNgService },

        importProvidersFrom(AngularSvgIconModule.forRoot()),

        AuthGuardNgService,
        CurrentVersionGuardNgService,

        provideAppInitializer(() => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const logNgService = inject(LogNgService); // Make sure log service is started ASAP

            const ngSelectConfig = inject(NgSelectConfig);
            const settingsNgService = inject(SettingsNgService);
            const svgIconRegistryService = inject(SvgIconRegistryService);

            ngSelectConfig.appendTo = '.paritechMotifNgSelectOverlay';
            NgSelectUtilsModule.setColorSettings(settingsNgService.service.color);

            SvgButtonNgComponent.Lookup.initialise(svgIconRegistryService);

            const domSanitizer = inject(DomSanitizer);
            const configNgService = inject(ConfigNgService);
            return configNgService.load(domSanitizer);
        }),
    ]
})
    .catch((err: unknown) => console.log(err));
