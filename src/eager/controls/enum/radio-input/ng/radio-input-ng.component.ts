import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { Integer } from '@pbkware/js-utils';
import { UiAction } from '@pbkware/ui-action';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { IntegerEnumElementComponentBaseNgDirective } from '../../ng/ng-api';
import { NgStyle } from '@angular/common';

@Component({
    selector: 'app-radio-input', // should be xxx-radio
    templateUrl: './radio-input-ng.component.html',
    styleUrls: ['./radio-input-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgStyle]
})
export class RadioInputNgComponent extends IntegerEnumElementComponentBaseNgDirective {
    private static typeInstanceCreateCount = 0;

    readonly name = input('');
    readonly checked = model<boolean>(false);

    public radioDisabled = true;

    constructor() {
        super(
            ++RadioInputNgComponent.typeInstanceCreateCount,
            ControlComponentBaseNgDirective.clickControlStateColorItemIdArray
        );
        this.inputId.set(`Radio:${this.typeInstanceId}`);
    }

    onChange(checked: boolean) {
        if (checked) {
            this.commitValue(this.item);
        }
    }

    protected override applyValue(value: Integer | undefined, _edited: boolean) {
        const newChecked = value === undefined ? false : value === this.item;

        if (newChecked !== this.checked()) {
            this.checked.set(newChecked);
            this.markForCheck();
        }
    }

    protected override applyStateId(newStateId: UiAction.StateId) {
        super.applyStateId(newStateId);
        this.updateRadioDisabled();
    }

    protected override applyFilter(filter: Integer[] | undefined) {
        super.applyFilter(filter);
        this.updateRadioDisabled();
    }

    protected override applyItems() {
        super.applyItems();
        this.updateRadioDisabled();
    }

    protected override finalise() {
        super.finalise();
    }

    private updateRadioDisabled() {
        const filter = this.uiAction.filter;
        this.radioDisabled = this.disabled || this.readonly || (filter !== undefined && !filter.includes(this.item));
    }
}
