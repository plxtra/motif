import { Directive, model } from '@angular/core';
import { isUndefinableArrayEqualUniquely } from '@pbkware/js-utils';
import { SelectItemsUiAction, UiAction } from '@pbkware/ui-action';
import { ControlComponentBaseNgDirective } from '../../ng/control-component-base-ng.directive';

@Directive()
export abstract class SelectItemsUiActionNgDirective<T> extends ControlComponentBaseNgDirective {
    readonly inputId = model<string>();

    private _filter: readonly T[] | undefined;

    override get uiAction() { return super.uiAction as SelectItemsUiAction<T>; }

    protected applyValue(_value: readonly T[] | undefined, _edited: boolean) {
        this.markForCheck();
    }

    protected applyFilter(filter: readonly T[] | undefined) {
        if (filter === undefined) {
            this._filter = undefined;
        } else {
            this._filter = filter.slice();
        }
    }

    protected applyItemTitle(enumValue: T, title: string) {
        // for descendants
    }
    protected applyItemCaption(enumValue: T, caption: string) {
        // for descendants
    }
    protected applyItems() {
        // for descendants
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

    protected override setUiAction(action: SelectItemsUiAction<T>) {
        const pushEventHandlersInterface = super.setUiAction(action) as SelectItemsUiAction.PushEventHandlersInterface<T>;

        pushEventHandlersInterface.value = (value, edited) => this.handleValuePushEvent(value, edited);
        pushEventHandlersInterface.filter = (filter) => this.handleFilterPushEvent(filter);
        pushEventHandlersInterface.item = (item, caption, title) => this.handleItemPushEvent(item, caption, title);
        pushEventHandlersInterface.list = () => this.handleListPushEvent();

        this.applyValue(action.value, action.edited);
        this.applyFilter(action.filter);

        return pushEventHandlersInterface;
    }

    private handleValuePushEvent(value: readonly T[] | undefined, edited: boolean) {
        this.applyValue(value, edited);
    }

    private handleFilterPushEvent(filter: readonly T[] | undefined) {
        if (!isUndefinableArrayEqualUniquely(filter, this._filter)) {
            this.applyFilter(filter);
        }
    }

    private handleItemPushEvent(element: T, caption: string, title: string) {
        this.applyItemTitle(element, title);
        this.applyItemCaption(element, caption);
    }

    private handleListPushEvent() {
        this.applyItems();
    }
}
