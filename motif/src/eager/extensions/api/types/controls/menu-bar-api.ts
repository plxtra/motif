import { StringId } from '../resources';
import { Command } from '../ui-action';
import { CommandUiAction } from '../ui-action/command-ui-action-api';

/** @public */
export interface CommandMenuItem extends CommandUiAction {
    readonly defaultPosition: MenuBar.MenuItemPosition;
}

/** @public */
export interface ChildMenuItem {
    readonly childMenuName: MenuBar.MenuName;
    readonly defaultPosition: MenuBar.MenuItemPosition;
}

/** @public */
export interface MenuBar {
    beginChanges(): void;
    endChanges(): void;

    createCommandMenuItem(command: Command, overrideDefaultPosition?: MenuBar.MenuItemPosition): CommandMenuItem;
    destroyCommandMenuItem(menuItem: CommandMenuItem): void;

    createChildMenuItem(childMenuName: MenuBar.MenuName, defaultItemPosition: MenuBar.MenuItemPosition,
        displayId?: StringId, accessKeyId?: StringId, embedded?: boolean): ChildMenuItem;
    createRootChildMenuItem(childMenuName: MenuBar.MenuName, rank: number,
        displayId?: StringId, accessKeyId?: StringId): ChildMenuItem;
    createEmbeddedChildMenu(menuName: MenuBar.MenuName, defaultPosition: MenuBar.MenuItemPosition): ChildMenuItem;
    destroyChildMenuItem(menuItem: ChildMenuItem): void;

    destroyAllMenuItems(): void;
}

/** @public */
export namespace MenuBar {
    export type MenuName = string;
    export type MenuItemPosition = Command.MenuBarItemPosition;
}

