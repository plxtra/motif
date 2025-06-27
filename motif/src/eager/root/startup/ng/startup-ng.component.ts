import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import {
    AssertInternalError,
    Integer,
    Logger,
    MultiEvent,
    UnreachableCaseError,
    delay1Tick
} from '@pbkware/js-utils';
import {
    PublisherSessionTerminatedReasonId,
    SessionState,
    SessionStateId,
    StringId,
    Strings,
} from '@plxtra/motif-core';
import { ComponentBaseNgDirective } from 'component-ng-api';
import { LogService } from '../../log-service';
import { LogNgService } from '../../ng/log-ng.service';
import { SessionNgService } from '../../ng/session-ng.service';
import { SessionService } from '../../session-service';

@Component({
    selector: 'app-startup',
    templateUrl: './startup-ng.component.html',
    styleUrls: ['./startup-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class StartupNgComponent extends ComponentBaseNgDirective implements OnInit, OnDestroy {
    private static typeInstanceCreateCount = 0;

    public logTextAreaDisplayed = false;
    public log = 'Startup Log';

    private readonly _logService: LogService;
    private readonly _sessionService: SessionService;

    private _markForCheckPending = false;

    private _publisherSessionTerminatedSubscriptionId: MultiEvent.SubscriptionId;

    private _logTextAreaDisplayedSetTimeoutId: ReturnType<typeof setInterval> | undefined;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private readonly _cdr: ChangeDetectorRef,
        logNgService: LogNgService,
        sessionNgService: SessionNgService,
    ) {
        super(elRef, ++StartupNgComponent.typeInstanceCreateCount);

        this._logService = logNgService.service;
        this._sessionService = sessionNgService.session;

        this._publisherSessionTerminatedSubscriptionId = this._sessionService.subscribePublisherSessionTerminatedEvent(
            (reasonId, reasonCode, defaultReasonText) => this.handlePublisherSessionTerminatedEvent(reasonId, reasonCode, defaultReasonText)
        );

        this._logService.setLogEventerForStartup(
            (entry) => this.addLogEntry(entry.time, entry.levelId, entry.text)
        )

        // Delay display of log. Don't want to display unless there is a problem
        this._logTextAreaDisplayedSetTimeoutId = setTimeout(() => this.displayLogTextArea(), 7000);
    }

    ngOnInit() {
        delay1Tick(() => this.checkStart() );
    }

    ngOnDestroy() {
        this.checkClearlogTextAreaDisplayedTimeout();
        this.finalise();
    }

    private handlePublisherSessionTerminatedEvent(
        reasonId: PublisherSessionTerminatedReasonId,
        reasonCode: Integer,
        defaultReasonText: string
    ) {
        let sessionFinishedReason: string;
        switch (reasonId) {
            case PublisherSessionTerminatedReasonId.KickedOff:
                sessionFinishedReason = Strings[StringId.SessionEndedAsLoggedInElsewhere];
                break;
            case PublisherSessionTerminatedReasonId.Other:
                sessionFinishedReason = `${defaultReasonText} [${reasonCode}]`;
                break;
            default:
                throw new UnreachableCaseError('SNCHPSTE10665', reasonId);
        }
        this.addLogEntry(new Date(), Logger.LevelId.Info, sessionFinishedReason);
        this._cdr.markForCheck();
    }

    private handleSessionManagerLogEvent(time: Date, logLevelId: Logger.LevelId, text: string) {
        this.addLogEntry(time, logLevelId, text);
    }

    private checkStart() {
        if (this._sessionService.stateId === SessionStateId.NotStarted) {
            const promise = this._sessionService.start();
            AssertInternalError.throwErrorIfPromiseRejected(promise, 'SNCCS20256');
        } else {
            const logText = `Unexpected startup session state: ${SessionState.idToDisplay(this._sessionService.stateId)}`;
            this.addLogEntry(new Date(), Logger.LevelId.Info, logText);
            this.displayLogTextArea();
        }
    }

    private finalise() {
        this._sessionService.unsubscribePublisherSessionTerminatedEvent(this._publisherSessionTerminatedSubscriptionId);
        this._publisherSessionTerminatedSubscriptionId = undefined;
        this._logService.setLogEventerForStartup(undefined);
    }

    private checkClearlogTextAreaDisplayedTimeout() {
        if (this._logTextAreaDisplayedSetTimeoutId !== undefined) {
            clearTimeout(this._logTextAreaDisplayedSetTimeoutId);
            this._logTextAreaDisplayedSetTimeoutId = undefined;
        }
    }

    private displayLogTextArea() {
        this.checkClearlogTextAreaDisplayedTimeout();
        this.logTextAreaDisplayed = true;
        this._cdr.markForCheck();
    }

    private formatLine(time: Date, logLevel: Logger.LevelId, text: string) {
        return `${time.toLocaleTimeString()}\t${LogService.Level.idToDisplay(logLevel)}\t${text}`;
    }

    private addLogEntry(time: Date, logLevel: Logger.LevelId, text: string) {
        const line = this.formatLine(time, logLevel, text);
        this.log += '\n' + line;
        if (!this._markForCheckPending) {
            // Delay mark for check in case multiple log entries are added.
            this._markForCheckPending = true;
            delay1Tick(() => this.markForCheck())
        }
    }

    private markForCheck() {
        this._markForCheckPending = false;
        this._cdr.markForCheck()
    }
}
