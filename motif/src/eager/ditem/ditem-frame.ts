import { JsonElement } from '@pbkware/js-utils';
import {
    AdiService,
    BrokerageAccountGroup,
    CommandRegisterService,
    DataIvemId,
    ExtensionHandle,
    MarketsService,
    OrderPad,
    SettingsService,
    SymbolsService
} from '@plxtra/motif-core';
import { Frame } from 'component-internal-api';
import { ComponentContainer } from 'golden-layout';
import { DitemCommandProcessor } from './ditem-command-processor';

export abstract class DitemFrame extends Frame {

    private static readonly jsonTag_FrameDataIvemId = 'frameDataIvemId';
    private static readonly jsonTag_FrameDataIvemIdLinked = 'frameDataIvemIdLinked';
    private static readonly jsonTag_BrokerageAccountGroup = 'brokerageAccountGroup';
    private static readonly jsonTag_BrokerageAccountGroupLinked = 'brokerageAccountGroupLinked';
    private static readonly jsonTag_Primary = 'primary';

    protected layoutConfigLoading = false;
    protected layoutConfigLoaded = false;

    private _primary: boolean;

    private _dataIvemId: DataIvemId | undefined;
    private _oldDataIvemId: DataIvemId | undefined;
    private _dataIvemIdLinkable = true;
    private _dataIvemIdLinked: boolean;

    private _currentFocusedDataIvemId: DataIvemId | undefined;
    private _lastFocusedDataIvemId: DataIvemId;

    private _brokerageAccountGroup: BrokerageAccountGroup | undefined;
    private _oldBrokerageAccountGroup: BrokerageAccountGroup | undefined;
    private _brokerageAccountGroupLinkable = true;
    private _brokerageAccountGroupLinked: boolean;

    private _currentFocusedBrokerageAccountGroup: BrokerageAccountGroup | undefined;
    private _lastFocusedBrokerageAccountGroup: BrokerageAccountGroup;
    private _allBrokerageAccountGroupSupported: boolean;

    private _selectAllWhenFrameSymbolAndSourceApplied: boolean;

    private _ditemCommandProcessor: DitemCommandProcessor;

    constructor(private readonly _ditemTypeId: DitemFrame.TypeId,
        private readonly _ditemComponentAccess: DitemFrame.ComponentAccess,
        protected readonly settingsService: SettingsService,
        protected readonly _marketsService: MarketsService,
        private readonly _commandRegisterService: CommandRegisterService,
        protected readonly desktopAccessService: DitemFrame.DesktopAccessService,
        protected readonly symbolsService: SymbolsService,
        protected readonly adiService: AdiService,
    ) {
        super();

        this.desktopAccessService.registerFrame(this);
        this._ditemCommandProcessor = new DitemCommandProcessor(this._commandRegisterService);
    }

    get ditemTypeId() { return this._ditemTypeId; }

    get container() { return this._ditemComponentAccess.container; }

    get dataIvemId() { return this._dataIvemId; }
    get olddataIvemId() { return this._oldDataIvemId; }

    get dataIvemIdValid() { return this.getDataIvemIdValid(); }
    get olddataIvemIdValid() { return this.getOldDataIvemIdValid(); }

    get brokerageAccountGroup() { return this._brokerageAccountGroup; }
    get oldbrokerageAccountGroup() { return this._oldBrokerageAccountGroup; }

    get ditemCommandProcessor() { return this._ditemCommandProcessor; }

    get dataIvemIdLinkable() { return this._dataIvemIdLinkable; }
    set dataIvemIdLinkable(value: boolean) { this._dataIvemIdLinkable = value; }
    get dataIvemIdLinked() { return this._dataIvemIdLinked; }
    set dataIvemIdLinked(value: boolean) { this.setDataIvemIdLinked(value); }

    get allBrokerageAccountGroupSupported() { return this._allBrokerageAccountGroupSupported; }
    set allBrokerageAccountGroupSupported(value: boolean) { this._allBrokerageAccountGroupSupported = value; }

    get brokerageAccountGroupLinkable() { return this._brokerageAccountGroupLinkable; }
    set brokerageAccountGroupLinkable(value: boolean) { this._brokerageAccountGroupLinkable = value; }
    get brokerageAccountGroupLinked() { return this._brokerageAccountGroupLinked; }
    set brokerageAccountGroupLinked(value: boolean) { this.setBrokerageAccountGroupLinked(value); }

    get primary() { return this._primary; }
    set primary(value: boolean) {
        if (value !== this._primary) {
            this._primary = value;
            this.notifyPrimaryChanged();
        }
    }

    protected get lastFocusedDataIvemId() { return this._lastFocusedDataIvemId; }

    protected get currentFocusedBrokerageAccountGroup() { return this._currentFocusedBrokerageAccountGroup; }
    protected get lastFocusedBrokerageAccountGroup() { return this._lastFocusedBrokerageAccountGroup; }

    protected get selectAllWhenFrameSymbolAndSourceApplied(): boolean { return this._selectAllWhenFrameSymbolAndSourceApplied; }
    protected set selectAllWhenFrameSymbolAndSourceApplied(value: boolean) { this._selectAllWhenFrameSymbolAndSourceApplied = value; }

    abstract get initialised(): boolean;

    finalise() {
        this.desktopAccessService.deleteFrame(this);
    }

    constructLoad(element: JsonElement | undefined) {
        if (element === undefined) {
            this._dataIvemIdLinked = DitemFrame.DitemDefault.dataIvemIdLinked;
            this._brokerageAccountGroupLinked = DitemFrame.DitemDefault.brokerageAccountGroupLinked;
            this._dataIvemId = DitemFrame.DitemDefault.dataIvemId;
            this._brokerageAccountGroup = DitemFrame.DitemDefault.brokerageAccountGroup;
            this._primary = DitemFrame.DitemDefault.primary;
        } else {
            if (!this.dataIvemIdLinkable) {
                this._dataIvemIdLinked = DitemFrame.DitemDefault.dataIvemIdLinked;
            } else {
                const isFrameDataIvemIdLinkedResult = element.tryGetBoolean(DitemFrame.jsonTag_FrameDataIvemIdLinked);
                if (isFrameDataIvemIdLinkedResult.isErr()) {
                    this.dataIvemIdLinked = DitemFrame.DitemDefault.dataIvemIdLinked;
                } else {
                    this.dataIvemIdLinked = isFrameDataIvemIdLinkedResult.value;
                }
            }

            if (!this.brokerageAccountGroupLinkable) {
                this._brokerageAccountGroupLinked = DitemFrame.DitemDefault.brokerageAccountGroupLinked;
            } else {
                const isBrokerageAccountGroupLinkedResult = element.tryGetBoolean(DitemFrame.jsonTag_BrokerageAccountGroupLinked);
                if (isBrokerageAccountGroupLinkedResult.isErr()) {
                    this.brokerageAccountGroupLinked = DitemFrame.DitemDefault.brokerageAccountGroupLinked;
                } else {
                    this.brokerageAccountGroupLinked = isBrokerageAccountGroupLinkedResult.value;
                }
            }

            const dataIvemIdElementResult = element.tryGetElement(DitemFrame.jsonTag_FrameDataIvemId);
            if (dataIvemIdElementResult.isErr()) {
                this._dataIvemId = undefined;
            } else {
                const dataIvemIdResult = DataIvemId.tryCreateFromJson(this._marketsService.defaultExchangeEnvironmentDataMarkets, dataIvemIdElementResult.value, DataIvemId, true);
                if (dataIvemIdResult.isErr()) {
                    this._dataIvemId = undefined;
                } else {
                    this._dataIvemId = dataIvemIdResult.value;
                }
            }

            const groupElementResult = element.tryGetElement(DitemFrame.jsonTag_BrokerageAccountGroup);
            if (groupElementResult.isErr()) {
                this._brokerageAccountGroup = undefined;
            } else {
                const groupResult = BrokerageAccountGroup.tryCreateFromJson(this._marketsService, groupElementResult.value);
                if (groupResult.isErr()) {
                    this._brokerageAccountGroup = undefined;
                } else {
                    this._brokerageAccountGroup = groupResult.value;
                }
            }

            const jsonPrimaryResult = element.tryGetBoolean(DitemFrame.jsonTag_Primary);
            if (jsonPrimaryResult.isErr()) {
                this._primary = DitemFrame.DitemDefault.primary;
            } else {
                this._primary = jsonPrimaryResult.value;
                if (this._primary) {
                    this.desktopAccessService.notifyDitemFramePrimaryChanged(this);
                }
            }
            // TODO:MED need to load DataIvemId history
        }
    }

    save(element: JsonElement) {
        if (this._dataIvemId !== undefined) {
            const dataIvemIdElement = element.newElement(DitemFrame.jsonTag_FrameDataIvemId);
            this._dataIvemId.saveToJson(dataIvemIdElement);
        }
        element.setBoolean(DitemFrame.jsonTag_FrameDataIvemIdLinked, this.dataIvemIdLinked);
        if (this._brokerageAccountGroup !== undefined) {
            const groupElement = element.newElement(DitemFrame.jsonTag_BrokerageAccountGroup);
            this._brokerageAccountGroup.saveToJson(groupElement);
        }
        element.setBoolean(DitemFrame.jsonTag_BrokerageAccountGroupLinked, this.brokerageAccountGroupLinked);
        if (this._primary !== DitemFrame.DitemDefault.primary) {
            element.setBoolean(DitemFrame.jsonTag_Primary, this.primary);
        }
    }

    applyAppOptions(displaySettingsOnly: boolean) { // override;
    }

    focus() {
        this._ditemComponentAccess.focus();
    }

    blur() {
        this._ditemComponentAccess.blur();
    }

    setDataIvemIdFromDesktop(dataIvemId: DataIvemId | undefined, initiatingFrame: DitemFrame | undefined): void {
        this.setDataIvemId(dataIvemId, initiatingFrame);
    }

    setDataIvemIdFromDitem(dataIvemId: DataIvemId | undefined, force = false): void {
        const dataIvemIdChanged = !DataIvemId.isUndefinableEqual(dataIvemId, this._dataIvemId);

        if (!dataIvemIdChanged && force) {
            this.setDataIvemId(dataIvemId, this);
        } else {
            if (dataIvemIdChanged) {
                const desktopSet = this.trySetDesktopDataIvemId(dataIvemId);
                if (!desktopSet) {
                    this.setDataIvemId(dataIvemId, this);
                }
            }
        }
    }

    setBrokerageAccountGroupFromDesktop(group: BrokerageAccountGroup | undefined, initiatingFrame: DitemFrame | undefined): void {
        this.setBrokerageAccountGroup(group, initiatingFrame);
    }

    setBrokerageAccountGroupFromDitem(group: BrokerageAccountGroup | undefined, force = false) {
        const groupChanged = !BrokerageAccountGroup.isUndefinableEqual(group, this._brokerageAccountGroup);

        if (!groupChanged && force) {
            this.setBrokerageAccountGroup(group, this);
        } else {
            if (groupChanged) {
                const desktopSet = this.trySetDesktopBrokerageAccountGroup(group);
                if (!desktopSet) {
                    this.setBrokerageAccountGroup(group, this);
                }
            }
        }
    }

    protected flagSaveRequired() {
        this.desktopAccessService.flagLayoutSaveRequired();
    }

    protected applyLinked() {
        if (this._dataIvemIdLinked) {
            const desktopDataIvemId = this.desktopAccessService.dataIvemId;
            if (desktopDataIvemId !== undefined) {
                this.setDataIvemIdFromDesktop(desktopDataIvemId, undefined);
            }
        }

        if (this._brokerageAccountGroupLinked) {
            const brokerageAccountGroup = this.desktopAccessService.brokerageAccountGroup;
            if (brokerageAccountGroup !== undefined) {
                this.setBrokerageAccountGroupFromDesktop(brokerageAccountGroup, undefined);
            }
        }
    }

    protected applyDataIvemId(dataIvemId: DataIvemId | undefined, selfInitiated: boolean): boolean { // virtual
        if (this._dataIvemId !== undefined) {
            this._oldDataIvemId = this._dataIvemId;
        }
        this._dataIvemId = dataIvemId;
        return true;
    }

    protected applyDitemDataIvemIdFocus(dataIvemId: DataIvemId, applyToLinking: boolean) {
        this.setCurrentFocusedDataIvemId(dataIvemId);

        if (applyToLinking) {
            this.trySetDesktopDataIvemId(dataIvemId);
        }
    }

    protected clearCurrentFocusedDataIvemId() {
        this._currentFocusedDataIvemId = undefined;
    }

    protected hasCurrentFocusedDataIvemId() {
        return this._currentFocusedDataIvemId !== undefined;
    }

    protected applyBrokerageAccountGroup(group: BrokerageAccountGroup | undefined, selfInitiated: boolean): boolean { // virtual;
        if (this._brokerageAccountGroup !== undefined) {
            this._oldBrokerageAccountGroup = this._brokerageAccountGroup;
        }
        this._brokerageAccountGroup = group;
        return true;
    }

    protected applyDitemBrokerageAccountGroupFocus(group: BrokerageAccountGroup, applyToLinking: boolean) {
        this.setCurrentFocusedBrokerageAccountGroup(group);

        if (applyToLinking) {
            this.trySetDesktopBrokerageAccountGroup(group);
        }
    }

    protected clearCurrentFocusedAccount() {
        this._currentFocusedBrokerageAccountGroup = undefined;
    }

    protected hasCurrentFocusedAccountAggregation() {
        return this._currentFocusedBrokerageAccountGroup !== undefined;
    }

    protected setLayoutComponentConfig(element: JsonElement, componentConfig: JsonElement | undefined) {
        element.setElement(DitemFrame.FrameConfigItemName.component, componentConfig);
    }

    private notifyPrimaryChanged() {
        this._ditemComponentAccess.processPrimaryChanged();
        this.desktopAccessService.notifyDitemFramePrimaryChanged(this);
    }

    private setCurrentFocusedDataIvemId(dataIvemId: DataIvemId) {
        this._currentFocusedDataIvemId = dataIvemId;
        this._lastFocusedDataIvemId = this._currentFocusedDataIvemId;
        if (this._ditemComponentAccess.focused) {
            this.desktopAccessService.setLastFocusedDataIvemId(this.lastFocusedDataIvemId);
        }
    }

    private setDataIvemId(dataIvemId: DataIvemId | undefined, initiatingFrame: DitemFrame | undefined): void {
        const selfInitiated = (initiatingFrame !== undefined && initiatingFrame.frameId === this.frameId);
        const applied = this.applyDataIvemId(dataIvemId, selfInitiated);

        if (applied && dataIvemId !== undefined) {
            this.setCurrentFocusedDataIvemId(dataIvemId);
        }
    }

    private trySetDesktopDataIvemId(dataIvemId: DataIvemId | undefined) {
        if (this.dataIvemIdLinked
                &&
                !this.layoutConfigLoading
                &&
                !this.desktopAccessService.brokerageAccountGroupOrDataIvemIdSetting
                &&
                dataIvemId !== undefined
                &&
                !DataIvemId.isUndefinableEqual(dataIvemId, this.desktopAccessService.dataIvemId)) {
            this.desktopAccessService.setDataIvemId(dataIvemId, this);
            return true;
        } else {
            return false;
        }
    }

    private setDataIvemIdLinked(value: boolean) {
        if (value !== this._dataIvemIdLinked) {
            this._dataIvemIdLinked = value;
            if (!this.layoutConfigLoading && this._dataIvemIdLinked) {
                const desktopDataIvemId = this.desktopAccessService.dataIvemId;
                const same = DataIvemId.isUndefinableEqual(desktopDataIvemId, this._dataIvemId);
                if (!same) {
                    if (desktopDataIvemId === undefined) {
                        this.desktopAccessService.setDataIvemId(this._dataIvemId, this);
                    } else {
                        this.setDataIvemId(desktopDataIvemId, undefined);
                    }
                }
            }
            this._ditemComponentAccess.processSymbolLinkedChanged();
        }
    }

    private getDataIvemIdValid() {
        return this._dataIvemId !== undefined;
    }
    private getOldDataIvemIdValid() {
        return this._oldDataIvemId !== undefined;
    }

    private setCurrentFocusedBrokerageAccountGroup(group: BrokerageAccountGroup) {
        this._currentFocusedBrokerageAccountGroup = group;
        this._lastFocusedBrokerageAccountGroup = this._currentFocusedBrokerageAccountGroup;
        if (this._ditemComponentAccess.focused) {
            this.desktopAccessService.setLastFocusedBrokerageAccountGroup(this._lastFocusedBrokerageAccountGroup);
        }
    }

    private setBrokerageAccountGroup(group: BrokerageAccountGroup | undefined, initiatingFrame: DitemFrame | undefined) {
        const selfInitiated = (initiatingFrame !== undefined && initiatingFrame.frameId === this.frameId);
        const applied = this.applyBrokerageAccountGroup(group, selfInitiated);
        if (applied && group !== undefined) {
            this.setCurrentFocusedBrokerageAccountGroup(group);
        }
    }

    private trySetDesktopBrokerageAccountGroup(group: BrokerageAccountGroup | undefined) {
        if (this.brokerageAccountGroupLinked
                &&
                !this.layoutConfigLoading
                &&
                !this.desktopAccessService.brokerageAccountGroupOrDataIvemIdSetting
                &&
                group !== undefined
                &&
                !BrokerageAccountGroup.isUndefinableEqual(group, this.desktopAccessService.brokerageAccountGroup)) {
            this.desktopAccessService.setBrokerageAccountGroup(group, this);
            return true;
        } else {
            return false;
        }
    }

    private setBrokerageAccountGroupLinked(value: boolean) {
        if (value !== this._brokerageAccountGroupLinked) {
            this._brokerageAccountGroupLinked = value;
            if (!this.layoutConfigLoading && this._brokerageAccountGroupLinked) {
                const desktopGroup = this.desktopAccessService.brokerageAccountGroup;
                if (!BrokerageAccountGroup.isUndefinableEqual(this._brokerageAccountGroup, desktopGroup)) {
                    if (desktopGroup === undefined) {
                        this.desktopAccessService.setBrokerageAccountGroup(this._brokerageAccountGroup, this);
                    } else {
                        if (desktopGroup.isSingle() || this._allBrokerageAccountGroupSupported) {
                            this.setBrokerageAccountGroup(desktopGroup, this);
                        } else {
                            const lastSingleBrokerageAccountGroup = this.desktopAccessService.lastSingleBrokerageAccountGroup;
                            if (lastSingleBrokerageAccountGroup !== undefined) {
                                this.setBrokerageAccountGroup(this.desktopAccessService.lastSingleBrokerageAccountGroup, undefined);
                            }
                        }
                    }
                }
            }
            this._ditemComponentAccess.processBrokerageAccountGroupLinkedChanged();
        }
    }
}

export namespace DitemFrame {
    export interface TypeId {
        readonly extensionHandle: ExtensionHandle;
        readonly name: string;
    }

    export namespace TypeId {
        export function create(extensionHandle: ExtensionHandle, name: string): TypeId {
            return {
                extensionHandle,
                name,
            };
        }

        export function isEqual(left: TypeId, right: TypeId) {
            return left.extensionHandle === right.extensionHandle && left.name === right.name;
        }
    }

    export namespace DitemDefault {
        export const dataIvemIdLinked = false;
        export const brokerageAccountGroupLinked = false;
        export const dataIvemId = undefined;
        export const brokerageAccountGroup = undefined;
        export const primary = false;
    }

    export interface ComponentAccess {
        readonly container: ComponentContainer;
        readonly focused: boolean;

        focus(): void;
        blur(): void;

        processSymbolLinkedChanged(): void;
        processBrokerageAccountGroupLinkedChanged(): void;
        processPrimaryChanged(): void;
    }

    export interface DesktopAccessService {
        readonly lastSingleBrokerageAccountGroup: BrokerageAccountGroup | undefined;

        initialLoadedEvent: DesktopAccessService.InitialLoadedEvent;

        readonly dataIvemId: DataIvemId | undefined;
        readonly brokerageAccountGroup: BrokerageAccountGroup | undefined;
        readonly brokerageAccountGroupOrDataIvemIdSetting: boolean;

        flagLayoutSaveRequired(): void;
        notifyDitemFramePrimaryChanged(frame: DitemFrame): void;
        initialiseDataIvemId(dataIvemId: DataIvemId): void;
        setDataIvemId(dataIvemId: DataIvemId | undefined, initiatingFrame: DitemFrame | undefined): void;
        setBrokerageAccountGroup(group: BrokerageAccountGroup | undefined, initiatingFrame: DitemFrame | undefined): void;
        setLastFocusedDataIvemId(value: DataIvemId): void;
        setLastFocusedBrokerageAccountGroup(group: BrokerageAccountGroup): void;

        editOrderRequest(orderPad: OrderPad): void;

        registerFrame(frame: DitemFrame): void;
        deleteFrame(frame: DitemFrame): void;

    }

    export namespace DesktopAccessService {
        export type InitialLoadedEvent = (this: void) => void;
    }
}
