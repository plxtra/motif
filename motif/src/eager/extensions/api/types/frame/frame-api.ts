/** @public */
export interface Frame {
    readonly rootHtmlElement: HTMLElement;
    readonly svc: Frame.SvcProxy;
}

/** @public */
export namespace Frame {
    export interface SvcProxy {
        frameTypeName: string;
        ditemFrame: unknown;
        destroy(): void;
    }
}
