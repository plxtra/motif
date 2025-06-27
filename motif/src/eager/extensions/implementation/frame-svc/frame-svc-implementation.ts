import { DecimalFactory, JsonElement, JsonValue } from '@pbkware/js-utils';
import {
    AdiService,
    BrokerageAccountGroup,
    CommandRegisterService,
    DataIvemId,
    ExtensionHandle,
    MarketsService,
    SettingsService,
    SymbolsService
} from '@plxtra/motif-core';
import { DitemFrame, ExtensionDitemFrame } from 'ditem-internal-api';
import { ComponentContainer } from 'golden-layout';
import {
    BrokerageAccountGroup as BrokerageAccountGroupApi,
    DataIvemId as DataIvemIdApi,
    Frame as FrameApi,
    FrameSvc,
    JsonElement as JsonElementApi
} from '../../api';
import { BrokerageAccountGroupImplementation, DataIvemIdImplementation } from '../types/adi/internal-api';
import { JsonElementImplementation } from '../types/internal-api';
import { ApiContentComponentFactory } from './api-content-component-factory';
import { ApiControlComponentFactory } from './api-control-component-factory';
import { ContentSvcImplementation } from './content-svc-implementation';
import { ControlsSvcImplementation } from './controls-svc-implementation';

export class FrameSvcImplementation implements FrameSvc, FrameApi.SvcProxy, ExtensionDitemFrame.ComponentAccess {
    savePersistStateEventer: FrameSvc.SavePersistStateEventHandler | undefined;
    shownEventer: FrameSvc.ShownEventHandler | undefined;
    hiddenEventer: FrameSvc.HiddenEventHandler | undefined;
    focusedEventer: FrameSvc.FocusedEventHandler | undefined;
    blurredEventer: FrameSvc.BlurredEventHandler | undefined;
    resizedEventer: FrameSvc.ResizedEventHandler | undefined;
    applySymbolEventer: FrameSvc.ApplySymbolEventHandler | undefined;
    symbolLinkedChangedEventer: FrameSvc.SymbolLinkedChangedEventHandler | undefined;
    applyBrokerageAccountGroupEventer: FrameSvc.ApplyBrokerageAccountGroupEventHandler | undefined;
    brokerageAccountGroupLinkedChangedEventer: FrameSvc.BrokerageAccountGroupLinkedChangedEventHandler | undefined;
    primaryChangedEventer: FrameSvc.PrimaryChangedEventHandler | undefined;

    private readonly _ditemFrame: ExtensionDitemFrame;
    private readonly _controlsSvc: ControlsSvcImplementation;
    private readonly _contentSvc: ContentSvcImplementation;

    private _initialPersistState: JsonElementApi | undefined;
    private _focused = false;

    constructor(
        extensionHandle: ExtensionHandle,
        frameTypeName: string,
        private readonly _container: ComponentContainer,
        private readonly _decimalFactory: DecimalFactory,
        settingsService: SettingsService,
        marketsService: MarketsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
        apiControlComponentFactory: ApiControlComponentFactory,
        apiContentComponentFactory: ApiContentComponentFactory,
    ) {
        const ditemTypeId = DitemFrame.TypeId.create(extensionHandle, frameTypeName);
        this._ditemFrame = new ExtensionDitemFrame(ditemTypeId, this,
            settingsService, marketsService, commandRegisterService, desktopAccessService, symbolsService, adiService
        );

        this._container.addEventListener('show', this._containerShowEventListener);
        this._container.addEventListener('hide', this._containerHideEventListener);
        this._container.addEventListener('focus', this._containerFocusEventListener);
        this._container.addEventListener('blur', this._containerBlurEventListener);
        this._container.addEventListener('resize', this._containerResizeEventListener);

        this._controlsSvc = new ControlsSvcImplementation(apiControlComponentFactory);
        this._contentSvc = new ContentSvcImplementation(apiContentComponentFactory);

        this.loadInitialPersistState(this._container.initialState);
    }

    get ditemFrame() { return this._ditemFrame; }
    get container() { return this._container; }
    get shown() { return !this._container.isHidden; }
    get focused() { return this._focused; }

    get extensionHandle() { return this._ditemFrame.extensionHandle; }
    get frameTypeName() { return this._ditemFrame.typeName; }
    get width(): number { return this._container.width; }
    get height(): number { return this._container.height; }

    get controlsSvc() { return this._controlsSvc; }
    get contentSvc() { return this._contentSvc; }

    get initialPersistState() { return this._initialPersistState; }

    get dataIvemId() {
        const actual = this._ditemFrame.dataIvemId;
        return actual === undefined ? undefined : DataIvemIdImplementation.toApi(actual);
    }
    get olddataIvemId() {
        const actual = this._ditemFrame.olddataIvemId;
        return actual === undefined ? undefined : DataIvemIdImplementation.toApi(actual);
    }

    get dataIvemIdValid() { return this._ditemFrame.dataIvemIdLinkable; }
    get olddataIvemIdValid() { return this._ditemFrame.olddataIvemIdValid; }

    get brokerageAccountGroup() {
        const actual = this._ditemFrame.brokerageAccountGroup;
        return actual === undefined ? undefined : BrokerageAccountGroupImplementation.toApi(actual);
    }
    get oldbrokerageAccountGroup() {
        const actual = this._ditemFrame.oldbrokerageAccountGroup;
        return actual === undefined ? undefined : BrokerageAccountGroupImplementation.toApi(actual);
    }

    get tabText() { return this._container.title; }
    set tabText(value: string) { this._container.setTitle(value); }

    get dataIvemIdLinkable() { return this._ditemFrame.dataIvemIdLinkable; }
    set dataIvemIdLinkable(value: boolean) { this._ditemFrame.dataIvemIdLinkable = value; }
    get dataIvemIdLinked() { return this._ditemFrame.dataIvemIdLinked; }
    set dataIvemIdLinked(value: boolean) { this._ditemFrame.dataIvemIdLinked = value; }

    get allBrokerageAccountGroupSupported() { return this._ditemFrame.allBrokerageAccountGroupSupported; }
    set allBrokerageAccountGroupSupported(value: boolean) { this._ditemFrame.allBrokerageAccountGroupSupported = value; }

    get brokerageAccountGroupLinkable() { return this._ditemFrame.brokerageAccountGroupLinkable; }
    set brokerageAccountGroupLinkable(value: boolean) { this._ditemFrame.brokerageAccountGroupLinkable = value; }
    get brokerageAccountGroupLinked() { return this._ditemFrame.brokerageAccountGroupLinked; }
    set brokerageAccountGroupLinked(value: boolean) { this._ditemFrame.brokerageAccountGroupLinked = value; }

    // readonly ditemCommandProcessor

    get primary() { return this._ditemFrame.primary; }
    set primary(value: boolean) { this._ditemFrame.primary = value; }

    destroy() {
        this._container.stateRequestEvent = undefined;

        this._container.removeEventListener('show', this._containerShowEventListener);
        this._container.removeEventListener('hide', this._containerHideEventListener);
        this._container.removeEventListener('focus', this._containerFocusEventListener);
        this._container.removeEventListener('blur', this._containerBlurEventListener);
        this._container.removeEventListener('resize', this._containerResizeEventListener);

        this.destroyAllComponents();
    }

    public focus() {
        this._container.focus();
    }

    public blur() {
        this._container.blur();
    }

    public destroyAllComponents() {
        this._contentSvc.destroyAllComponents();
        this._controlsSvc.destroyAllControls();
    }

    public setDataIvemId(value: DataIvemIdApi, force?: boolean) {
        const actualDataIvemId = DataIvemIdImplementation.fromApi(value);
        this._ditemFrame.setDataIvemIdFromDitem(actualDataIvemId, force === true);
    }

    public setBrokerageAccountGroup(value: BrokerageAccountGroupApi, force?: boolean) {
        const actualBrokerageAccountGroup = BrokerageAccountGroupImplementation.fromApi(value);
        this._ditemFrame.setBrokerageAccountGroupFromDitem(actualBrokerageAccountGroup, force === true);
    }

    processSymbolLinkedChanged() {
        if (this.symbolLinkedChangedEventer !== undefined) {
            this.symbolLinkedChangedEventer();
        }
    }

    processBrokerageAccountGroupLinkedChanged() {
        if (this.brokerageAccountGroupLinkedChangedEventer !== undefined) {
            this.brokerageAccountGroupLinkedChangedEventer();
        }
    }

    processPrimaryChanged() {
        if (this.primaryChangedEventer !== undefined) {
            this.primaryChangedEventer();
        }
    }

    savePersistState(element: JsonElement): void {
        if (this.savePersistStateEventer !== undefined) {
            const elementApi = JsonElementImplementation.toApi(element, this._decimalFactory);
            this.savePersistStateEventer(elementApi);
        }
    }

    applyDataIvemId(dataIvemId: DataIvemId | undefined, selfInitiated: boolean) {
        if (this.applySymbolEventer === undefined) {
            return false;
        } else {
            const dataIvemIdApi = dataIvemId === undefined ? undefined : DataIvemIdImplementation.toApi(dataIvemId);
            return this.applySymbolEventer(dataIvemIdApi, selfInitiated);
        }
    }

    applyBrokerageAccountGroup(group: BrokerageAccountGroup | undefined, selfInitiated: boolean) {
        if (this.applyBrokerageAccountGroupEventer === undefined) {
            return false;
        } else {
            const groupApi = group === undefined ? undefined : BrokerageAccountGroupImplementation.toApi(group);
            return this.applyBrokerageAccountGroupEventer(groupApi, selfInitiated);
        }
    }

    private _containerShowEventListener = () => this.handleContainerShowEvent();
    private _containerHideEventListener = () => this.handleContainerHideEvent();
    private _containerFocusEventListener = () => this.handleContainerFocusEvent();
    private _containerBlurEventListener = () => this.handleContainerBlurEvent();
    private _containerResizeEventListener = () => this.handleContainerResizeEvent();

    private _containerElementClickListener = () => this.focus();
    private _containerElementFocusinListener = () => this.focus();

    private handleContainerShowEvent() {
        if (this.shownEventer !== undefined) {
            this.shownEventer();
        }
    }

    private handleContainerHideEvent() {
        if (this.hiddenEventer !== undefined) {
            this.hiddenEventer();
        }
    }

    private handleContainerFocusEvent() {
        this._focused = false;
        if (this.focusedEventer !== undefined) {
            this.focusedEventer();
        }
    }

    private handleContainerBlurEvent() {
        this._focused = false;
        if (this.blurredEventer !== undefined) {
            this.blurredEventer();
        }
    }

    private handleContainerResizeEvent() {
        this._focused = false;
        if (this.resizedEventer !== undefined) {
            this.resizedEventer();
        }
    }

    private loadInitialPersistState(value: JsonValue | undefined) {
        if (value === undefined) {
            this._initialPersistState = undefined;
            this._ditemFrame.constructLoad(undefined);
        } else {
            if (!JsonValue.isJson(value)) {
                this._initialPersistState = undefined;
                this._ditemFrame.constructLoad(undefined);
            } else {
                const element = new JsonElement(value);
                this._ditemFrame.constructLoad(element);
                this._initialPersistState = JsonElementImplementation.toApi(element, this._decimalFactory);
            }
        }
    }
}

export namespace FrameSvcImplementation {
}
