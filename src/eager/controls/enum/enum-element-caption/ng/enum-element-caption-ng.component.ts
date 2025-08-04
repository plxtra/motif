import { ChangeDetectionStrategy, Component, OnDestroy, input } from '@angular/core';
import { Integer } from '@pbkware/js-utils';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { IntegerEnumElementComponentBaseNgDirective } from '../../ng/ng-api';

@Component({
    selector: 'app-enum-element-caption',
    templateUrl: './enum-element-caption-ng.component.html',
    styleUrls: ['./enum-element-caption-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class EnumElementCaptionNgComponent extends IntegerEnumElementComponentBaseNgDirective implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    readonly for = input<string>();

    constructor() {
        super(
            ++EnumElementCaptionNgComponent.typeInstanceCreateCount,
            ControlComponentBaseNgDirective.labelStateColorItemIdArray
        );
    }

    override ngOnDestroy() {
        this.finalise();
    }

    protected override applyValue(_value: Integer | undefined, _edited: boolean) {
        this.markForCheck();
    }
}
