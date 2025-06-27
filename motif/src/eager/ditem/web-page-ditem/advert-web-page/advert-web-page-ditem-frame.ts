import { AdiService, CommandRegisterService, MarketsService, SettingsService, SymbolsService } from '@plxtra/motif-core';
import { BuiltinDitemFrame } from '../../builtin-ditem-frame';
import { DitemFrame } from '../../ditem-frame';

export class AdvertWebPageDitemFrame extends BuiltinDitemFrame {
    readonly initialised = true;

    constructor(
        private readonly _componentAccess: AdvertWebPageDitemFrame.ComponentAccess,
        settingsService: SettingsService,
        marketsService: MarketsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.BrandingSplashWebPage,
            _componentAccess, settingsService, marketsService, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    override get builtinDitemTypeId() { return BuiltinDitemFrame.BuiltinTypeId.BrandingSplashWebPage; }

    loadPage(url: string) {
        this._componentAccess.loadPage(url);
    }
}

export namespace AdvertWebPageDitemFrame {
    export interface ComponentAccess extends DitemFrame.ComponentAccess {
        loadPage(url: string): void;
    }
}
