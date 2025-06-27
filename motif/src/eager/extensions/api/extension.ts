/** @public */
export interface Extension {
    unloadEventer: Extension.UnloadEventHandler;
}

/** @public */
export namespace Extension {
    export type UnloadEventHandler = (this: void) => void;
}

