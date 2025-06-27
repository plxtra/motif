import { AssertInternalError } from '@pbkware/js-utils';
import { Command, Extension, ExtensionSvc, FrameSvc, LocalDesktop } from 'motif';
import { I18nStrings, StringId } from './i18n-strings';
import { LogService } from './log-service';
import { Settings } from './settings';
import { UiFrame } from './ui-frame/ui-frame';

export class HighchartsExtension implements Extension {
    private readonly _logService = new LogService();
    private readonly _settings: Settings;

    private _desktop: LocalDesktop;

    constructor(private readonly _extensionSvc: ExtensionSvc) {
        I18nStrings.initialise(this._extensionSvc);
        this._settings = new Settings();
    }

    unloadEventer = () => this.destroy();

    async initialise() {
        const desktop = await this.awaitDesktop();
        if (desktop !== undefined) {
            this._desktop = desktop;
            this.loadMenus();
        }
    }

    private destroy() {
        // Clean up resources if necessary
    }

    private handleNewChartsFrameSignalEvent() {
        this._desktop.createFrame(UiFrame.frameTypeName);
    }

    private async awaitDesktop() {
        const desktop = await this._extensionSvc.workspaceSvc.getLoadedLocalDesktop();
        if (desktop === undefined) {
            // Extension has been uninstalled or app has terminated while waiting for desktop to be loaded
            return undefined;
        } else {
            desktop.getFrameEventer = (frameSvcProxy) => {
                switch (frameSvcProxy.frameTypeName) {
                    case UiFrame.frameTypeName: {
                        const uiFrame = new UiFrame(this._logService, this._settings, this._extensionSvc, frameSvcProxy as FrameSvc);
                        const initialisePromise = uiFrame.initialise();
                        AssertInternalError.throwErrorIfPromiseRejected(initialisePromise, 'Highcharts: UiFrame initialisation failed');
                        return uiFrame;
                    }
                    default: throw Error(`getFrameEvent does not support frameTypeName: ${frameSvcProxy.frameTypeName}`);
                }
            }

            desktop.releaseFrameEventer = (frame) => (frame as UiFrame).destroy();
    
            return desktop;
        }
    }

    private loadMenus() {
        const menuBarService = this._desktop.menuBar;
        menuBarService.beginChanges();
        try {
            const PriceRootMenuName = 'Price';
            const ChartCommand: Command = {
                name: 'ChartFrame',
                defaultDisplayId: StringId.ChartFrameMenuCaption,
                defaultMenuBarItemPosition: {
                    rank: 25000,
                    menuPath: [PriceRootMenuName],
                }
            };
            const menuItem = menuBarService.createCommandMenuItem(ChartCommand);
            menuItem.signalEventer = () => this.handleNewChartsFrameSignalEvent();
        } finally {
            menuBarService.endChanges();
        }
    }
}

export namespace HighchartsExtension {
    export const cssFileUrl = 'highcharts-extension.css';
}