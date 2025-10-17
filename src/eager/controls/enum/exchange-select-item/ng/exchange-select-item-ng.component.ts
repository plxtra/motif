import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Integer } from '@pbkware/js-utils';
import { SelectItemUiAction } from '@pbkware/ui-action';
import { SelectItemNgDirective } from '../../ng/ng-api';
import { NgSelectComponent, NgOptionTemplateDirective } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-exchange-select-item', // should be xxx-enum-select
    templateUrl: './exchange-select-item-ng.component.html',
    styleUrls: ['./exchange-select-item-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [NgSelectComponent, FormsModule, NgOptionTemplateDirective]
})
export class ExchangeSelectItemNgComponent extends SelectItemNgDirective<Integer> {
    private static typeInstanceCreateCount = 0;

    constructor() {
        super(
            ++ExchangeSelectItemNgComponent.typeInstanceCreateCount,
            SelectItemUiAction.integerUndefinedValue,
        );
    }
}
