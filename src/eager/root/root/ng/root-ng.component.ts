import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, viewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { delay1Tick, MultiEvent } from '@pbkware/js-utils';
import {
    CapabilitiesService,
    ColorScheme,
    CommandContext,
    KeyboardService,
    ScalarSettings,
    SessionStateId,
    SettingsService,
    StringId,
    UserAlertService
} from '@plxtra/motif-core';
import { ComponentBaseNgDirective } from 'component-ng-api';
import { BrandingNgService, CapabilitiesNgService, KeyboardNgService, SettingsNgService, UserAlertNgService } from 'component-services-ng-api';
import { ExtensionsService } from 'extensions-internal-api';
import { ExtensionsNgService } from 'extensions-ng-api';
import { OverlayOriginNgComponent } from 'overlay-ng-api';
import { BottomAdvertStripNgComponent } from '../../bottom-advert-strip/ng/bottom-advert-strip-ng.component';
import { ConfigNgService } from '../../ng/config-ng.service';
import { SessionNgService } from '../../ng/session-ng.service';
import { SessionService } from '../../session-service';
import { UserAlertNgComponent } from '../../user-alert/ng-api';

@Component({
    selector: 'app-root',
    templateUrl: './root-ng.component.html',
    styleUrls: ['./root-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: BrandingNgService.injectionToken,
            useFactory: (configNgService: ConfigNgService) => {
                const config = configNgService.config;
                const branding = config.branding;
                return new BrandingNgService(branding.desktopBarLeftImageUrl, branding.startupSplashWebPageSafeResourceUrl);
            },
            deps: [ConfigNgService]
        }
    ],
    standalone: false
})
export class RootNgComponent extends ComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    private static typeInstanceCreateCount = 0;

    public starting = true;

    private readonly _cdr = inject(ChangeDetectorRef);
    private readonly _titleService = inject(Title);
    private readonly _sessionNgService = inject(SessionNgService);

    private readonly _userAlertComponentSignal = viewChild.required<UserAlertNgComponent>('userAlert');
    private readonly _overlayOriginComponentSignal = viewChild.required<OverlayOriginNgComponent>('overlayOrigin');
    private readonly _bottomAdvertStripComponentSignal = viewChild<BottomAdvertStripNgComponent>('bottomAdvertStrip');

    private readonly _capabilitiesService: CapabilitiesService;
    private readonly _keyboardService: KeyboardService;
    private readonly _commandContext: CommandContext;
    private readonly _userAlertService: UserAlertService;
    private readonly _session: SessionService;
    private readonly _settingsService: SettingsService;
    private readonly _scalarSettings: ScalarSettings;

    private _userAlertComponent: UserAlertNgComponent;
    private _overlayOriginComponent: OverlayOriginNgComponent;
    private _bottomAdvertStripComponent: BottomAdvertStripNgComponent | undefined;

    private _sessionStateChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    private _measureFontFamily: string;
    private _measureFontSize: string;

    constructor() {
        const settingsNgService = inject(SettingsNgService);
        const capabilitiesNgService = inject(CapabilitiesNgService);
        const extensionsNgService = inject(ExtensionsNgService);
        const keyboardNgService = inject(KeyboardNgService);
        const userAlertNgService = inject(UserAlertNgService);

        super(++RootNgComponent.typeInstanceCreateCount);

        this._session = this._sessionNgService.session;
        this._sessionStateChangeSubscriptionId =
            this._session.subscribeStateChangeEvent((stateId) => this.handleSessionStateChangeEvent(stateId));

        this._settingsService = settingsNgService.service;
        this._scalarSettings = this._settingsService.scalar;
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.handleSettingsChangedEvent());

        this._titleService.setTitle('Motif'); // need to improve this

        this._capabilitiesService = capabilitiesNgService.service;
        this._keyboardService = keyboardNgService.service;
        this._commandContext = this.createCommandContext(this.rootHtmlElement, extensionsNgService.service);
        this._keyboardService.registerCommandContext(this._commandContext, true);
        this._userAlertService = userAlertNgService.service;
    }

    public get advertisingActive() { return this._capabilitiesService.advertisingEnabled && !this.starting; }

    ngAfterViewInit() {
        this._userAlertComponent = this._userAlertComponentSignal();
        this._overlayOriginComponent = this._overlayOriginComponentSignal();
        this._bottomAdvertStripComponent = this._bottomAdvertStripComponentSignal();

        this._userAlertService.alertQueueChangedEvent = () => this.handleUserAlertServiceAlertQueueChangedEvent();
        const alerts = this._userAlertService.getVisibleAlerts();
        if (alerts.length > 0) {
            this._userAlertComponent.pushAlerts(alerts);
        }
    }

    ngOnDestroy() {
        this.finalise();
    }

    private handleUserAlertServiceAlertQueueChangedEvent() {
        const alerts = this._userAlertService.getVisibleAlerts();
        this._userAlertComponent.pushAlerts(alerts);
    }

    private handleSessionStateChangeEvent(stateId: SessionStateId) {
        if (stateId === SessionStateId.Online) {
            this.starting = false;
            // not interested in this event anymore
            this._session.unsubscribeStateChangeEvent(this._sessionStateChangeSubscriptionId);
            this._sessionStateChangeSubscriptionId = undefined;
            this._cdr.markForCheck();
        }
    }

    private handleSettingsChangedEvent() {
        this.applySettings();
    }

    private applySettings() {
        this.rootHtmlElement.style.setProperty('font-family', this._settingsService.scalar.fontFamily);
        this.rootHtmlElement.style.setProperty('font-size', this._settingsService.scalar.fontSize);

        const panelItemId = ColorScheme.ItemId.Panel;
        const bkgdPanelColor = this._settingsService.color.getBkgd(panelItemId);
        this.rootHtmlElement.style.setProperty('background-color', bkgdPanelColor);

        const color = this._settingsService.color.getFore(panelItemId);
        this.rootHtmlElement.style.setProperty('color', color);

        // const borderItemId = ColorScheme.ItemId.Text_ControlBorder;

        this._cdr.markForCheck();

        if (this._scalarSettings.fontFamily !== this._measureFontFamily || this._scalarSettings.fontSize !== this._measureFontSize) {
            this._measureFontFamily = this._scalarSettings.fontFamily;
            this._measureFontSize = this._scalarSettings.fontSize;

            delay1Tick(() => this._overlayOriginComponent.updateMeasure(this._measureFontFamily, this._measureFontSize));
        }
    }

    private finalise() {
        this._keyboardService.deregisterCommandContext(this._commandContext);

        if (this._settingsChangedSubscriptionId !== undefined) {
            this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
        }

        if (this._sessionStateChangeSubscriptionId !== undefined) {
            this._session.unsubscribeStateChangeEvent(this._sessionStateChangeSubscriptionId);
            this._sessionStateChangeSubscriptionId = undefined;
        }
    }

    private createCommandContext(htmlElement: HTMLElement, extensionsService: ExtensionsService) {
        const id: CommandContext.Id = {
            name: 'Root',
            extensionHandle: extensionsService.internalHandle,
        };

        return new CommandContext(id, StringId.CommandContextDisplay_Root, htmlElement, () => undefined);
    }
}
