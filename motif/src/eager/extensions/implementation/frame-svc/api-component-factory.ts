import { FactoryComponent } from '../types/internal-api';

export interface ApiComponentFactory {
    destroyComponent(component: FactoryComponent): void;
}
