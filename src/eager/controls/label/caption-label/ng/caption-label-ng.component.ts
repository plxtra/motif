import { ChangeDetectionStrategy, Component, OnDestroy, input } from '@angular/core';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { LabelComponentBaseNgDirective } from '../../ng/label-component-base-ng.directive';
import { NgStyle } from '@angular/common';

@Component({
    selector: 'app-caption-label',
    templateUrl: './caption-label-ng.component.html',
    styleUrls: ['./caption-label-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgStyle]
})
export class CaptionLabelNgComponent extends LabelComponentBaseNgDirective implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    readonly for = input<string>();

    constructor() {
        super(
            ++CaptionLabelNgComponent.typeInstanceCreateCount,
            ControlComponentBaseNgDirective.labelStateColorItemIdArray
        );
    }

    override ngOnDestroy() {
        this.finalise();
    }

    protected override finalise() {
        super.finalise();
    }
}
