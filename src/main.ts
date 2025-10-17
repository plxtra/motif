import { enableProdMode, provideAppInitializer, inject, ErrorHandler, importProvidersFrom } from '@angular/core';
import { environment } from './environments/environment';
import { DomSanitizer, BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { LogNgService } from './eager/root/ng/log-ng.service';
import { ConfigNgService } from './eager/root/ng/config-ng.service';
import { AuthGuardNgService } from './eager/root/ng/auth-guard-ng.service';
import { CurrentVersionGuardNgService } from './eager/root/ng/current-version-guard-ng.service';
import { ErrorHandlerNgService } from './eager/root/ng/error-handler-ng.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AngularSvgIconModule, SvgIconRegistryService } from 'angular-svg-icon';
import { AppRoutingModule } from './eager/root/ng/app-routing.module';
import { SvgButtonNgComponent } from 'controls-ng-api';
import { FormsModule } from '@angular/forms';
import { RootNgComponent } from './eager/root/root/ng/root-ng.component';
import { NgSelectConfig } from '@ng-select/ng-select';
import { SettingsNgService } from './eager/component-services/ng/settings-ng.service';
import { NgSelectUtilsModule } from 'controls-internal-api';

if (environment.prodMode) {
    enableProdMode();
}

bootstrapApplication(RootNgComponent, {
    providers: [
        importProvidersFrom(AngularSvgIconModule.forRoot(), AppRoutingModule, BrowserModule, FormsModule),
        provideAppInitializer(() => {
            const domSanitizer = inject(DomSanitizer);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const logNgService = inject(LogNgService); // Make sure log service is started ASAP

            const ngSelectConfig = inject(NgSelectConfig);
            const settingsNgService = inject(SettingsNgService);
            const svgIconRegistryService = inject(SvgIconRegistryService);

            ngSelectConfig.appendTo = '.paritechMotifNgSelectOverlay';
            NgSelectUtilsModule.setColorSettings(settingsNgService.service.color);

            SvgButtonNgComponent.Lookup.initialise(svgIconRegistryService);


            const configNgService = inject(ConfigNgService);
            return ConfigNgService.getLoadConfigFtn(domSanitizer, configNgService)();
            // const initializerFn = (
            //     (domSanitizer: DomSanitizer, _logNgService: LogNgService, /* Make sure log service is started ASAP*/ configNgService: ConfigNgService) =>
            //         ConfigNgService.getLoadConfigFtn(domSanitizer, configNgService))(
            //             inject(DomSanitizer), inject(LogNgService), inject(ConfigNgService)
            //         );
            // return initializerFn();
        }),
        AuthGuardNgService,
        CurrentVersionGuardNgService,
        { provide: ErrorHandler, useClass: ErrorHandlerNgService },
        provideHttpClient(withInterceptorsFromDi())
    ]
})
    .catch((err: unknown) => console.log(err));
