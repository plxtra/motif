import { isDevMode } from '@angular/core';
import {
    CommaText,
    Integer,
    JsonElement,
    Logger,
    mSecsPerSec,
    MultiEvent,
} from '@pbkware/js-utils';
import {
    AdiService,
    AppStorageService,
    CapabilitiesService,
    ErrorCode,
    JsonElementErr,
    KeyValueStore,
    MarketsService,
    MotifServicesError,
    MotifServicesService,
    NotificationChannelsService,
    PublisherSessionTerminatedReasonId,
    ScansService,
    SessionInfoService,
    SessionState,
    SessionStateId,
    SettingsService,
    StringId,
    Strings,
    SymbolsService,
    UserAlertService,
    ZenithExtConnectionDataDefinition,
    ZenithExtConnectionDataItem,
    ZenithPublisherReconnectReason,
    ZenithPublisherReconnectReasonId,
    ZenithPublisherState,
    ZenithPublisherStateId,
    ZenithPublisherSubscriptionManager
} from '@plxtra/motif-core';
import { HideUnloadSaveService, SignOutService } from 'component-services-internal-api';
import { ExtensionsService } from 'extensions-internal-api';
import { Version } from 'generated-internal-api';
import { WorkspaceService } from 'workspace-internal-api';
import { Config } from './config';
import { LogService } from './log-service';
import { OpenIdService } from './open-id-service';
import { TelemetryService } from './telemetry-service';

export class SessionService {
    authenticatedEvent: SessionService.AuthenticatedEvent;
    startupOnlineEvent: SessionService.OnlineEvent | undefined;

    private _stateId = SessionStateId.NotStarted;

    private _serviceName: string;
    private _serviceDescription: string | undefined;
    private _serviceOperator: string;

    private _motifServicesEndpoint: string;

    private _infoService: SessionInfoService = new SessionInfoService();

    private _useLocalStateStorage: boolean;
    private _motifServicesEndpoints: readonly string[];
    private _zenithEndpoints: readonly string[];

    private _sequentialZenithReconnectionWarningCount = 0;

    private _stateChangeMultiEvent = new MultiEvent<SessionService.StateChangeEventHandler>();
    private _publisherSessionTerminatedMultiEvent = new MultiEvent<SessionService.PublisherSessionTerminatedEventHandler>();

    private _zenithExtConnectionDataItem: ZenithExtConnectionDataItem | undefined;
    private _zenithPublisherOnlineChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _zenithFeedStateChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _zenithReconnectSubscriptionId: MultiEvent.SubscriptionId;
    private _zenithCounterSubscriptionId: MultiEvent.SubscriptionId;
    private _publisherSessionTerminatedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        private readonly _config: Config,
        private readonly _logService: LogService,
        private readonly _telemetryService: TelemetryService,
        private readonly _userAlertService: UserAlertService,
        private readonly _settingsService: SettingsService,
        private readonly _openIdService: OpenIdService,
        private readonly _capabilitiesService: CapabilitiesService,
        private readonly _motifServicesService: MotifServicesService,
        private readonly _appStorageService: AppStorageService,
        private readonly _extensionService: ExtensionsService,
        private readonly _workspaceService: WorkspaceService,
        private readonly _adiService: AdiService,
        private readonly _marketsService: MarketsService,
        private readonly _symbolsService: SymbolsService,
        private readonly _notificationChannelsService: NotificationChannelsService,
        private readonly _scansService: ScansService,
        private readonly _hideUnloadSaveService: HideUnloadSaveService,
        private readonly _signoutService: SignOutService,
    ) {
        this._openIdService.logErrorEvent = (text) => this.logError(text);
        this._openIdService.userLoadedEvent = () => this.handleUserLoadedEvent();
        this._signoutService.signOutEvent = () => this.handleSignOut();
        this._hideUnloadSaveService.registerSaveManagement(this._settingsService);
    }

    get serviceName() { return this._serviceName; }
    get serviceDescription() { return this._serviceDescription; }

    get infoService() { return this._infoService; }

    get stateId() { return this._stateId; }
    get zenithEndpoints() { return this._zenithEndpoints; }
    get running() { return this._stateId === SessionStateId.Offline || this._stateId === SessionStateId.Online; }
    get final() { return this._stateId === SessionStateId.Finalising || this._stateId === SessionStateId.Finalised; }

    get userId() { return this._openIdService.userId; }
    get username() { return this._openIdService.username; }
    get userFullName() { return this._openIdService.userFullName; }

    startAuthentication() {
        this.applyConfig();
        this._openIdService.startAuthentication();
    }

    async completeAuthentication() {
        this.applyConfig();
        await this._openIdService.completeAuthentication();
        this.authenticatedEvent();
    }

    isLoggedIn(): boolean {
        return this._openIdService.isLoggedIn();
    }

    getAuthorizationHeaderValue(): string {
        return this._openIdService.getAuthorizationHeaderValue();
    }

    async start() {
        this.applyConfig();

        this.setStateId(SessionStateId.Starting);
        this.logInfo(`${Strings[StringId.Version]}: ${Version.app}`);
        this.logInfo(`${Strings[StringId.Service]}: ${this._config.service.name}`);
        this.logInfo(`ProdMode: ${isDevMode() ? 'False' : 'True'}`);
        this.logInfo(`Zenith Endpoint: ${CommaText.fromStringArray(this._zenithEndpoints)}`);

        this.logInfo('Starting ADI');
        this._adiService.start();
        this.logInfo('Connecting to Zenith');
        const zenithExtConnectionDataItem = this.subscribeZenithExtConnection();
        this.logInfo('Starting Markets service');
        await this._marketsService.start(this._config.marketsConfig);
        this.logInfo(`Environment: ${this._marketsService.defaultExchangeEnvironment.display}`);

        let storageTypeId: AppStorageService.TypeId;
        if (this._useLocalStateStorage) {
            this.logInfo('State Storage: Local');
            storageTypeId = AppStorageService.TypeId.Local;
        } else {
            if (this._motifServicesEndpoints.length === 0) {
                throw new MotifServicesError(ErrorCode.SSSMSE19774);
            } else {
                this.logInfo('State Storage: MotifServices');
                this._motifServicesEndpoint = this._motifServicesEndpoints[0];
                this.logInfo(`MotifServices Endpoint: ${this._motifServicesEndpoint}`);
                this._motifServicesService.initialise(
                    this._motifServicesEndpoint,
                    () => this.getAuthorizationHeaderValue()
                );
                storageTypeId = AppStorageService.TypeId.MotifServices;
            }
        }
        await this._settingsService.loadMasterSettings(); // can load this before app storage initialised as directly uses Motif Storage
        this._appStorageService.initialise(storageTypeId, this._serviceOperator, this._motifServicesEndpoint, () => this.getAuthorizationHeaderValue());

        await this.processLoadSettings();
        this.processLoadExtensions();

        this.logInfo('Initialising Scans service');
        this._symbolsService.initialise();
        this.logInfo('Initialising Notification Channels service');
        this._notificationChannelsService.initialise();
        this.logInfo('Initialising Scans service');
        this._scansService.initialise();
        if (zenithExtConnectionDataItem.publisherOnline) {
            this.setStateId(SessionStateId.Online);
        } else {
            this.setStateId(SessionStateId.Offline);
        }
        if (this.startupOnlineEvent !== undefined) {
            this.startupOnlineEvent();
        }
    }

    signOut() {
        this.finalise();
        this._openIdService.signOut();
    }

    finalise() {
        if (!this.final) {
            this.setStateId(SessionStateId.Finalising);

            this._openIdService.finalise();
            this._adiService.stop();
            this._symbolsService.finalise();
            this._notificationChannelsService.finalise();
            this._scansService.finalise();

            this.unsubscribeZenithExtConnection();

            this._hideUnloadSaveService.deregisterSaveManagement(this._settingsService);
            this.setStateId(SessionStateId.Finalised);
        }
    }

    subscribeStateChangeEvent(handler: SessionService.StateChangeEventHandler) {
        return this._stateChangeMultiEvent.subscribe(handler);
    }

    unsubscribeStateChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void {
        this._stateChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribePublisherSessionTerminatedEvent(handler: SessionService.PublisherSessionTerminatedEventHandler) {
        return this._publisherSessionTerminatedMultiEvent.subscribe(handler);
    }

    unsubscribePublisherSessionTerminatedEvent(subscriptionId: MultiEvent.SubscriptionId): void {
        this._publisherSessionTerminatedMultiEvent.unsubscribe(subscriptionId);
    }

    private setServiceName(value: string) {
        this._serviceName = value;
        this._infoService.serviceName = value;
    }

    private setServiceDescription(value: string | undefined) {
        this._serviceDescription = value;
        this._infoService.serviceDescription = value;
    }

    private setServiceOperatorId(value: string) {
        this._serviceOperator = value;
        this._infoService.serviceOperator = value;
    }

    private setDiagnostics(diagnostics: Config.Diagnostics) {
        this._infoService.setDiagnostics(
            diagnostics.fullDepthDebugLoggingEnabled,
            diagnostics.fullDepthConsistencyCheckingEnabled
        );
    }

    private setZenithEndpoints(value: readonly string[]) {
        this._zenithEndpoints = value;
        this._infoService.zenithEndpoints = value;
    }

    private handleUserLoadedEvent() {
        const userId = this._openIdService.userId;
        const username = this._openIdService.username;
        const userFullName = this._openIdService.userFullName;

        this._infoService.userId = userId;
        this._infoService.username = this._openIdService.username;
        this._infoService.userFullName = this._openIdService.userFullName;
        this._infoService.userAccessTokenExpiryTime = this._openIdService.userAccessTokenExpiryTime;

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const telemetryUsername = username ?? userFullName ?? userId;
        this._telemetryService.setUser(userId, telemetryUsername);

        const accessToken = this._openIdService.accessToken;
        if (this._zenithExtConnectionDataItem !== undefined && accessToken !== OpenIdService.invalidAccessToken) {
            this._zenithExtConnectionDataItem.updateAccessToken(accessToken);
        }
    }

    private handleZenithPublishOnlineChangeEvent(online: boolean): void {
        if (!this.final) {
            if (online) {
                this._sequentialZenithReconnectionWarningCount = 0;
                if (this.running) {
                    this.setStateId(SessionStateId.Online);
                }
            } else {
                if (this.running) {
                    this.setStateId(SessionStateId.Offline);
                }
            }
        }
    }

    private handleZenithStateChangeEvent(stateId: ZenithPublisherStateId, waitId: Integer): void {
        const logText = `Zenith State: ${ZenithPublisherState.idToDisplay(stateId)} (${waitId})`;
        this.logInfo(logText);
    }

    private handleZenithReconnectEvent(reconnectReasonId: ZenithPublisherReconnectReasonId): void {
        let logText = `Zenith Reconnection: ${ZenithPublisherReconnectReason.idToDisplay(reconnectReasonId)}`;
        if (ZenithPublisherReconnectReason.idToNormal(reconnectReasonId)) {
            this.logInfo(logText);
        } else {
            switch (this._sequentialZenithReconnectionWarningCount) {
                case 0:
                    this.logWarning(logText);
                    this._sequentialZenithReconnectionWarningCount++;
                    break;
                case 1:
                    logText += ' (more than one)';
                    this.logWarning(logText);
                    this._sequentialZenithReconnectionWarningCount++;
                    break;
                default:
                    // only log 2 warnings until success
            }
        }
    }

    private handleZenithCounterEvent() {
        // TBD
    }

    private handlePublisherSessionTerminatedEvent(
        reasonId: PublisherSessionTerminatedReasonId,
        reasonCode: Integer,
        defaultReasonText: string
    ) {
        this.notifyPublisherSessionTerminated(reasonId, reasonCode, defaultReasonText);
    }

    private handleSignOut() {
        this.signOut();
    }

    private notifyStateChange() {
        const handlers = this._stateChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](this.stateId);
        }
    }

    private notifyPublisherSessionTerminated(
        reasonId: PublisherSessionTerminatedReasonId,
        reasonCode: Integer,
        defaultReasonText: string
    ) {
        const handlers = this._publisherSessionTerminatedMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](reasonId, reasonCode, defaultReasonText);
        }
    }

    private log(logLevelId: Logger.LevelId, text: string) {
        window.motifLogger.log(logLevelId, text);
        // this.notifyConsolidatedLog(new Date(), logLevelId, text);
    }

    private logInfo(text: string) {
        this.log(Logger.LevelId.Info, text);
    }

    private logWarning(text: string) {
        this.log(Logger.LevelId.Warning, text);
    }

    private logError(text: string) {
        this.log(Logger.LevelId.Error, text);
    }

    private applyConfig() {
        const config = this._config;
        this.setServiceName(config.service.name);
        this.setServiceDescription(config.service.description);
        this.setServiceOperatorId(config.service.operator);
        this.setDiagnostics(config.diagnostics);

        this._capabilitiesService.setDiagnosticToolsEnabled(config.diagnostics.toolsEnabled);
        this._capabilitiesService.setAdvertisingEnabled(config.capabilities.advertising);
        this._capabilitiesService.setDtrEnabled(config.capabilities.dtr);

        this._telemetryService.applyConfig(config);
        this._userAlertService.enabled = config.diagnostics.appNotifyErrors;

        this._adiService.dataMgr.dataSubscriptionCachingEnabled = !config.diagnostics.dataSubscriptionCachingDisabled;
        ZenithPublisherSubscriptionManager.logLevelId = config.diagnostics.zenithLogLevelId;

        this._useLocalStateStorage = config.diagnostics.motifServicesBypass.useLocalStateStorage;
        this._motifServicesEndpoints = config.endpoints.motifServices;
        this.setZenithEndpoints(config.endpoints.zenith);

        this._openIdService.applyConfig(config);

        this._infoService.defaultLayout = config.defaultLayout;
        this._extensionService.setBundled(config.bundledExtensions);
    }

    private setStateId(stateId: SessionStateId) {
        if (stateId !== this.stateId) {
            this._stateId = stateId;
            this.logInfo(`Session state: ${SessionState.idToDisplay(stateId)}`);
            this.notifyStateChange();

            this._infoService.stateId = stateId;
        }
    }

    private async processLoadSettings() {
        if (!this.final) {
            this.logInfo('Retrieving Settings');
            const [userSettingsGetResult, operatorSettingsGetResult] = await Promise.all([
                this._appStorageService.getItem(KeyValueStore.Key.Settings, false),
                this._appStorageService.getItem(KeyValueStore.Key.Settings, true)
            ]);

            let userElement: JsonElement | undefined;
            if (userSettingsGetResult.isErr()) {
                this.logWarning(`Settings: Error retrieving user settings: "${userSettingsGetResult.error}". Using defaults`);
                userElement = undefined;
            } else {
                const userSettings = userSettingsGetResult.value;
                if (userSettings === undefined || userSettings === '') {
                    this.logWarning('Settings: User settings not specified. Using defaults');
                    userElement = undefined;
                } else {
                    this.logInfo('Parsing Settings');
                    userElement = new JsonElement();
                    const parseResult = userElement.parse(userSettings);
                    if (parseResult.isErr()) {
                        const errorCode = JsonElementErr.errorIdToCode(parseResult.error)
                        this.logWarning(`Settings: Could not parse saved user settings. Using defaults. [${errorCode}]`);
                        userElement = undefined;
                    }
                }
            }

            let operatorElement: JsonElement | undefined;
            if (operatorSettingsGetResult.isErr()) {
                this.logWarning(`Settings: Error retrieving operator settings: "${operatorSettingsGetResult.error}". Using defaults`);
                operatorElement = undefined;
            } else {
                const operatorSettings = operatorSettingsGetResult.value;
                if (operatorSettings === undefined || operatorSettings === '') {
                    this.logWarning('Settings: Operator settings not specified. Using defaults');
                    operatorElement = undefined;
                } else {
                    this.logInfo('Parsing Settings');
                    operatorElement = new JsonElement();
                    const parseResult = operatorElement.parse(operatorSettings);
                    if (parseResult.isErr()) {
                        const errorCode = JsonElementErr.errorIdToCode(parseResult.error)
                        this.logWarning(`Settings: Could not parse saved operator settings. Using defaults. [${errorCode}]`);
                        operatorElement = undefined;
                    }
                }
            }

            this._settingsService.load(userElement, operatorElement);
        }
    }

    private processLoadExtensions() {
        this.logInfo('Retrieving Extensions');
        this._extensionService.processBundled();
        // const loadedExtensions = await this._appStorageService.getItem(AppStorageService.Key.LoadedExtensions);
        // if (!this.final) {
        //     if (loadedExtensions === undefined) {
        //         this.logWarning('Loaded Extensions setting not found. No extensions loaded');
        //     } else {
        //         this.logInfo('Loading Extensions');
        //         const rootElement = new JsonElement();
        //         const success = rootElement.parse(loadedExtensions, 'Load Settings');
        //         if (!success) {
        //             this.logWarning('Could not parse loadedExtensions settings. No extensions loaded');
        //         } else {
        //             // this._extensionsService.load(rootElement);
        //         }
        //     }
        // }
    }

    private subscribeZenithExtConnection() {
        const zenithExtConnectionDataDefinition = new ZenithExtConnectionDataDefinition();
        zenithExtConnectionDataDefinition.initialAuthAccessToken = this._openIdService.accessToken;
        zenithExtConnectionDataDefinition.zenithWebsocketEndpoints = this._zenithEndpoints;

        const zenithExtConnectionDataItem = this._adiService.subscribe(zenithExtConnectionDataDefinition) as ZenithExtConnectionDataItem;
        this._zenithExtConnectionDataItem = zenithExtConnectionDataItem;

        this._zenithPublisherOnlineChangeSubscriptionId = zenithExtConnectionDataItem.subscribePublisherOnlineChangeEvent(
            (online) => this.handleZenithPublishOnlineChangeEvent(online)
        );

        this._zenithFeedStateChangeSubscriptionId = zenithExtConnectionDataItem.subscribePublisherStateChangeEvent(
            (stateId, waitId) => { this.handleZenithStateChangeEvent(stateId, waitId); }
        );

        this._zenithReconnectSubscriptionId = zenithExtConnectionDataItem.subscribeZenithReconnectEvent(
            (reconnectReasonId) => { this.handleZenithReconnectEvent(reconnectReasonId); }
        );

        this._zenithCounterSubscriptionId = zenithExtConnectionDataItem.subscribeZenithCounterEvent(
            () => { this.handleZenithCounterEvent(); }
        );

        this._publisherSessionTerminatedSubscriptionId = zenithExtConnectionDataItem.subscribeZenithSessionTerminatedEvent(
            (reasonId, reasonCode, defaultReasonText) => {
                this.handlePublisherSessionTerminatedEvent(reasonId, reasonCode, defaultReasonText);
            }
        );

        return zenithExtConnectionDataItem;
    }

    private unsubscribeZenithExtConnection() {
        if (this._zenithExtConnectionDataItem !== undefined) {
            this._zenithExtConnectionDataItem.unsubscribePublisherOnlineChangeEvent(this._zenithPublisherOnlineChangeSubscriptionId);
            this._zenithPublisherOnlineChangeSubscriptionId = undefined;

            this._zenithExtConnectionDataItem.unsubscribePublisherStateChangeEvent(this._zenithFeedStateChangeSubscriptionId);
            this._zenithFeedStateChangeSubscriptionId = undefined;

            this._zenithExtConnectionDataItem.unsubscribeZenithReconnectEvent(this._zenithReconnectSubscriptionId);
            this._zenithReconnectSubscriptionId = undefined;

            this._zenithExtConnectionDataItem.unsubscribeZenithCounterEvent(this._zenithCounterSubscriptionId);
            this._zenithCounterSubscriptionId = undefined;

            this._zenithExtConnectionDataItem.unsubscribeZenithSessionTerminatedEvent(this._publisherSessionTerminatedSubscriptionId);
            this._publisherSessionTerminatedSubscriptionId = undefined;

            this._adiService.unsubscribe(this._zenithExtConnectionDataItem);
            this._zenithExtConnectionDataItem = undefined;
        }
    }
}

export namespace SessionService {
    export type AuthenticatedEvent = (this: void) => void;
    export type OnlineEvent = (this: void) => void;
    export type TNotifyEventHandler = (this: void) => void;
    export type StateChangeEventHandler = (stateId: SessionStateId) => void;
    export type PublisherSessionTerminatedEventHandler = (
        this: void, reasonId: PublisherSessionTerminatedReasonId, reasonCode: Integer, defaultReasonText: string
    ) => void;
    export type ConsolidatedLogEventHandler = (time: Date, logLevelId: Logger.LevelId, text: string) => void;

    export const motifServicesGetClientConfigurationRetryDelaySpan = 30 * mSecsPerSec;
    export const getSettingsRetryDelaySpan = 30 * mSecsPerSec;
}
