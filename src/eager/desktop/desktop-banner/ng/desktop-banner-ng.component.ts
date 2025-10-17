import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, inject } from '@angular/core';
import { Integer, MultiEvent, UnexpectedCaseError } from '@pbkware/js-utils';
import {
    ColorScheme,
    ColorSettings,
    ExchangeEnvironment,
    MarketsService,
    PublisherSessionTerminatedReasonId,
    SessionInfoService,
    SessionState,
    SessionStateId,
    StringId,
    Strings
} from '@plxtra/motif-core';
import { ComponentBaseNgDirective } from 'component-ng-api';
import { MarketsNgService, SessionInfoNgService, SettingsNgService } from 'component-services-ng-api';

@Component({
    selector: 'app-desktop-banner',
    templateUrl: './desktop-banner-ng.component.html',
    styleUrls: ['./desktop-banner-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DesktopBannerNgComponent extends ComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    public displayed = true;
    public bannerText = '?';
    public environmentBkgdColor = 'yellow';
    public environmentForeColor = 'black';

    private _cdr = inject(ChangeDetectorRef);

    private readonly _colorSettings: ColorSettings;
    private readonly _marketsService: MarketsService;
    private readonly _sessionInfoService: SessionInfoService;
    private _sessionStateChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _publisherSessionTerminatedEventSubscriptionId: MultiEvent.SubscriptionId;
    private _kickedOff = false;

    constructor() {
        super(++DesktopBannerNgComponent.typeInstanceCreateCount);

        const settingsNgService = inject(SettingsNgService);
        const marketsNgService = inject(MarketsNgService);
        const sessionInfoNgService = inject(SessionInfoNgService);

        this._marketsService = marketsNgService.service;
        this._colorSettings = settingsNgService.service.color;

        this._sessionInfoService = sessionInfoNgService.service;
        this._publisherSessionTerminatedEventSubscriptionId = this._sessionInfoService.subscribePublisherSessionTerminatedChangedEvent(
            (reasonId, reasonCode, defaultReasonText) => this.handlePublisherSessionTerminatedEvent(reasonId, reasonCode, defaultReasonText)
        );
        this._sessionStateChangeSubscriptionId = this._sessionInfoService.subscribeStateChangedEvent(
            () => this.handleSessionStateChangeEvent()
        );
    }

    ngOnDestroy() {
        this._sessionInfoService.unsubscribePublisherSessionTerminatedChangedEvent(this._publisherSessionTerminatedEventSubscriptionId);
        this._publisherSessionTerminatedEventSubscriptionId = undefined;
        this._sessionInfoService.unsubscribeStateChangedEvent(this._sessionStateChangeSubscriptionId);
        this._sessionStateChangeSubscriptionId = undefined;
    }

    ngAfterViewInit() {
        this.update();
    }

    private handlePublisherSessionTerminatedEvent(
        _reasonId: PublisherSessionTerminatedReasonId,
        _reasonCode: Integer,
        _defaultReasonText: string
    ) {
        this._kickedOff = true;
        this.update();
    }

    private handleSessionStateChangeEvent() {
        this.update();
    }

    private update() {
        const stateId = this._sessionInfoService.stateId;
        let colorItemId: ColorScheme.ItemId;
        const stateText = SessionState.idToDisplay(stateId);
        switch (stateId) {
            case SessionStateId.NotStarted:
            case SessionStateId.Starting: {
                this.displayed = true;
                this.bannerText = stateText;
                colorItemId = ColorScheme.ItemId.Environment_StartFinal;
                break;
            }
            case SessionStateId.Offline: {
                const upperStateText = stateText.toUpperCase();
                const bannerEnvironment = this.calculateBannerExchangeEnvironment();
                this.displayed = true;
                this.bannerText = `${this.calculateBannerText()} - ${upperStateText} !!!!`;
                colorItemId = this.calculateOfflineColorItemId(bannerEnvironment);
                break;
            }
            case SessionStateId.Online: {
                const bannerEnvironment = this.calculateBannerExchangeEnvironment();
                this.bannerText = this.calculateBannerText();
                colorItemId = this.calculateOnlineColorItemId(bannerEnvironment);
                break;
            }
            case SessionStateId.Finalising:
            case SessionStateId.Finalised: {
                this.displayed = true;
                if (this._kickedOff) {
                    this.bannerText = `${stateText} (${
                        Strings[StringId.KickedOff]
                    })`;
                    colorItemId =
                        ColorScheme.ItemId.Environment_StartFinal_KickedOff;
                } else {
                    this.bannerText = stateText;
                    colorItemId = ColorScheme.ItemId.Environment_StartFinal;
                }
                break;
            }
            default: {
                throw new UnexpectedCaseError('DCUEDD299855', stateId);
            }
        }
        this.environmentBkgdColor = this._colorSettings.getBkgd(colorItemId);
        this.environmentForeColor = this._colorSettings.getFore(colorItemId);
        this._cdr.markForCheck();
    }

    private calculateBannerExchangeEnvironment() {
        if (this._sessionInfoService.bannerOverrideExchangeEnvironment !== undefined) {
            return this._sessionInfoService.bannerOverrideExchangeEnvironment;
        } else {
            return this._marketsService.defaultExchangeEnvironment;
        }
    }

    private calculateBannerText() {
        const exchangeEnvironments = this._marketsService.exchangeEnvironments;
        const count = exchangeEnvironments.count;
        const displays = new Array<string>(count);
        for (let i = 0; i < count; i++) {
            const environment = exchangeEnvironments.getAt(i);
            let display = environment.display;
            if (environment.production) {
                display += ' (Prod)';
            }
            displays[i] = display;
        }

        const serviceName = this._sessionInfoService.serviceName;
        let serviceDescription = this._sessionInfoService.serviceDescription;
        if (serviceDescription === undefined || serviceDescription.length === 0) {
            serviceDescription = serviceName;
        } else {
            serviceDescription = `${serviceName} - ${serviceDescription}`;
        }
        return `${serviceDescription} - [${displays.join(', ')}]`;
    }

    private calculateOfflineColorItemId(environment: ExchangeEnvironment): ColorScheme.ItemId {
        // switch (zenithCode) {
        //     case MarketsConfig.StandardExchangeEnvironmentZenithCode.inferredProduction:
        //     case MarketsConfig.StandardExchangeEnvironmentZenithCode.production:
        //         return ColorScheme.ItemId.Environment_Production_Offline;
        //     case MarketsConfig.StandardExchangeEnvironmentZenithCode.delayed:
        //         return ColorScheme.ItemId.Environment_DelayedProduction_Offline;
        //     case MarketsConfig.StandardExchangeEnvironmentZenithCode.demo:
        //         return ColorScheme.ItemId.Environment_Demo_Offline;
        //     case MarketsConfig.StandardExchangeEnvironmentZenithCode.sample:
        //         return ColorScheme.ItemId.Environment_Sample_Offline;
        //     case MarketsConfig.StandardExchangeEnvironmentZenithCode.test:
        //         return ColorScheme.ItemId.Environment_Test_Offline;
        //     default:
        //         return ColorScheme.ItemId.Environment_NotStandard_Offline;
        // }
        if (environment.production) {
            return ColorScheme.ItemId.Environment_Production_Offline;
        } else {
            return ColorScheme.ItemId.Environment_Demo_Offline;
        }
    }

    private calculateOnlineColorItemId(environment: ExchangeEnvironment): ColorScheme.ItemId {
        // switch (zenithCode) {
        //     case MarketsConfig.StandardExchangeEnvironmentZenithCode.inferredProduction:
        //     case MarketsConfig.StandardExchangeEnvironmentZenithCode.production:
        //         return ColorScheme.ItemId.Environment_Production;
        //     case MarketsConfig.StandardExchangeEnvironmentZenithCode.delayed:
        //         return ColorScheme.ItemId.Environment_DelayedProduction;
        //     case MarketsConfig.StandardExchangeEnvironmentZenithCode.demo:
        //         return ColorScheme.ItemId.Environment_Demo;
        //     case MarketsConfig.StandardExchangeEnvironmentZenithCode.sample:
        //         return ColorScheme.ItemId.Environment_Sample;
        //     case MarketsConfig.StandardExchangeEnvironmentZenithCode.test:
        //         return ColorScheme.ItemId.Environment_Test;
        //     default:
        //         return ColorScheme.ItemId.Environment_NotStandard;
        // }
        if (environment.production) {
            return ColorScheme.ItemId.Environment_Production;
        } else {
            return ColorScheme.ItemId.Environment_Demo;
        }
    }
}
