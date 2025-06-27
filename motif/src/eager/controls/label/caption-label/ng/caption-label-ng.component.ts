import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, input } from '@angular/core';
import { SettingsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { LabelComponentBaseNgDirective } from '../../ng/label-component-base-ng.directive';

@Component({
    selector: 'app-caption-label',
    templateUrl: './caption-label-ng.component.html',
    styleUrls: ['./caption-label-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class CaptionLabelNgComponent extends LabelComponentBaseNgDirective implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    readonly for = input<string>();

    constructor(elRef: ElementRef<HTMLElement>, cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(
            elRef,
            ++CaptionLabelNgComponent.typeInstanceCreateCount,
            cdr,
            settingsNgService.service,
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
