import { Command, Extension, ExtensionSvc, FrameSvc, LocalDesktop } from '@plxtra/motif';
import { BlueFrame } from './blue-frame';
import { I18nStrings, StringId } from './i18nStrings';

// The Extension
export class TsDemoExtension implements Extension {
    // Desktop class gives access to menus and allows creation of frames.
    // #region desktop
    private _desktop: LocalDesktop;
    // #endregion desktop

    // #region unloadEventer
    unloadEventer = () => this.destroy();
    // #endregion unloadEventer

    // #region constructor
    constructor(private readonly _extensionSvc: ExtensionSvc) {
        I18nStrings.initialise(this._extensionSvc);
    }
    // #endregion constructor

    // #region initialise
    async initialise() {
        // Get the desktop to create frames and menus.
        const desktop = await this.awaitDesktop();
        if (desktop !== undefined) {
            this._desktop = desktop;
            this.loadMenus();
        }
    }
    // #endregion initialise

    // #region destroy
    private destroy() {
        // no clean up of resources needed
    }
    // #endregion destroy


    // #region handleNewBlueFrameSignalEvent
    private handleNewBlueFrameSignalEvent() {
        // Initiate construction of a new BlueFrame when the menu item is clicked.
        this._desktop.createFrame(BlueFrame.frameTypeName);
    }
    // #endregion handleNewBlueFrameSignalEvent

    // #region awaitDesktop
    private async awaitDesktop() {
        const desktop = await this._extensionSvc.workspaceSvc.getLoadedLocalDesktop();
        if (desktop === undefined) {
            // Extension has been uninstalled or app has terminated while waiting for desktop to be loaded
            return undefined;
        } else {
            // getFrameEventer is called by Motif to create a new frame instance when the user selects the menu item.
            // Check what type of frame has been requested, then create and return the instance.
            desktop.getFrameEventer = (frameSvcProxy) => {
                switch (frameSvcProxy.frameTypeName) {
                    case BlueFrame.frameTypeName: {
                        const frame = new BlueFrame(frameSvcProxy as FrameSvc);
                        frame.initialise();
                        return frame;
                    }
                    default: throw Error(`getFrameEvent does not support frameTypeName: ${frameSvcProxy.frameTypeName}`);
                }
            }
            return desktop;
        }
    }
    // #endregion awaitDesktop

    // #region loadMenus
    private loadMenus() {
        // Add a new menu "TsDemo" to the menu bar and include a menu item with a command to create a new BlueFrame.
        const menuBarService = this._desktop.menuBar;
        menuBarService.beginChanges();
        try {
            const TsDemoRootMenuName = 'TsDemo';
            menuBarService.createRootChildMenuItem(TsDemoRootMenuName, 100000, StringId.TsDemoMenuCaption);
            const newBlueFrameCommand: Command = {
                name: 'NewBlueFrame',
                defaultDisplayId: StringId.BlueFrameMenuCaption,
                defaultMenuBarItemPosition: {
                    rank: 100,
                    menuPath: [TsDemoRootMenuName],
                }
            };
            const menuItem = menuBarService.createCommandMenuItem(newBlueFrameCommand);
            menuItem.signalEventer = () => this.handleNewBlueFrameSignalEvent(); // This is called when the user clicks the menu item.
        } finally {
            menuBarService.endChanges();
        }
    }
    // #endregion loadMenus
}