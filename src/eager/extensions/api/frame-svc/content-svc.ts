import {
    Component,
    ContentComponent,
    DelayedBadnessComponent
} from '../types';

/** @public */
export interface ContentSvc {
    readonly components: readonly ContentComponent[];

    destroyAllComponents(): void;
    destroyComponent(component: Component): void;

    createDelayedBadnessComponent(): DelayedBadnessComponent;
}
