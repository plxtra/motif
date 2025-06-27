import {
    Directive,
    viewChild
} from '@angular/core';
import { DelayedBadnessNgComponent } from '../../delayed-badness/ng-api';
import { GridSourceNgDirective } from '../../grid-source/ng-api';
import { DelayedBadnessGridSourceFrame } from '../delayed-badness-grid-source-frame';

@Directive()
export abstract class DelayedBadnessGridSourceNgDirective extends GridSourceNgDirective {
    declare readonly frame: DelayedBadnessGridSourceFrame;

    private readonly _delayedBadnessComponentSignal = viewChild.required<DelayedBadnessNgComponent>('delayedBadness', { debugName: 'delayedBadness' });

    protected override processAfterViewInit() {
        const delayedBadnessComponent = this._delayedBadnessComponentSignal();
        this.frame.setBadnessEventer = (value) => delayedBadnessComponent.setBadness(value);
        this.frame.hideBadnessWithVisibleDelayEventer = (badness) => delayedBadnessComponent.hideWithVisibleDelay(badness);
    }
}
