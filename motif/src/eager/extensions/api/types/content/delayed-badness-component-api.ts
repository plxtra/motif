import { Badness, TimeSpan } from '../sys';
import { ContentComponent } from './content-component-api';

/** @public */
export interface DelayedBadnessComponent extends ContentComponent {
    delayTimeSpan: TimeSpan;
    setBadness(value: Badness): void;
    hideWithVisibleDelay(badness: Badness): void;
}
