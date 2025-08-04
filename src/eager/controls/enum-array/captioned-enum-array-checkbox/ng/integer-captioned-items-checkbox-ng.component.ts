import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Integer } from '@pbkware/js-utils';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { CaptionedItemsCheckboxNgDirective } from '../../ng/captioned-items-checkbox-ng.directive';

@Component({
    selector: 'app-integer-captioned-items-checkbox',
    templateUrl: './integer-captioned-items-checkbox-ng.component.html',
    styleUrls: ['./integer-captioned-items-checkbox-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class IntegerCaptionedItemsCheckboxNgComponent extends CaptionedItemsCheckboxNgDirective<Integer> implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    constructor() {
        super(
            ++IntegerCaptionedItemsCheckboxNgComponent.typeInstanceCreateCount,
            ControlComponentBaseNgDirective.clickControlStateColorItemIdArray,
            Number.MIN_SAFE_INTEGER,
        );
        this.inputId.set(`IntegerCaptionedItemsCheckbox:${this.typeInstanceId}`);
    }
}
