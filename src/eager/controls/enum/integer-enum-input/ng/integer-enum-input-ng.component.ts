import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Integer } from '@pbkware/js-utils';
import { SelectItemUiAction } from '@pbkware/ui-action';
import { SelectItemNgDirective } from '../../ng/ng-api';
import { NgSelectComponent, NgOptionTemplateDirective } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-integer-enum-input', // should be xxx-enum-select
    templateUrl: './integer-enum-input-ng.component.html',
    styleUrls: ['./integer-enum-input-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [NgSelectComponent, FormsModule, NgOptionTemplateDirective]
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
