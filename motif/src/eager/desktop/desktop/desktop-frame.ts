import {
    AssertInternalError, DecimalFactory, Err,
    getErrorMessage,
    Integer,
    Json,
    JsonElement,
    JsonValue,
    Logger,
    mSecsPerSec,
    MultiEvent,
    Ok,
    Result
} from '@pbkware/js-utils';
import { UiAction } from '@pbkware/ui-action';
import {
    AdiService,
    AppStorageService,
    BrokerageAccountGroup,
    CapabilitiesService,
    Command,
    CommandContext,
    CommandRegisterService,
    CommandUiAction,
    DataIvemId,
    ExtensionHandle,
    IdleService,
    InternalCommand,
    KeyboardService,
    KeyValueStore,
    MarketOrderId,
    MarketsService,
    OrderPad,
    OrderRequestTypeId,
    SaveManagement,
    SettingsService,
    SingleBrokerageAccountGroup,
    StringId,
    Strings,
    SymbolDetailCacheService,
    UserAlertService
} from '@plxtra/motif-core';
import { HideUnloadSaveService, SignOutService, ToastService } from 'component-services-internal-api';
import { ExtensionsAccessService } from 'content-internal-api';
import { MenuBarService } from 'controls-internal-api';
import { BrandingSplashWebPageDitemFrame, BuiltinDitemFrame, DitemFrame, ExtensionDitemFrame, OrderRequestDitemFrame } from 'ditem-internal-api';
import { BuiltinDitemNgComponentBaseNgDirective } from 'ditem-ng-api';
import { LayoutConfig } from 'golden-layout';
import { GoldenLayoutHostFrame } from '../golden-layout-host/golden-layout-host-frame';

export class DesktopFrame implements DitemFrame.DesktopAccessService, SaveManagement {
    private static readonly XmlTag_HistoricalAccountIds = 'HistoricalAccountIds';
    private static readonly DefaultMaxHistoricalAccountIdCount = 15;

    initialLoadedEvent: DitemFrame.DesktopAccessService.InitialLoadedEvent;

    private _goldenLayoutHostFrame: GoldenLayoutHostFrame;

    private _activeLayoutName: string | undefined;
    private _layoutSaveRequestPromise: Promise<Result<void> | undefined> | undefined;
    private _lastLayoutSaveFailed = false;

    private _frames: DitemFrame[] = [];
    private _primaryFrames: DitemFrame[] = [];

    private _dataIvemId: DataIvemId | undefined;
    private _dataIvemIdAppLinked = false;
    private _brokerageAccountGroup: BrokerageAccountGroup | undefined;
    private _brokerageAccountGroupAppLinked = false;

    private _lastSingleBrokerageAccountGroup: SingleBrokerageAccountGroup | undefined;

    private _brokerageAccountGroupOrDataIvemIdSettingCount: Integer = 0;

    private _historicalAccountIds: string[] = [];
    private _maxHistoricalAccountIdCount: Integer = DesktopFrame.DefaultMaxHistoricalAccountIdCount;

    private _lastFocusedFrame: DitemFrame | undefined;
    private _lastFocusedDataIvemId: DataIvemId | undefined;
    private _lastFocusedBrokerageAccountGroup: BrokerageAccountGroup | undefined;
    private _lastFocusedSingleBrokerageAccountGroup: BrokerageAccountGroup | undefined;

    private _prevFocusedFrame: DitemFrame | undefined;
    private _prevFrameLastFocusedDataIvemId: DataIvemId | undefined;
    private _prevFrameLastFocusedBrokerageAccountGroup: BrokerageAccountGroup | undefined;
    private _prevFrameLastFocusedSingleBrokerageAccountGroup: BrokerageAccountGroup | undefined;

    private _saveLayoutDataIvemIdsAndBrokerageAccountGroups = true;

    private _dataIvemIdChangeMultiEvent = new MultiEvent<DesktopFrame.DataIvemIdChangeEventHandler>();
    private _brokerageAccountGroupChangeMultiEvent = new MultiEvent<DesktopFrame.BrokerageAccountGroupChangeEventHandler>();
    private _beginSaveWaitingMultiEvent = new MultiEvent<SaveManagement.SaveWaitingEventHandler>();
    private _endSaveWaitingMultiEvent = new MultiEvent<SaveManagement.SaveWaitingEventHandler>();

    private _commandContext: CommandContext;

    private _newPlaceholderDitemUiAction: CommandUiAction;
    private _newExtensionsDitemUiAction: CommandUiAction;
    private _newSymbolsDitemUiAction: CommandUiAction;
    private _newDepthAndTradesDitemUiAction: CommandUiAction;
    private _newWatchlistDitemUiAction: CommandUiAction;
    private _newDepthDitemUiAction: CommandUiAction;
    private _newNewsHeadlinesDitemUiAction: CommandUiAction;
    private _newNewsBodyDitemUiAction: CommandUiAction;
    private _newScansDitemUiAction: CommandUiAction;
    private _newNotificationChannelsDitemUiAction: CommandUiAction;
    private _newAlertsDitemUiAction: CommandUiAction;
    private _newSearchDitemUiAction: CommandUiAction;
    private _newAdvertWebPageDitemUiAction: CommandUiAction;
    private _newTopShareholdersDitemUiAction: CommandUiAction;
    private _newStatusDitemUiAction: CommandUiAction;
    private _newTradesDitemUiAction: CommandUiAction;
    private _newOrderRequestDitemUiAction: CommandUiAction;
    private _newBrokerageAccountsDitemUiAction: CommandUiAction;
    private _newOrdersDitemUiAction: CommandUiAction;
    private _newOrderAuthoriseDitemUiAction: CommandUiAction;
    private _newHoldingsDitemUiAction: CommandUiAction;
    private _newBalancesDitemUiAction: CommandUiAction;
    private _newSettingsDitemUiAction: CommandUiAction;
    private _newDiagnosticsDitemUiAction: CommandUiAction;
    private _newEtoPriceQuotationDitemUiAction: CommandUiAction;

    private _newBuyOrderRequestDitemUiAction: CommandUiAction;
    private _newSellOrderRequestDitemUiAction: CommandUiAction;

    private _saveLayoutUiAction: CommandUiAction;
    private _resetLayoutUiAction: CommandUiAction;
    private _signOutUiAction: CommandUiAction;

    private _newExtensionsDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newSymbolsDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newDepthAndTradesDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newWatchlistDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newDepthDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newNewsHeadlinesDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newScansDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newNotificationChannelsDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newAlertsDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newSearchDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newAdvertWebPageDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newStatusDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newTradesDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newBrokerageAccountsDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newOrdersDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newOrderAuthoriseDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newHoldingsDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newBalancesDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newBuyOrderRequestDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newSellOrderRequestDitemMenuItem: MenuBarService.CommandMenuItem;
    private _saveLayoutMenuItem: MenuBarService.CommandMenuItem;
    private _resetLayoutMenuItem: MenuBarService.CommandMenuItem;
    private _newSettingsDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newDiagnosticsDitemMenuItem: MenuBarService.CommandMenuItem;

    private _requestGlobalLinkedDataIvemIdEvent: DesktopFrame.RequestAppLinkedDataIvemIdEvent;
    private _requestGlobalLinkedBrokerageAccountGroupEvent: DesktopFrame.RequestAppLinkedBrokerageAccountGroupEvent;

    private _newDisplayEvent: DesktopFrame.TNewDisplayEvent;
    private _openDisplayEvent: DesktopFrame.TOpenDisplayEvent;
    private _closeDisplayEvent: DesktopFrame.TCloseDisplayEvent;
    private _printDesktopEvent: DesktopFrame.TPrintDesktopEvent;

    private _dataIvemIdChangedEvent = new DesktopFrame.TDataIvemIdChangedEvent();

    // editOrderRequestFromMarketOrderIdEvent: DesktopFrame.EditOrderRequestFromMarketOrderIdEvent;

    constructor(
        frameHtmlElement: HTMLElement,
        private readonly _decimalFactory: DecimalFactory,
        private readonly _toastService: ToastService,
        private readonly _idleService: IdleService,
        private readonly _storage: AppStorageService,
        private readonly _settingsService: SettingsService,
        private readonly _marketsService: MarketsService,
        private readonly _userAlertService: UserAlertService,
        private readonly _capabilitiesService: CapabilitiesService,
        private readonly _extensionsAccessService: ExtensionsAccessService,
        private readonly _symbolDetailCacheService: SymbolDetailCacheService,
        private readonly _adiService: AdiService,
        private readonly _signOutService: SignOutService,
        private readonly _menuBarService: MenuBarService,
        private readonly _commandRegisterService: CommandRegisterService,
        private readonly _keyboardService: KeyboardService,
        private readonly _hideUnloadSaveService: HideUnloadSaveService,
        private readonly _startupSplashWebPageDefined: boolean,
        private readonly _getBuiltinDitemFrameFromComponent: DesktopFrame.GetBuiltinDitemFrameFromComponent,
    ) {
        this._commandContext = this.createCommandContext(frameHtmlElement);
        this.createUiActions();
        this._hideUnloadSaveService.registerSaveManagement(this);
    }

    get historicalAccountIds(): string[] { return this._historicalAccountIds; }
    get FrameCount(): Integer { return this.getFrameCount(); }

    get dataIvemId() { return this._dataIvemId; }
    get brokerageAccountGroup() { return this._brokerageAccountGroup; }

    get lastSingleBrokerageAccountGroup() { return this._lastSingleBrokerageAccountGroup; }

    get lastFocusedDataIvemIdValid() { return this.getLastFocusedDataIvemIdValid(); }
    get lastFocusedDataIvemId() { return this._lastFocusedDataIvemId; }

    get prevFrameLastFocusedDataIvemIdValid() { return this.getPrevFrameLastFocusedDataIvemIdValid(); }
    get PrevFrameLastFocusedDataIvemId() { return this._prevFrameLastFocusedDataIvemId; }

    get lastFocusedAccountAggregationValid() { return this.getLastFocusedAccountIdValid(); }
    get lastFocusedBrokerageAccountGroup() { return this._lastFocusedBrokerageAccountGroup; }

    get prevFrameLastFocusedBrokerageAccountGroupValid() { return this._prevFrameLastFocusedBrokerageAccountGroup !== undefined; }
    get prevFrameLastFocusedBrokerageAccountGroup() { return this._prevFrameLastFocusedBrokerageAccountGroup; }

    get prevFrameLastFocusedSingleBrokerageAccountGroupValid() {
        return this._prevFrameLastFocusedSingleBrokerageAccountGroup !== undefined;
    }
    get prevFrameLastFocusedSingleBrokerageAccountGroup() { return this._prevFrameLastFocusedSingleBrokerageAccountGroup; }

    get lastFocusedSingleBrokerageAccountGroupValid() { return this._lastFocusedSingleBrokerageAccountGroup !== undefined; }
    get lastFocusedSingleBrokerageAccountGroup() { return this._lastFocusedSingleBrokerageAccountGroup; }

    get brokerageAccountGroupOrDataIvemIdSetting(): boolean { return this._brokerageAccountGroupOrDataIvemIdSettingCount > 0; }

    get menuBarService() { return this._menuBarService; }

    get dataIvemIdAppLinked() { return this._dataIvemIdAppLinked; }
    set dataIvemIdAppLinked(value: boolean) { this.setDataIvemIdAppLinked(value); }

    get accountAggregationAppLinked(): boolean { return this._brokerageAccountGroupAppLinked; }
    set accountAggregationAppLinked(value: boolean) { this.setAccountAggregationAppLinked(value); }

    get saveLayoutDataIvemIdsAndAccountAggregations(): boolean { return this._saveLayoutDataIvemIdsAndBrokerageAccountGroups; }
    set saveLayoutDataIvemIdsAndAccountAggregations(value: boolean) { this._saveLayoutDataIvemIdsAndBrokerageAccountGroups = value; }

    public get dataIvemIdChangedEvent(): DesktopFrame.TDataIvemIdChangedEvent { return this._dataIvemIdChangedEvent; }
    public set dataIvemIdChangedEvent(value: DesktopFrame.TDataIvemIdChangedEvent) { this._dataIvemIdChangedEvent = value; }

    initialise(goldenLayoutHostFrame: GoldenLayoutHostFrame) {
        this._goldenLayoutHostFrame = goldenLayoutHostFrame;

        this.connectMenuBarItems();

        // Comment out next 2 statements and uncomment following notifyInitialLoaded if always want to load empty layout
        const loadPromise = this.loadLayout(DesktopFrame.mainLayoutName);
        loadPromise.then(
            (success) => {
                if (!success) {
                    // layout does not exist
                    this._goldenLayoutHostFrame.loadDefaultLayout();
                    this._activeLayoutName = undefined;
                }
                this.checkLoadBrandingSplashWebPage();
                this.notifInitialLoaded();
            },
            (reason: unknown) => {
                const errorText = getErrorMessage(reason);
                window.motifLogger.logWarning(`Error loading layout "${DesktopFrame.mainLayoutName}": "${errorText}". Resetting Layout`);
                this._goldenLayoutHostFrame.resetLayout();
                this.checkLoadBrandingSplashWebPage();
                this.notifInitialLoaded();
            }
        );

        // Uncomment if above 2 statements are commented out
        // this.notifInitialLoaded();
    }

    finalise() {
        this._hideUnloadSaveService.deregisterSaveManagement(this);
        this.checkCancelSaveRequest(); // should already have been saved in visibility change
        this.disconnectMenuBarItems();
        this.finaliseUiActions();
    }

    registerFrame(frame: DitemFrame) {
        this._frames.push(frame);
    }

    deleteFrame(frame: DitemFrame) {
        if (frame.primary) {
            const ditemTypeId = frame.ditemTypeId;
            const primaryIdx = this.indexOfPrimaryFrame(ditemTypeId);
            if (primaryIdx < 0) {
                throw new AssertInternalError('DFDFP57200009');
            } else {
                this._primaryFrames.splice(primaryIdx, 1);
            }
        }
        const idx = this.indexOfFrame(frame);
        if (idx < 0) {
            throw new AssertInternalError('DFDFF57200009');
        } else {
            this._frames.splice(idx, 1);
        }
    }

    indexOfFrame(value: DitemFrame): Integer {
        return this._frames.findIndex((frame: DitemFrame) => frame === value);
    }

    newDisplay(SenderFrame: DitemFrame, typeId: BuiltinDitemFrame.BuiltinTypeId /*, TargetPanel: TaqCustomDockingControl*/): DitemFrame {
        return this._newDisplayEvent(SenderFrame, typeId);
    }

    openDisplay(SenderFrame: DitemFrame, TypeId: BuiltinDitemFrame.BuiltinTypeId, ADataIvemId: DataIvemId) {
        this._openDisplayEvent(SenderFrame, TypeId, /*TargetPanel,*/ ADataIvemId);
    }

    notifyCloseDisplay(Frame: DitemFrame) {
        this._closeDisplayEvent(Frame);
    }

    notifyDestroyFrame(Frame: DitemFrame) {
        if (Frame === this._prevFocusedFrame) {
            this._prevFrameLastFocusedDataIvemId = undefined;
            this._prevFrameLastFocusedBrokerageAccountGroup = undefined;
            this._prevFrameLastFocusedSingleBrokerageAccountGroup = undefined;
            this._prevFocusedFrame = undefined;
        }

        if (Frame === this._lastFocusedFrame) {
            this.clearLastFocusedDataIvemId();
            this.clearLastFocusedBrokerageAccountGroup();
            this._lastFocusedSingleBrokerageAccountGroup = undefined;
        }
    }


    printDesktop() {
        this._printDesktopEvent();
    }

    public notifyDitemFramePrimaryChanged(frame: DitemFrame) {
        const ditemTypeId = frame.ditemTypeId;
        const idx = this.indexOfPrimaryFrame(ditemTypeId);
        if (idx < 0) {
            if (frame.primary) {
                this._primaryFrames.push(frame);
            } else {
                throw new AssertInternalError('DNDFPCN33448867'); // not found
            }
        } else {
            const existingPrimaryFrame = this._primaryFrames[idx];
            if (frame.primary) {
                if (existingPrimaryFrame === frame) {
                    throw new AssertInternalError('DNDFPCE6511094'); // not a change
                } else {
                    existingPrimaryFrame.primary = false; // will remove from array with re-entrancy
                    this._primaryFrames.push(frame);
                }
            } else {
                if (existingPrimaryFrame !== frame) {
                    throw new AssertInternalError('DNDFPCM6511094'); // must have been more than one
                } else {
                    existingPrimaryFrame.primary = false; // will remove from array with re-entrancy
                    this._primaryFrames.splice(idx, 1);
                }
            }
        }
    }

    setBrokerageAccountGroup(group: BrokerageAccountGroup | undefined, initiatingFrame: DitemFrame | undefined) {
        if (!BrokerageAccountGroup.isUndefinableEqual(group, this._brokerageAccountGroup)) {
            this.beginBrokerageAccountGroupOrDataIvemIdSetting();
            try {
                this._brokerageAccountGroup = group;

                if (this._brokerageAccountGroup !== undefined && BrokerageAccountGroup.isSingle(this._brokerageAccountGroup)) {
                    this._lastSingleBrokerageAccountGroup = this._brokerageAccountGroup;
                }

                for (const frame of this._frames) {
                    if (frame.brokerageAccountGroupLinked) {
                        frame.setBrokerageAccountGroupFromDesktop(group, initiatingFrame);
                    }
                }

                this.notifyAccountIdChange(initiatingFrame);
            } finally {
                this.endBrokerageAccountGroupOrDataIvemIdSetting();
            }
        }
    }

    clearBrokerageAccountGroup(InitiatingFrame: DitemFrame) {
        this.setBrokerageAccountGroup(undefined, InitiatingFrame);
    }

    initialiseDataIvemId(dataIvemId: DataIvemId) {
        this._dataIvemId = dataIvemId;
    }

    setDataIvemId(dataIvemId: DataIvemId | undefined, initiatingFrame: DitemFrame | undefined) {
        if (!DataIvemId.isUndefinableEqual(dataIvemId, this._dataIvemId)) {
            this.beginBrokerageAccountGroupOrDataIvemIdSetting();
            try {
                this._dataIvemId = dataIvemId;

                for (const frame of this._frames) {
                    if (frame.dataIvemIdLinked) {
                        frame.setDataIvemIdFromDesktop(dataIvemId, initiatingFrame);
                    }
                }

                this._dataIvemIdChangedEvent.trigger(dataIvemId, initiatingFrame);
            } finally {
                this.endBrokerageAccountGroupOrDataIvemIdSetting();
            }
        }
    }

    clearDataIvemId(initiatingFrame: DitemFrame | undefined) {
        this.setDataIvemId(undefined, initiatingFrame);
    }


    beginBrokerageAccountGroupOrDataIvemIdSetting() {
        this._brokerageAccountGroupOrDataIvemIdSettingCount++;
    }

    endBrokerageAccountGroupOrDataIvemIdSetting() {
        this._brokerageAccountGroupOrDataIvemIdSettingCount--;
    }


    setFocusedFrame(Frame: DitemFrame | undefined) {
        if (this._lastFocusedFrame !== undefined) {
            this._prevFocusedFrame = this._lastFocusedFrame;
            this._prevFrameLastFocusedDataIvemId = this._lastFocusedDataIvemId;
            this._prevFrameLastFocusedBrokerageAccountGroup = this._lastFocusedBrokerageAccountGroup;
            this._prevFrameLastFocusedSingleBrokerageAccountGroup = this._lastFocusedSingleBrokerageAccountGroup;
        }

        if (Frame !== this._lastFocusedFrame) {
            this._lastFocusedFrame = Frame;
            this._lastFocusedDataIvemId = undefined;
            this._lastFocusedBrokerageAccountGroup = undefined;
            this._lastFocusedSingleBrokerageAccountGroup = undefined;
        }
    }

    setLastFocusedDataIvemId(ADataIvemId: DataIvemId) {
        this._lastFocusedDataIvemId = ADataIvemId;
    }

    clearLastFocusedDataIvemId() {
        this._lastFocusedDataIvemId = undefined;
    }

    setLastFocusedBrokerageAccountGroup(group: BrokerageAccountGroup) {
        this._lastFocusedBrokerageAccountGroup = group;

        if (this._lastFocusedBrokerageAccountGroup.isSingle()) {
            this._lastFocusedSingleBrokerageAccountGroup = this._lastFocusedBrokerageAccountGroup;
        }
    }

    clearLastFocusedBrokerageAccountGroup() {
        this._lastFocusedBrokerageAccountGroup = undefined;
    }

    async resetLayout() {
        // this._activeLayoutName = undefined;
        // this._goldenLayoutHostFrame.resetLayout();
        const result = await this._storage.removeSubNamedItem(KeyValueStore.Key.Layout, DesktopFrame.mainLayoutName, true);
        if (result.isErr()) {
            window.motifLogger.logError(`DesktopService save layout error: ${result.error}`);
        } else {
            this._userAlertService.queueAlert(UserAlertService.Alert.Type.Id.ResetLayout, 'Reset Layout');
        }
    }

    createExtensionComponent(extensionHandle: ExtensionHandle, frameTypeName: string, initialState: JsonValue | undefined,
        tabText: string | undefined, preferredLocationId: GoldenLayoutHostFrame.PreferredLocationId | undefined
    ) {
        return this._goldenLayoutHostFrame.createExtensionComponent(extensionHandle,
            frameTypeName, initialState, tabText, preferredLocationId
        );
    }

    destroyExtensionComponent(ditemFrame: ExtensionDitemFrame) {
        this._goldenLayoutHostFrame.destroyExtensionComponent(ditemFrame);
    }

    createPlaceheldExtensionComponents(extensionHandle: ExtensionHandle) {
        this._goldenLayoutHostFrame.createPlaceheldExtensionComponents(extensionHandle);
    }

    placeholdExtensionComponent(ditemFrame: ExtensionDitemFrame, reason: string) {
        this._goldenLayoutHostFrame.placeholdExtensionComponent(ditemFrame, reason);
    }

    createOrderRequestBuiltinComponent(preferredLocationId?: GoldenLayoutHostFrame.PreferredLocationId) {
        const component = this._goldenLayoutHostFrame.createBuiltinComponent(
            BuiltinDitemFrame.BuiltinTypeId.OrderRequest, undefined, preferredLocationId
        );
        const ditemFrame = this._getBuiltinDitemFrameFromComponent(component);
        if (!(ditemFrame instanceof OrderRequestDitemFrame)) {
            throw new AssertInternalError('DFNORDI2252388645');
        } else {
            return ditemFrame;
        }
    }

    loadLayout(name: string): Promise<boolean> {
        // return Promise.resolve(false); // uncomment to force default layout
        const getPromise = this._storage.getSubNamedItem(KeyValueStore.Key.Layout, name, true);
        return getPromise.then(
            (getResult) => {
                if (getResult.isErr()) {
                    return Promise.resolve(false);
                } else {
                    const layoutConfigAsStr = getResult.value;
                    if (layoutConfigAsStr === undefined || layoutConfigAsStr === '') {
                        return Promise.resolve(false);
                    } else {
                        let loadResult: Result<void>;
                        try {
                            loadResult = this.loadLayoutFromString(layoutConfigAsStr, name);
                        } catch (e) {
                            loadResult = new Err(getErrorMessage(e));
                        }
                        if (loadResult.isErr()) {
                            return Promise.reject(new Error(`Load layout "${name}" failure: ${loadResult.error}`));
                        } else {
                            return Promise.resolve(true);
                        }
                    }
                }
            },
            (reason: unknown) => Promise.reject(new AssertInternalError(`Storage Get Internal Error: ${getErrorMessage(reason)}`))
        );
    }

    flagLayoutSaveRequired() {
        this.requestSave(SaveManagement.InitiateReasonId.Change);
    }

    save() {
        this._activeLayoutName = DesktopFrame.mainLayoutName; // need to change when can save with different names

        const layoutElement = new JsonElement();
        let goldenLayoutConfig: LayoutConfig;
        const savedGoldenLayoutConfig = this._goldenLayoutHostFrame.saveLayout();
        // In version 3 of GoldenLayout GoldenLayout.saveLayout() will return a LayoutConfig instead of a ResolvedLayoutConfig
        if ('resolved' in savedGoldenLayoutConfig) {
            goldenLayoutConfig = LayoutConfig.fromResolved(savedGoldenLayoutConfig);
        } else {
            goldenLayoutConfig = savedGoldenLayoutConfig as unknown as LayoutConfig;
        }
        // remove eslint disable when can save with different names
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._activeLayoutName !== undefined) {
            layoutElement.setString(DesktopFrame.JsonName.layoutName, this._activeLayoutName);
        }
        layoutElement.setString(DesktopFrame.JsonName.layoutSchemaVersion, DesktopFrame.layoutStateSchemaVersion);
        layoutElement.setJson(DesktopFrame.JsonName.layoutGolden, goldenLayoutConfig as Json);

        const layoutStr = JSON.stringify(layoutElement.json);
        const setReturnPromise = this._storage.setSubNamedItem(KeyValueStore.Key.Layout, this._activeLayoutName, layoutStr, true);
        return setReturnPromise
    }

    checkCancelSaveRequest() {
        if (this._layoutSaveRequestPromise === undefined) {
            return false;
        } else {
            this._idleService.cancelRequest(this._layoutSaveRequestPromise);
            this._layoutSaveRequestPromise = undefined;
            return true;
        }
    }

    processSaveResult(result: Result<void>, initiateReasonId: SaveManagement.InitiateReasonId) {
        if (result.isOk()) {
            if (this._lastLayoutSaveFailed) {
                // window.motifLogger.log(Logger.LevelId.Warning, 'Save layout succeeded');
                this._lastLayoutSaveFailed = false;
            }
        } else {
            this._toastService.popup(Strings[StringId.Layout_CouldNotSave])
            if (!this._lastLayoutSaveFailed) {
                window.motifLogger.log(Logger.LevelId.Warning, `${SaveManagement.InitiateReason.idToName(initiateReasonId)} save layout error: ${getErrorMessage(result.error)}`);
                this._lastLayoutSaveFailed = true;
            }
        }
    }

    addAccountIdToHistory(AAccountId: string) {
        const upperAccountId = AAccountId.toUpperCase();

        const idx = this._historicalAccountIds.findIndex((id: string) => id.toUpperCase() === upperAccountId);
        if (idx >= 0) {
            this._historicalAccountIds.splice(idx, 1);
        }

        if (this._historicalAccountIds.length >= this._maxHistoricalAccountIdCount) {
            this._historicalAccountIds.splice(this._maxHistoricalAccountIdCount - 1);
        }

        this._historicalAccountIds.unshift(AAccountId);
    }

    editOrderRequest(pad: OrderPad) {
        const primaryFrame = this.getPrimaryBuiltinFrame(BuiltinDitemFrame.BuiltinTypeId.OrderRequest);
        if (primaryFrame !== undefined) {
            if (!(primaryFrame instanceof OrderRequestDitemFrame)) {
                throw new AssertInternalError('GLHFEOR233884324');
            } else {
                const orderRequestFrame = primaryFrame;
                orderRequestFrame.setOrderPad(pad);
                primaryFrame.focus();
            }
        } else {
            const component = this.createOrderRequestBuiltinComponent(GoldenLayoutHostFrame.PreferredLocationId.NextToFocused);
            component.setOrderPad(pad);
            component.focus();
        }
    }

    // editOrderRequestFromMarketOrderId(requestType: OrderRequestTypeId, accountId: BrokerageAccountId, marketOrderId: MarketOrderId) {
    //     this.editOrderRequestFromMarketOrderIdEvent(requestType, accountId, marketOrderId);
    // }

    subscribeDataIvemIdChangeEvent(handler: DesktopFrame.DataIvemIdChangeEventHandler): MultiEvent.DefinedSubscriptionId {
        return this._dataIvemIdChangeMultiEvent.subscribe(handler);
    }

    unsubscribeDataIvemIdChangeEvent(id: MultiEvent.SubscriptionId) {
        this._dataIvemIdChangeMultiEvent.unsubscribe(id);
    }

    subscribeBrokerageAccountGroupChangeEvent(handler: DesktopFrame.BrokerageAccountGroupChangeEventHandler) {
        return this._brokerageAccountGroupChangeMultiEvent.subscribe(handler);
    }

    unsubscribeBrokerageAccountGroupChangeEvent(id: MultiEvent.SubscriptionId) {
        this._brokerageAccountGroupChangeMultiEvent.unsubscribe(id);
    }

    subscribeBeginSaveWaitingEvent(handler: SaveManagement.SaveWaitingEventHandler): MultiEvent.DefinedSubscriptionId {
        return this._beginSaveWaitingMultiEvent.subscribe(handler);
    }

    unsubscribeBeginSaveWaitingEvent(id: MultiEvent.SubscriptionId): void {
        this._beginSaveWaitingMultiEvent.unsubscribe(id);
    }

    subscribeEndSaveWaitingEvent(handler: SaveManagement.SaveWaitingEventHandler): MultiEvent.DefinedSubscriptionId {
        return this._endSaveWaitingMultiEvent.subscribe(handler);
    }

    unsubscribeEndSaveWaitingEvent(id: MultiEvent.SubscriptionId): void {
        this._endSaveWaitingMultiEvent.unsubscribe(id);
    }

    private handleNewDitemUiActionSignal(ditemTypeId: BuiltinDitemFrame.BuiltinTypeId) {
        this._goldenLayoutHostFrame.createBuiltinComponent(ditemTypeId, undefined, undefined);
    }

    private handleNewBuyOrderRequestDitemUiActionSignal() {
        const component = this.createOrderRequestBuiltinComponent();
        const pad = new OrderPad(this._decimalFactory, this._marketsService, this._symbolDetailCacheService, this._adiService);
        pad.loadBuy();
        pad.applySettingsDefaults(this._settingsService.scalar);
        component.setOrderPad(pad);
    }

    private handleNewSellOrderRequestDitemUiActionSignal() {
        const component = this.createOrderRequestBuiltinComponent();
        const pad = new OrderPad(this._decimalFactory, this._marketsService, this._symbolDetailCacheService, this._adiService);
        pad.loadSell();
        pad.applySettingsDefaults(this._settingsService.scalar);
        component.setOrderPad(pad);
    }

    private handleResetLayoutUiActionSignal() {
        const resetLayoutPromise = this.resetLayout();
        resetLayoutPromise.then(
            () => {
                // nothing to do
            },
            (error: unknown) => { throw AssertInternalError.createIfNotError(error, 'DFHSLUAS69334'); } // should never occur
        )
    }

    private handleSignOutUiActionSignal() {
        this._signOutService.signOut();
    }

    private notifInitialLoaded() {
        this.initialLoadedEvent();
    }

    private createCommandContext(htmlElement: HTMLElement) {
        const id: CommandContext.Id = {
            name: 'Desktop',
            extensionHandle: this._extensionsAccessService.internalHandle,
        };

        return new CommandContext(id, StringId.CommandContextDisplay_Root, htmlElement, () => undefined);
    }

    private createUiActions() {
        this._newPlaceholderDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.Placeholder);
        this._newExtensionsDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.Extensions);
        this._newSymbolsDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.Symbols);
        this._newDepthAndTradesDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.DepthAndTrades);
        this._newWatchlistDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.Watchlist);
        this._newDepthDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.Depth);
        this._newNewsHeadlinesDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.NewsHeadlines);
        this._newNewsBodyDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.NewsBody);
        this._newScansDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.Scans);
        this._newNotificationChannelsDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.NotificationChannels);
        this._newAlertsDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.Alerts);
        this._newSearchDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.Search);
        this._newAdvertWebPageDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.AdvertWebPage);
        this._newTopShareholdersDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.TopShareholders);
        this._newStatusDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.Status);
        this._newTradesDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.Trades);
        this._newOrderRequestDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.OrderRequest);
        this._newBrokerageAccountsDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.BrokerageAccounts);
        this._newOrdersDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.Orders);
        this._newOrderAuthoriseDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.OrderAuthorise);
        this._newHoldingsDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.Holdings);
        this._newBalancesDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.Balances);
        this._newSettingsDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.Settings);
        this._newDiagnosticsDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.Diagnostics);
        this._newEtoPriceQuotationDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.EtoPriceQuotation);

        const buySellOrderRequestMenuPath = [...DesktopFrame.BuySellOrderRequestParentMenuPath, DesktopFrame.BuySellOrderRequestMenuName];

        this._newBuyOrderRequestDitemUiAction = this.createCommandUiAction(InternalCommand.Id.NewBuyOrderRequestDitem,
            StringId.DitemMenuDisplay_OrderRequest_Buy,
            () => this.handleNewBuyOrderRequestDitemUiActionSignal(),
            {
                menuPath: buySellOrderRequestMenuPath,
                rank: 10000,
            }
        );

        this._newSellOrderRequestDitemUiAction = this.createCommandUiAction(InternalCommand.Id.NewSellOrderRequestDitem,
            StringId.DitemMenuDisplay_OrderRequest_Sell,
            () => this.handleNewSellOrderRequestDitemUiActionSignal(),
            {
                menuPath: buySellOrderRequestMenuPath,
                rank: 20000,
            }
        );

        this._saveLayoutUiAction = this.createCommandUiAction(InternalCommand.Id.SaveLayout,
            StringId.Desktop_SaveLayoutCaption,
            () => this.requestSave(SaveManagement.InitiateReasonId.Ui),
            {
                menuPath: [MenuBarService.Menu.Name.Root.tools],
                rank: 30000,
            }
        );
        this._resetLayoutUiAction = this.createCommandUiAction(InternalCommand.Id.ResetLayout,
            StringId.Desktop_ResetLayoutCaption,
            () => this.handleResetLayoutUiActionSignal(),
            {
                menuPath: [MenuBarService.Menu.Name.Root.tools],
                rank: 30000,
            }
        );
        this._signOutUiAction = this.createCommandUiAction(InternalCommand.Id.SignOut,
            StringId.Desktop_SignOutCaption,
            () => this.handleSignOutUiActionSignal()
        );
    }

    private finaliseUiActions() {
        this._newPlaceholderDitemUiAction.finalise();
        this._newExtensionsDitemUiAction.finalise();
        this._newSymbolsDitemUiAction.finalise();
        this._newDepthAndTradesDitemUiAction.finalise();
        this._newWatchlistDitemUiAction.finalise();
        this._newDepthDitemUiAction.finalise();
        this._newNewsHeadlinesDitemUiAction.finalise();
        this._newNewsBodyDitemUiAction.finalise();
        this._newScansDitemUiAction.finalise();
        this._newNotificationChannelsDitemUiAction.finalise();
        this._newAlertsDitemUiAction.finalise();
        this._newSearchDitemUiAction.finalise();
        this._newAdvertWebPageDitemUiAction.finalise();
        this._newTopShareholdersDitemUiAction.finalise();
        this._newStatusDitemUiAction.finalise();
        this._newTradesDitemUiAction.finalise();
        this._newOrderRequestDitemUiAction.finalise();
        this._newBrokerageAccountsDitemUiAction.finalise();
        this._newOrdersDitemUiAction.finalise();
        this._newOrderAuthoriseDitemUiAction.finalise();
        this._newHoldingsDitemUiAction.finalise();
        this._newBalancesDitemUiAction.finalise();
        this._newSettingsDitemUiAction.finalise();
        this._newDiagnosticsDitemUiAction.finalise();
        this._newEtoPriceQuotationDitemUiAction.finalise();
        this._newBuyOrderRequestDitemUiAction.finalise();
        this._newSellOrderRequestDitemUiAction.finalise();
        this._saveLayoutUiAction.finalise();
        this._resetLayoutUiAction.finalise();
        this._signOutUiAction.finalise();
    }

    private connectMenuBarItems() {
        this._menuBarService.beginChanges();
        try {
            // Position menus first
            this._menuBarService.positionRootChildMenuItem(MenuBarService.Menu.Name.Root.price, 10000,
                this._extensionsAccessService.internalToExtStringId(StringId.MenuDisplay_Price),
                this._extensionsAccessService.internalToExtStringId(StringId.MenuAccessKey_Price)
            );
            this._menuBarService.positionRootChildMenuItem(MenuBarService.Menu.Name.Root.trading, 20000,
                this._extensionsAccessService.internalToExtStringId(StringId.MenuDisplay_Trading),
                this._extensionsAccessService.internalToExtStringId(StringId.MenuAccessKey_Trading)
            );
            this._menuBarService.positionRootChildMenuItem(MenuBarService.Menu.Name.Root.commands, 30000,
                this._extensionsAccessService.internalToExtStringId(StringId.MenuDisplay_Tools),
                this._extensionsAccessService.internalToExtStringId(StringId.MenuAccessKey_Tools)
            );
            this._menuBarService.positionRootChildMenuItem(MenuBarService.Menu.Name.Root.tools, 40000,
                this._extensionsAccessService.internalToExtStringId(StringId.MenuDisplay_Tools),
                this._extensionsAccessService.internalToExtStringId(StringId.MenuAccessKey_Tools)
            );
            this._menuBarService.positionRootChildMenuItem(MenuBarService.Menu.Name.Root.help, 50000,
                this._extensionsAccessService.internalToExtStringId(StringId.MenuDisplay_Help),
                this._extensionsAccessService.internalToExtStringId(StringId.MenuAccessKey_Help)
            );

            const buySellOrderRequestPosition: MenuBarService.MenuItem.Position = {
                menuPath: DesktopFrame.BuySellOrderRequestParentMenuPath,
                rank: 1000,
            };
            this._menuBarService.positionEmbeddedChildMenu(DesktopFrame.BuySellOrderRequestMenuName, buySellOrderRequestPosition);

            // connect
            this._newExtensionsDitemMenuItem = this._menuBarService.connectMenuItem(this._newExtensionsDitemUiAction);
            this._newSymbolsDitemMenuItem = this._menuBarService.connectMenuItem(this._newSymbolsDitemUiAction);
            this._newScansDitemMenuItem = this._menuBarService.connectMenuItem(this._newScansDitemUiAction);
            this._newNotificationChannelsDitemMenuItem = this._menuBarService.connectMenuItem(this._newNotificationChannelsDitemUiAction);
            this._newDepthAndTradesDitemMenuItem = this._menuBarService.connectMenuItem(this._newDepthAndTradesDitemUiAction);
            this._newWatchlistDitemMenuItem = this._menuBarService.connectMenuItem(this._newWatchlistDitemUiAction);
            this._newDepthDitemMenuItem = this._menuBarService.connectMenuItem(this._newDepthDitemUiAction);
            if (this._capabilitiesService.advertisingEnabled) {
                this._newNewsHeadlinesDitemMenuItem = this._menuBarService.connectMenuItem(this._newNewsHeadlinesDitemUiAction);
                this._newAlertsDitemMenuItem = this._menuBarService.connectMenuItem(this._newAlertsDitemUiAction);
                this._newSearchDitemMenuItem = this._menuBarService.connectMenuItem(this._newSearchDitemUiAction);
                this._newAdvertWebPageDitemMenuItem = this._menuBarService.connectMenuItem(this._newAdvertWebPageDitemUiAction);
            }
            this._newStatusDitemMenuItem = this._menuBarService.connectMenuItem(this._newStatusDitemUiAction);
            this._newTradesDitemMenuItem = this._menuBarService.connectMenuItem(this._newTradesDitemUiAction);
            this._newBrokerageAccountsDitemMenuItem = this._menuBarService.connectMenuItem(this._newBrokerageAccountsDitemUiAction);
            this._newOrdersDitemMenuItem = this._menuBarService.connectMenuItem(this._newOrdersDitemUiAction);
            this._newHoldingsDitemMenuItem = this._menuBarService.connectMenuItem(this._newHoldingsDitemUiAction);
            this._newBalancesDitemMenuItem = this._menuBarService.connectMenuItem(this._newBalancesDitemUiAction);
            this._newBuyOrderRequestDitemMenuItem = this._menuBarService.connectMenuItem(this._newBuyOrderRequestDitemUiAction);
            this._newSellOrderRequestDitemMenuItem = this._menuBarService.connectMenuItem(this._newSellOrderRequestDitemUiAction);
            this._saveLayoutMenuItem = this._menuBarService.connectMenuItem(this._saveLayoutUiAction);
            this._resetLayoutMenuItem = this._menuBarService.connectMenuItem(this._resetLayoutUiAction);
            if (this._capabilitiesService.dtrEnabled) {
                this._newOrderAuthoriseDitemMenuItem = this._menuBarService.connectMenuItem(this._newOrderAuthoriseDitemUiAction);
            }
            this._newSettingsDitemMenuItem = this._menuBarService.connectMenuItem(this._newSettingsDitemUiAction);
            if (this._capabilitiesService.diagnosticToolsEnabled) {
                this._newDiagnosticsDitemMenuItem = this._menuBarService.connectMenuItem(this._newDiagnosticsDitemUiAction);
            }
        } finally {
            this._menuBarService.endChanges();
        }
    }

    private disconnectMenuBarItems() {
        this._menuBarService.beginChanges();
        try {
            this._menuBarService.disconnectMenuItem(this._newExtensionsDitemMenuItem);
            this._menuBarService.disconnectMenuItem(this._newSymbolsDitemMenuItem);
            this._menuBarService.disconnectMenuItem(this._newScansDitemMenuItem);
            this._menuBarService.disconnectMenuItem(this._newNotificationChannelsDitemMenuItem);
            this._menuBarService.disconnectMenuItem(this._newDepthAndTradesDitemMenuItem);
            this._menuBarService.disconnectMenuItem(this._newWatchlistDitemMenuItem);
            this._menuBarService.disconnectMenuItem(this._newDepthDitemMenuItem);
            if (this._capabilitiesService.advertisingEnabled) {
                this._menuBarService.disconnectMenuItem(this._newNewsHeadlinesDitemMenuItem);
                this._menuBarService.disconnectMenuItem(this._newAlertsDitemMenuItem);
                this._menuBarService.disconnectMenuItem(this._newSearchDitemMenuItem);
                this._menuBarService.disconnectMenuItem(this._newAdvertWebPageDitemMenuItem);
            }
            this._menuBarService.disconnectMenuItem(this._newStatusDitemMenuItem);
            this._menuBarService.disconnectMenuItem(this._newTradesDitemMenuItem);
            this._menuBarService.disconnectMenuItem(this._newBrokerageAccountsDitemMenuItem);
            this._menuBarService.disconnectMenuItem(this._newOrdersDitemMenuItem);
            this._menuBarService.disconnectMenuItem(this._newHoldingsDitemMenuItem);
            this._menuBarService.disconnectMenuItem(this._newBalancesDitemMenuItem);
            this._menuBarService.disconnectMenuItem(this._newBuyOrderRequestDitemMenuItem);
            this._menuBarService.disconnectMenuItem(this._newSellOrderRequestDitemMenuItem);
            this._menuBarService.disconnectMenuItem(this._saveLayoutMenuItem);
            this._menuBarService.disconnectMenuItem(this._resetLayoutMenuItem);
            if (this._capabilitiesService.dtrEnabled) {
                this._menuBarService.disconnectMenuItem(this._newOrderAuthoriseDitemMenuItem);
            }
            this._menuBarService.disconnectMenuItem(this._newSettingsDitemMenuItem);
            if (this._capabilitiesService.diagnosticToolsEnabled) {
                this._menuBarService.disconnectMenuItem(this._newDiagnosticsDitemMenuItem);
            }
        } finally {
            this._menuBarService.endChanges();
        }
    }

    private createNewDitemUiAction(ditemTypeId: BuiltinDitemFrame.BuiltinTypeId) {
        const commandName = BuiltinDitemFrame.BuiltinType.idToNewInternalCommandName(ditemTypeId);
        const displayId = BuiltinDitemFrame.BuiltinType.idToMenuDisplayId(ditemTypeId);
        const menuBarItemPosition = BuiltinDitemFrame.BuiltinType.idToMenuBarItemPosition(ditemTypeId);
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId, menuBarItemPosition);
        const action = new CommandUiAction(command);
        action.signalEvent = () => this.handleNewDitemUiActionSignal(ditemTypeId);
        return action;
    }

    private createCommandUiAction(commandId: InternalCommand.Id, displayId: StringId, handler: UiAction.SignalEventHandler,
        menuBarItemPosition?: Command.MenuBarItemPosition
    ) {
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandId, displayId, menuBarItemPosition);
        const action = new CommandUiAction(command);
        action.signalEvent = handler;
        return action;
    }

    private getFrameCount(): Integer {
        return this._frames.length;
    }

    private setDataIvemIdAppLinked(value: boolean) {
        this._dataIvemIdAppLinked = value;
        if (this._dataIvemIdAppLinked) {
            const ADataIvemId = this._requestGlobalLinkedDataIvemIdEvent();
            this.setDataIvemId(ADataIvemId, undefined);
        }
    }

    private setAccountAggregationAppLinked(value: boolean) {
        this._brokerageAccountGroupAppLinked = value;
        if (this._brokerageAccountGroupAppLinked) {
            const group = this._requestGlobalLinkedBrokerageAccountGroupEvent();
            this.setBrokerageAccountGroup(group, undefined);
        }
    }

    private getLastFocusedDataIvemIdValid(): boolean {
        return this._lastFocusedDataIvemId !== undefined;
    }

    private getLastFocusedAccountIdValid(): boolean {
        return this._lastFocusedBrokerageAccountGroup !== undefined;
    }

    private getPrevFrameLastFocusedDataIvemIdValid(): boolean {
        return this._prevFrameLastFocusedDataIvemId !== undefined;
    }

    private getPrimaryBuiltinFrame(typeId: BuiltinDitemFrame.BuiltinTypeId): DitemFrame | undefined {
        const ditemTypeId = BuiltinDitemFrame.createBuiltinDitemTypeId(this._extensionsAccessService.internalHandle, typeId);
        return this.getPrimaryFrame(ditemTypeId);
    }

    private getPrimaryFrame(typeId: DitemFrame.TypeId): DitemFrame | undefined {
        for (const frame of this._primaryFrames) {
            if (DitemFrame.TypeId.isEqual(frame.ditemTypeId, typeId)) {
                return frame;
            }
        }

        return undefined;
    }

    private indexOfPrimaryFrame(typeId: DitemFrame.TypeId) {
        const count = this._primaryFrames.length;
        for (let i = 0; i < count; i++) {
            const frame = this._primaryFrames[i];
            if (frame.ditemTypeId === typeId) {
                return i;
            }
        }
        return -1;
    }

    private notifyAccountIdChange(initiatingFrame: DitemFrame | undefined) {
        const handlers = this._brokerageAccountGroupChangeMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](initiatingFrame);
        }
    }

    private notifyDataIvemIdChange(initiatingFrame: DitemFrame | undefined) {
        const handlers = this._dataIvemIdChangeMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](initiatingFrame);
        }
    }

    private notifyBeginSaveWaiting() {
        const handlers = this._beginSaveWaitingMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i]();
        }
    }

    private notifyEndSaveWaiting() {
        const handlers = this._endSaveWaitingMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i]();
        }
    }

    private loadLayoutFromString(layoutAsStr: string, layoutName: string): Result<void> {
        let result: Result<void>;
        let layoutJson: Json | undefined;
        try {
            layoutJson = JSON.parse(layoutAsStr) as Json;
            result = new Ok(undefined);
        } catch (e) {
            const errorText = `${Strings[StringId.Layout_InvalidJson]}: "${getErrorMessage(e)}": ${layoutAsStr}`;
            window.motifLogger.logError(errorText, 1000);
            result = new Err(errorText);
            layoutJson = undefined;
        }

        if (layoutJson !== undefined) {
            const layoutElement = new JsonElement(layoutJson);
            this._activeLayoutName = layoutName;
            const name = this._activeLayoutName;
            const schemaVersionResult = layoutElement.tryGetString(DesktopFrame.JsonName.layoutSchemaVersion);
            if (schemaVersionResult.isErr()) {
                window.motifLogger.logWarning(`${Strings[StringId.Layout_SerialisationFormatNotDefinedLoadingDefault]}: ${name}`);
                this.loadDefaultLayout();
            } else {
                if (schemaVersionResult.value !== DesktopFrame.layoutStateSchemaVersion) {
                    window.motifLogger.logWarning(`${Strings[StringId.Layout_SerialisationFormatIncompatibleLoadingDefault]}: "${name}", ` +
                        `${schemaVersionResult.value}, ${DesktopFrame.layoutStateSchemaVersion}`);
                    this.loadDefaultLayout();
                } else {
                    const goldenResult = layoutElement.tryGetJsonObject(DesktopFrame.JsonName.layoutGolden);
                    if (goldenResult.isErr()) {
                        window.motifLogger.logWarning(`${Strings[StringId.Layout_GoldenNotDefinedLoadingDefault]}: ${name}`);
                        this.loadDefaultLayout();
                    } else {
                        this._goldenLayoutHostFrame.loadLayout(goldenResult.value as LayoutConfig);
                    }
                }
            }

            this.initialiseLoadedLayout();
        }
        return result;
    }

    private loadDefaultLayout() {
        this._activeLayoutName = undefined;
        this._goldenLayoutHostFrame.loadDefaultLayout();
    }

    private initialiseLoadedLayout() {
        this._primaryFrames.length = 0;
        for (const frame of this._frames) {
            if (frame.primary) {
                this._primaryFrames.push(frame);
            }
        }
    }

    private checkLoadBrandingSplashWebPage() {
        if (this._startupSplashWebPageDefined) {
            this.loadBrandingSplashWebPage();
        }
    }

    private loadBrandingSplashWebPage() {
        const primaryFrame = this.getPrimaryBuiltinFrame(BuiltinDitemFrame.BuiltinTypeId.BrandingSplashWebPage);
        if (primaryFrame !== undefined) {
            if (!(primaryFrame instanceof BrandingSplashWebPageDitemFrame)) {
                throw new AssertInternalError('DFLBSWPP44468');
            } else {
                primaryFrame.focus();
            }
        } else {
            const component = this._goldenLayoutHostFrame.createSplashComponent();
            const ditemFrame = this._getBuiltinDitemFrameFromComponent(component);
            if (!(ditemFrame instanceof BrandingSplashWebPageDitemFrame)) {
                throw new AssertInternalError('DFLBSWPC44468');
            } else {
                ditemFrame.primary = true;
                ditemFrame.focus();
            }
        }
    }

    private requestSave(initiateReasonId: SaveManagement.InitiateReasonId) {
        if (this._layoutSaveRequestPromise === undefined) {
            this._layoutSaveRequestPromise = this._idleService.addRequest<Result<void>>(
                () => this.idleRequestSaveLayout(),
                DesktopFrame.layoutSaveWaitIdleTime,
                DesktopFrame.layoutSaveDebounceTime,
            );
            this._layoutSaveRequestPromise.then(
                (result) => {
                    if (result !== undefined) {
                        this.processSaveResult(result, initiateReasonId);
                    }
                    this.notifyEndSaveWaiting();
                },
                (reason: unknown) => {
                    throw AssertInternalError.createIfNotError(reason, 'SSRS40498');
                }
            );
            this.notifyBeginSaveWaiting();
        }
    }

    private idleRequestSaveLayout(): Promise<Result<void>> {
        // Do not undefine this._layoutSaveRequestPromise in Promise.then(). The then() function runs in next microtask, so it is possible for save to be completed while this._layoutSaveRequestPromise is still defined
        this._layoutSaveRequestPromise = undefined;
        return this.save();
    }
}

export namespace DesktopFrame {
    export namespace JsonName {
        export const desktop = 'desktop';
        export const formatType = 'formatType';
        export const layout = 'layout';

        export const layoutName = 'name';
        export const layoutSchemaVersion = 'schemaVersion';
        export const layoutGolden = 'golden';
    }
    export const layoutStateSchemaVersion = '2';

    export const enum TRectAdjacency {
        radTop, radBottom, radLeft, radRight, radTopLeft, radTopRight, radBottomLeft, radBottomRight
    }

    export const BuySellOrderRequestParentMenuPath = [MenuBarService.Menu.Name.Root.trading];
    export const BuySellOrderRequestMenuName = 'BuySellOrderRequest';

    export type LayoutSaveEventHandler = (this: void) => Json;
    export type LayoutLoadEventHandler = (this: void, layoutJson: Json) => void;
    export type ResetLayoutEventHandler = (this: void) => void;
    export type LayoutSaveRequiredEventer = (this: void) => void;
    export type NewTabEventHandler = (typeId: BuiltinDitemFrame.BuiltinTypeId, componentState?: Json) => void;

    export type DataIvemIdChangeEventHandler = (this: void, initiatingFrame: DitemFrame | undefined) => void;
    export type BrokerageAccountGroupChangeEventHandler = (this: void, initiatingFrame: DitemFrame | undefined) => void;

    export type RequestAppLinkedDataIvemIdEvent = (this: void) => DataIvemId;
    export type RequestAppLinkedBrokerageAccountGroupEvent = (this: void) => BrokerageAccountGroup;

    export type GetBuiltinDitemFrameFromComponent = (component: BuiltinDitemNgComponentBaseNgDirective) => BuiltinDitemFrame | undefined;

    export type EditOrderRequestEvent = (this: void, request: OrderPad) => void;
    export type EditOrderRequestFromMarketOrderIdEvent = (this: void, requestType: OrderRequestTypeId,
        AccountId: string, marketOrderId: MarketOrderId) => void;

    export type TNewDisplayEvent = (SenderFrame: DitemFrame, FrameTypeId: BuiltinDitemFrame.BuiltinTypeId,
            /*TargetPanel: TaqCustomDockingControl*/) => DitemFrame;
    export type TOpenDisplayEvent = (SenderFrame: DitemFrame, FrameTypeId: BuiltinDitemFrame.BuiltinTypeId,
            /*TargetPanel: TaqCustomDockingControl,*/ ADataIvemId: DataIvemId) => void;
    export type TCloseDisplayEvent = (Frame: DitemFrame) => void;
    export type TPrintDesktopEvent = (this: void) => void;

    export type DataIvemIdChangeEventHandlerArray = DataIvemIdChangeEventHandler[];
    export type AccountAggregationChangeEventHandlerArray = BrokerageAccountGroupChangeEventHandler[];

    export type DataIvemIdChangedHandler = (ADataIvemId: DataIvemId | undefined, InitiatingFrame: DitemFrame | undefined) => void;

    export class TDataIvemIdChangedEvent extends MultiEvent<DataIvemIdChangedHandler> {
        trigger(ADataIvemId: DataIvemId | undefined, InitiatingFrame: DitemFrame | undefined): void {
            const handlers = this.copyHandlers();
            for (let i = 0; i < handlers.length; i++) {
                handlers[i](ADataIvemId, InitiatingFrame);
            }
        }
    }

    export const mainLayoutName = 'main';

    export const layoutSaveDebounceTime = 5 * mSecsPerSec;
    export const layoutSaveWaitIdleTime = 3 * mSecsPerSec;
}
