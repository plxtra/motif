import { JsonElement, JsonValue } from '@pbkware/js-utils';
import {
    AdiService,
    BrokerageAccountGroup,
    CommandRegisterService,
    DataIvemId,
    MarketsService,
    SettingsService,
    SymbolsService
} from '@plxtra/motif-core';
import { DitemFrame } from './ditem-frame';

export class ExtensionDitemFrame extends DitemFrame {
    readonly initialised = false;
    persistStateRequestEventer: ExtensionDitemFrame.PersistStateRequestEventHandler;

    constructor(
        ditemTypeId: DitemFrame.TypeId,
        private readonly _componentAccess: ExtensionDitemFrame.ComponentAccess,
        settingsService: SettingsService,
        marketsService: MarketsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService
    ) {
        super(ditemTypeId, _componentAccess,
            settingsService, marketsService, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    get extensionHandle() { return this.ditemTypeId.extensionHandle; }
    get typeName() { return this.ditemTypeId.name; }

    getPersistState() {
        const jsonElement = new JsonElement();
        this.save(jsonElement);
        this._componentAccess.savePersistState(jsonElement);
        return jsonElement.json;
    }

    protected override applyDataIvemId(dataIvemId: DataIvemId | undefined, selfInitiated: boolean) {
        super.applyDataIvemId(dataIvemId, selfInitiated);
        return this._componentAccess.applyDataIvemId(dataIvemId, selfInitiated);
    }

    protected override applyBrokerageAccountGroup(group: BrokerageAccountGroup | undefined, selfInitiated: boolean): boolean {
        super.applyBrokerageAccountGroup(group, selfInitiated);
        return this._componentAccess.applyBrokerageAccountGroup(group, selfInitiated);
    }
}

export namespace ExtensionDitemFrame {
    export type PersistStateRequestEventHandler = (this: void) => JsonValue | undefined;

    export interface ComponentAccess extends DitemFrame.ComponentAccess {
        savePersistState(element: JsonElement): void;
        applyDataIvemId(dataIvemId: DataIvemId | undefined, selfInitiated: boolean): boolean;
        applyBrokerageAccountGroup(group: BrokerageAccountGroup | undefined, selfInitiated: boolean): boolean;
    }
}
