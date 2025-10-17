import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Integer } from '@pbkware/js-utils';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { ItemsCheckboxNgDirective } from '../../ng/items-checkbox-ng.directive';
import { NgStyle } from '@angular/common';

@Component({
    selector: 'app-enum-array-checkbox',
    templateUrl: './enum-array-checkbox-ng.component.html',
    styleUrls: ['./enum-array-checkbox-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgStyle]
})
export class EnumArrayCheckboxNgComponent extends ItemsCheckboxNgDirective<Integer> implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    constructor() {
        super(
            ++EnumArrayCheckboxNgComponent.typeInstanceCreateCount,
            ControlComponentBaseNgDirective.clickControlStateColorItemIdArray,
            Number.MIN_SAFE_INTEGER,
        );
        this.inputId.set(`EnumArrayCheckbox:${this.typeInstanceId}`);
    }
}
