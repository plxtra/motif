import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AssertInternalError } from '@pbkware/js-utils';
import {
    AdiNgService,
    AppStorageNgService,
    CapabilitiesNgService,
    HideUnloadSaveNgService,
    MarketsNgService,
    MotifServicesNgService,
    NotificationChannelsNgService,
    ScansNgService,
    SessionInfoNgService,
    SettingsNgService,
    SignOutNgService,
    SymbolsNgService,
    UserAlertNgService
} from 'component-services-ng-api';
import { ExtensionsNgService } from 'extensions-ng-api';
import { WorkspaceNgService } from 'workspace-ng-api';
import { Config } from '../config';
import { SessionService } from '../session-service';
import { ConfigNgService } from './config-ng.service';
import { LogNgService } from './log-ng.service';
import { OpenIdNgService } from './open-id-ng.service';
import { TelemetryNgService } from './telemetry-ng.service';

@Injectable({
    providedIn: 'root'
})
export class SessionNgService implements OnDestroy {
    private _config: Config;
    private _session: SessionService;

    constructor(
        private readonly _router: Router,
        configNgService: ConfigNgService,
        logNgService: LogNgService,
        telemetryNgService: TelemetryNgService,
        userAlertNgService: UserAlertNgService,
        settingsNgService: SettingsNgService,
        openIdNgService: OpenIdNgService,
        capabilitiesNgService: CapabilitiesNgService,
        motifServicesNgService: MotifServicesNgService,
        appStorageNgService: AppStorageNgService,
        extensionNgService: ExtensionsNgService,
        workspaceNgService: WorkspaceNgService,
        adiNgService: AdiNgService,
        marketsNgService: MarketsNgService,
        symbolsNgService: SymbolsNgService,
        notificationChannelsNgService: NotificationChannelsNgService,
        scansNgService: ScansNgService,
        sessionInfoNgService: SessionInfoNgService,
        hideUnloadSaveNgService: HideUnloadSaveNgService,
        signOutNgService: SignOutNgService,
    ) {
        this._config = configNgService.config;
        this._session = new SessionService(
            configNgService.config,
            logNgService.service,
            telemetryNgService.service,
            userAlertNgService.service,
            settingsNgService.service,
            openIdNgService.service,
            capabilitiesNgService.service,
            motifServicesNgService.service,
            appStorageNgService.service,
            extensionNgService.service,
            workspaceNgService.service,
            adiNgService.service,
            marketsNgService.service,
            symbolsNgService.service,
            notificationChannelsNgService.service,
            scansNgService.service,
            hideUnloadSaveNgService.service,
            signOutNgService.service,
        );

        this._session.authenticatedEvent = () => this.handleAuthenticatedEvent();
        this._session.startupOnlineEvent = () => this.handleStartupOnlineEvent();

        sessionInfoNgService.setSessionInfo(this._session.infoService);
    }

    get session() { return this._session; }

    ngOnDestroy() {
        this._session.finalise();
    }

    // getAuthorizationHeaderValue(): string {
    //     return this.session.getAuthorizationHeaderValue();
    // }

    private handleAuthenticatedEvent() {
        this.navigate('/startup');
    }

    private handleStartupOnlineEvent() {
        this._session.startupOnlineEvent = undefined; // only want to get this event once
        if (this._router.routerState.snapshot.url !== '/desktop') {
            this.navigate('/desktop');
        }
    }

    private navigate(path: string) {
        const promise = this._router.navigate([path]);
        promise.then(
            (success) => {
                if (!success) {
                    throw new AssertInternalError('SNSNF20256', path);
                }
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'SNSNR20256', path); }
        )
    }
}
