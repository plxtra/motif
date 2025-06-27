import { Command, StringId } from '../types';

/** @public */
export interface CommandSvc {
    getCommand(name: string): Command | undefined;
    getOrRegisterCommand(name: string, defaultDisplayId: StringId, menuBarItemPosition?: Command.MenuBarItemPosition): Command;
}
