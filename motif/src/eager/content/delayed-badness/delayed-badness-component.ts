import { TimeSpan } from '@pbkware/js-utils';
import { Badness } from '@plxtra/motif-core';
import { ContentComponent } from '../content-component';

export interface DelayedBadnessComponent extends ContentComponent {
    delayTimeSpan: TimeSpan;
    setBadness(value: Badness): void;
    hideWithVisibleDelay(badness: Badness): void;
}
