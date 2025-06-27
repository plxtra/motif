import { AdiService, CommandRegisterService, MarketsService, SettingsService, SymbolsService } from '@plxtra/motif-core';
import { BuiltinDitemFrame } from '../../builtin-ditem-frame';
import { DitemFrame } from '../../ditem-frame';

export class BrandingSplashWebPageDitemFrame extends BuiltinDitemFrame {
    readonly initialised = true;

    constructor(
        componentAccess: DitemFrame.ComponentAccess,
        settingsService: SettingsService,
        marketsService: MarketsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.BrandingSplashWebPage,
            componentAccess, settingsService, marketsService, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    override get builtinDitemTypeId() { return BuiltinDitemFrame.BuiltinTypeId.BrandingSplashWebPage; }
}
