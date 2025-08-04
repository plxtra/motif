import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, ViewContainerRef, inject, viewChild } from '@angular/core';
import { AssertInternalError, delay1Tick } from '@pbkware/js-utils';
import { Badness } from '@plxtra/motif-core';
import { SessionInfoNgService } from 'component-services-ng-api';
import { DelayedBadnessNgComponent } from '../../delayed-badness/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { ContentNgService } from '../../ng/content-ng.service';
import { ZenithStatusFrame } from '../zenith-status-frame';

@Component({
    selector: 'app-zenith-status',
    templateUrl: './zenith-status-ng.component.html',
    styleUrls: ['./zenith-status-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ZenithStatusNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit, ZenithStatusFrame.ComponentAccess {
    private static typeInstanceCreateCount = 0;

    public endpoints: readonly string[];

    public publisherOnline: string;
    // public publisherOnlineChangeHistory: ZenithExtConnectionDataItem.PublisherOnlineChange[] = [];
    public publisherStateId: string;
    public waitId: string;
    public lastReconnectReasonId: string;
    public sessionKickedOff: string;

    public selectedEndpoint: string;

    public authExpiryTime: string;
    public authFetchSuccessiveFailureCount: string;
    public socketConnectingSuccessiveErrorCount: string;
    public zenithTokenFetchSuccessiveFailureCount: string;
    public zenithTokenRefreshSuccessiveFailureCount: string;
    public socketClosingSuccessiveErrorCount: string;
    public socketShortLivedClosedSuccessiveErrorCount: string;
    public unexpectedSocketCloseCount: string;
    public timeoutCount: string;
    public lastTimeoutStateId: string;
    public receivePacketCount: string;
    public sendPacketCount: string;
    public internalSubscriptionErrorCount: string;
    public requestTimeoutSubscriptionErrorCount: string;
    public offlinedSubscriptionErrorCount: string;
    public publishRequestErrorSubscriptionErrorCount: string;
    public subscriptionWarningCount: string;
    public subscriptionErrorCount: string;
    public dataErrorSubscriptionErrorCount: string;
    public dataNotAvailableSubscriptionErrorCount: string;
    public serverWarningSubscriptionErrorCount: string;

    public serverName: string;
    public serverClass: string;
    public softwareVersion: string;
    public protocolVersion: string;

    private readonly _cdr = inject(ChangeDetectorRef);

    private readonly _delayedBadnessComponentSignal = viewChild.required<DelayedBadnessNgComponent>('delayedBadness');

    private readonly _frame: ZenithStatusFrame;

    private _delayedBadnessComponent: DelayedBadnessNgComponent;

    constructor() {
        super(++ZenithStatusNgComponent.typeInstanceCreateCount);

        const contentService = inject(ContentNgService);
        const sessionInfoNgService = inject(SessionInfoNgService);

        this._frame = contentService.createZenithStatusFrame(this, sessionInfoNgService.service.zenithEndpoints);
    }

    ngOnDestroy(): void {
        this._frame.finalise();
    }

    ngAfterViewInit(): void {
        this._delayedBadnessComponent = this._delayedBadnessComponentSignal();

        delay1Tick(() => {
            this._frame.initialise();

            this.endpoints = this._frame.endpoints;

            this.processPublisherOnlineChange();
            this.processPublisherStateChange();
            this.processReconnect();
            this.processSessionKickedOff();
            this.processSelectedEndpointChanged();
            this.processCounter();
            this.processServerInfoChange();
        });
    }

    public notifyPublisherOnlineChange() {
        this.processPublisherOnlineChange();
    }

    public notifyPublisherStateChange() {
        this.processPublisherStateChange();
    }

    public notifyReconnect() {
        this.processReconnect();
    }

    public notifySessionKickedOff() {
        this.processSessionKickedOff();
    }

    public notifySelectedEndpointChanged() {
        this.processSelectedEndpointChanged();
    }

    public notifyCounter() {
        this.processCounter();
    }

    public notifyServerInfoChanged() {
        this.processServerInfoChange();
    }

    public setBadness(value: Badness) {
        this._delayedBadnessComponent.setBadness(value);
    }

    public hideBadnessWithVisibleDelay(badness: Badness) {
        this._delayedBadnessComponent.hideWithVisibleDelay(badness);
    }

    private processPublisherOnlineChange() {
        this.publisherOnline = this._frame.publisherOnline;

        this._cdr.markForCheck();
    }

    private processPublisherStateChange() {
        this.publisherStateId = this._frame.publisherStateId;
        this.waitId = this._frame.waitId;

        this._cdr.markForCheck();
    }

    private processReconnect() {
        this.lastReconnectReasonId = this._frame.lastReconnectReasonId;

        this._cdr.markForCheck();
    }

    private processSessionKickedOff() {
        this.sessionKickedOff = this._frame.sessionKickedOff;

        this._cdr.markForCheck();
    }

    private processSelectedEndpointChanged() {
        const selectedEndpoint = this._frame.selectedEndpoint;
        if (selectedEndpoint !== this.selectedEndpoint) {
            this.selectedEndpoint = selectedEndpoint;
            this._cdr.markForCheck();
        }
    }

    private processCounter() {
        this.authExpiryTime = this._frame.authExpiryTime;
        this.authFetchSuccessiveFailureCount = this._frame.authFetchSuccessiveFailureCount;
        this.socketConnectingSuccessiveErrorCount = this._frame.socketConnectingSuccessiveErrorCount;
        this.zenithTokenFetchSuccessiveFailureCount = this._frame.zenithTokenFetchSuccessiveFailureCount;
        this.zenithTokenRefreshSuccessiveFailureCount = this._frame.zenithTokenRefreshSuccessiveFailureCount;
        this.socketClosingSuccessiveErrorCount = this._frame.socketClosingSuccessiveErrorCount;
        this.socketShortLivedClosedSuccessiveErrorCount = this._frame.socketShortLivedClosedSuccessiveErrorCount;
        this.unexpectedSocketCloseCount = this._frame.unexpectedSocketCloseCount;
        this.timeoutCount = this._frame.timeoutCount;
        this.lastTimeoutStateId = this._frame.lastTimeoutStateId;
        this.receivePacketCount = this._frame.receivePacketCount;
        this.sendPacketCount = this._frame.sendPacketCount;
        this.internalSubscriptionErrorCount = this._frame.internalSubscriptionErrorCount;
        this.requestTimeoutSubscriptionErrorCount = this._frame.requestTimeoutSubscriptionErrorCount;
        this.offlinedSubscriptionErrorCount = this._frame.offlinedSubscriptionErrorCount;
        this.publishRequestErrorSubscriptionErrorCount = this._frame.publishRequestErrorSubscriptionErrorCount;
        this.subscriptionWarningCount = this._frame.subscriptionWarningCount;
        this.subscriptionErrorCount = this._frame.subscriptionErrorCount;
        this.dataErrorSubscriptionErrorCount = this._frame.dataErrorSubscriptionErrorCount;
        this.dataNotAvailableSubscriptionErrorCount = this._frame.dataNotAvailableSubscriptionErrorCount;
        this.serverWarningSubscriptionErrorCount = this._frame.serverWarningSubscriptionErrorCount;

        this._cdr.markForCheck();
    }

    private processServerInfoChange() {
        this.serverName = this._frame.serverName;
        this.serverClass = this._frame.serverClass;
        this.softwareVersion = this._frame.softwareVersion;
        this.protocolVersion = this._frame.protocolVersion;

        this._cdr.markForCheck();
    }
}

export namespace ZenithStatusNgComponent {
    export function create(container: ViewContainerRef) {
        container.clear();
        const componentRef = container.createComponent(ZenithStatusNgComponent);
        const instance = componentRef.instance;
        if (!(instance instanceof ZenithStatusNgComponent)) {
            throw new AssertInternalError('ZSCCI339212772');
        } else {
            return instance;
        }
    }
}
