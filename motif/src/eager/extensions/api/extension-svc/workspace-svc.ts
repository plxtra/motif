import { LocalDesktop } from '../types';

/** @public */
export interface WorkspaceSvc {
    readonly localDesktop: LocalDesktop;
    localDesktopLoadedEventer: WorkspaceSvc.LocalDesktopLoadedEventHandler | undefined;
    getLoadedLocalDesktop(): Promise<LocalDesktop | undefined>;
}

/** @public */
export namespace WorkspaceSvc {
    export type LocalDesktopLoadedEventHandler = (this: void) => void;
}
