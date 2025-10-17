import { AfterViewInit, ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Integer } from '@pbkware/js-utils';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { SelectItemsNgDirective } from '../../ng/select-items-ng.directive';
import { NgSelectComponent, NgOptionTemplateDirective } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-enum-array-input',
    templateUrl: './enum-array-input-ng.component.html',
    styleUrls: ['./enum-array-input-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [NgSelectComponent, FormsModule, NgOptionTemplateDirective]
})
export class EnumArrayInputNgComponent extends SelectItemsNgDirective<Integer> implements AfterViewInit {
    private static typeInstanceCreateCount = 0;

    constructor() {
        super(
            ++EnumArrayInputNgComponent.typeInstanceCreateCount,
            ControlComponentBaseNgDirective.textControlStateColorItemIdArray,
        );

        this.inputId.set(`EnumArrayInput:${this.typeInstanceId}`);
    }
}
