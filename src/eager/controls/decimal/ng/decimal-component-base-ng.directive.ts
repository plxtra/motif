import { Directive } from '@angular/core';
import { DecimalUiAction, UiAction } from '@pbkware/ui-action';
import { Decimal } from 'decimal.js-light';
import { ControlComponentBaseNgDirective } from '../../ng/control-component-base-ng.directive';

@Directive()
export abstract class DecimalComponentBaseNgDirective extends ControlComponentBaseNgDirective {
    public max?: number;
    public min?: number;
    public step?: number;

    public override get uiAction() { return super.uiAction as DecimalUiAction; }

    protected applyValue(_value: Decimal | undefined, _edited: boolean) {
        this.markForCheck();
    }

    protected applyOptions(options: DecimalUiAction.Options) {
        this.max = options.max;
        this.min = options.min;
        this.step = options.step;
    }

    protected override pushSettings() {
        this.applyOptions(this.uiAction.options);
        this.applyValue(this.uiAction.value, this.uiAction.edited);
        super.pushSettings();
    }

    protected commitValue(value: Decimal | undefined, typeId: UiAction.CommitTypeId) {
        this.uiAction.commitValue(value, typeId);
    }

    protected override setUiAction(action: DecimalUiAction) {
        const pushEventHandlersInterface = super.setUiAction(action) as DecimalUiAction.PushEventHandlersInterface;

        pushEventHandlersInterface.value = (value, edited) => this.handleValuePushEvent(value, edited);
        pushEventHandlersInterface.options = (options) => this.handleOptionsPushEvent(options);

        this.applyOptions(action.options);
        this.applyValue(action.value, action.edited);

        return pushEventHandlersInterface;
    }

    private handleValuePushEvent(value: Decimal | undefined, edited: boolean) {
        this.applyValue(value, edited);
    }

    private handleOptionsPushEvent(options: DecimalUiAction.Options) {
        if (options !== this.uiAction.options) {
            this.applyOptions(options);
            this.applyValue(this.uiAction.value, this.uiAction.edited);
        }
    }
}
