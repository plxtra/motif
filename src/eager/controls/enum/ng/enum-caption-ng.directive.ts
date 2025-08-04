import { Directive, OnDestroy, input } from '@angular/core';
import { Integer } from '@pbkware/js-utils';
import { ControlComponentBaseNgDirective } from '../../ng/control-component-base-ng.directive';
import { SelectItemUiActionNgDirective } from './select-item-ui-action-ng.directive';

@Directive()
export class EnumCaptionNgComponent<T> extends SelectItemUiActionNgDirective<T> implements OnDestroy {
    readonly for = input<string>();

    constructor(typeInstanceCreateId: Integer, undefinedValue: T) {
        super(
            typeInstanceCreateId,
            ControlComponentBaseNgDirective.labelStateColorItemIdArray,
            undefinedValue,
        );
    }

    override ngOnDestroy() {
        this.finalise();
    }

    protected override applyValue(_value: T | undefined, _edited: boolean) {
        this.markForCheck();
    }
}
