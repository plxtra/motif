import { ChangeDetectorRef, Directive, ElementRef } from '@angular/core';
import { Integer } from '@pbkware/js-utils';
import { SelectItemUiAction } from '@pbkware/ui-action';
import { SettingsService } from '@plxtra/motif-core';
import { ControlComponentBaseNgDirective } from '../../ng/control-component-base-ng.directive';
import { ListItemSelectItemUiActionNgDirectiveNgDirective } from './list-item-select-item-ui-action-ng.directive';

@Directive()
export abstract class IntegerEnumElementComponentBaseNgDirective extends ListItemSelectItemUiActionNgDirectiveNgDirective<Integer> {
    constructor(
        elRef: ElementRef<HTMLElement>,
        typeInstanceCreateId: Integer,
        cdr: ChangeDetectorRef,
        settingsService: SettingsService,
        stateColorItemIdArray: ControlComponentBaseNgDirective.ReadonlyStateColorItemIdArray,
    ) {
        super(elRef, typeInstanceCreateId, cdr, settingsService, stateColorItemIdArray, SelectItemUiAction.integerUndefinedValue);
    }
}
