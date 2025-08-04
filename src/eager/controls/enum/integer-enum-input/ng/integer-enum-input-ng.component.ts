import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Integer } from '@pbkware/js-utils';
import { SelectItemUiAction } from '@pbkware/ui-action';
import { SelectItemNgDirective } from '../../ng/ng-api';

@Component({
    selector: 'app-integer-enum-input', // should be xxx-enum-select
    templateUrl: './integer-enum-input-ng.component.html',
    styleUrls: ['./integer-enum-input-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class IntegerEnumInputNgComponent extends SelectItemNgDirective<Integer> {
    private static typeInstanceCreateCount = 0;

    constructor() {
        super(
            ++IntegerEnumInputNgComponent.typeInstanceCreateCount,
            SelectItemUiAction.integerUndefinedValue,
        );
    }
}
