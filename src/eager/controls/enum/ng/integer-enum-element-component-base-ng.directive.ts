import { Directive } from '@angular/core';
import { Integer } from '@pbkware/js-utils';
import { SelectItemUiAction } from '@pbkware/ui-action';
import { ControlComponentBaseNgDirective } from '../../ng/control-component-base-ng.directive';
import { ListItemSelectItemUiActionNgDirectiveNgDirective } from './list-item-select-item-ui-action-ng.directive';

@Directive()
export abstract class IntegerEnumElementComponentBaseNgDirective extends ListItemSelectItemUiActionNgDirectiveNgDirective<Integer> {
    constructor(
        typeInstanceCreateId: Integer,
        stateColorItemIdArray: ControlComponentBaseNgDirective.ReadonlyStateColorItemIdArray,
    ) {
        super(typeInstanceCreateId, stateColorItemIdArray, SelectItemUiAction.integerUndefinedValue);
    }
}
