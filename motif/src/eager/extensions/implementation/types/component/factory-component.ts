export interface FactoryComponent {
    factoryComponentRef: FactoryComponent.ComponentRef;
    readonly rootHtmlElement: HTMLElement;
    destroy(): void;
}

export namespace FactoryComponent {
    export interface ComponentRef {
        readonly rootHtmlElement: HTMLElement;
    }
}
