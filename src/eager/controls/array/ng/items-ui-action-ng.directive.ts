import { Directive, model } from '@angular/core';
import { ItemsUiAction, UiAction } from '@pbkware/ui-action';
import { ControlComponentBaseNgDirective } from '../../ng/control-component-base-ng.directive';

@Directive()
export abstract class ItemsUiActionNgDirective<T> extends ControlComponentBaseNgDirective {
    public readonly inputId = model<string>();

    override get uiAction() { return super.uiAction as ItemsUiAction<T>; }

    protected applyValue(_value: readonly T[] | undefined, _edited: boolean) {
        this.markForCheck();
    }

    protected commitValue(value: readonly T[] | undefined) {
        if (value !== undefined) {
            this.uiAction.commitValue(value, UiAction.CommitTypeId.Explicit);
        } else {
            if (!this.uiAction.valueRequired) {
                this.uiAction.commitValue(undefined, UiAction.CommitTypeId.Explicit);
            }
        }
    }

    protected override setUiAction(action: ItemsUiAction<T>) {
        const pushEventHandlersInterface = super.setUiAction(action) as ItemsUiAction.PushEventHandlersInterface<T>;

        pushEventHandlersInterface.value = (value, edited) => this.handleValuePushEvent(value, edited);

        this.applyValue(action.value, action.edited);

        return pushEventHandlersInterface;
    }

    private handleValuePushEvent(value: readonly T[] | undefined, edited: boolean) {
        this.applyValue(value, edited);
    }
}
