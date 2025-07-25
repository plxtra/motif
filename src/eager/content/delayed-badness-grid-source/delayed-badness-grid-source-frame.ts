import { Badness } from '@plxtra/motif-core';
import { GridSourceFrame } from '../grid-source/internal-api';

export abstract class DelayedBadnessGridSourceFrame extends GridSourceFrame {
    setBadnessEventer: DelayedBadnessGridSourceFrame.SetBadnessEventer;
    hideBadnessWithVisibleDelayEventer: DelayedBadnessGridSourceFrame.HideBadnessWithVisibleDelayEventer;

    protected override setBadness(value: Badness) {
        this.setBadnessEventer(value);
    }

    protected override hideBadnessWithVisibleDelay(badness: Badness) {
        this.hideBadnessWithVisibleDelayEventer(badness);
    }
}

export namespace DelayedBadnessGridSourceFrame {
    export type SetBadnessEventer = (this: void, value: Badness) => void;
    export type HideBadnessWithVisibleDelayEventer = (this: void, badness: Badness) => void;
}
