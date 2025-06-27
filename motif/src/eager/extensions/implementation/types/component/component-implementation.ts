import { Component as ComponentApi } from '../../../api';
import { FactoryComponent } from './factory-component';

export abstract class ComponentImplementation implements ComponentApi, FactoryComponent {
    abstract get factoryComponentRef(): FactoryComponent.ComponentRef;
    abstract get rootHtmlElement(): HTMLElement;
    abstract destroy(): void;
}
