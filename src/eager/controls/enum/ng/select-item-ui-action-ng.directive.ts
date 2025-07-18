import { ChangeDetectorRef, Directive, ElementRef, model } from '@angular/core';
import { Integer, isUndefinableArrayEqualUniquely } from '@pbkware/js-utils';
import { SelectItemUiAction, UiAction } from '@pbkware/ui-action';
import { SettingsService } from '@plxtra/motif-core';
import { ControlComponentBaseNgDirective } from '../../ng/control-component-base-ng.directive';

@Directive()
export abstract class SelectItemUiActionNgDirective<T> extends ControlComponentBaseNgDirective {
    private static selectItemUiActionNgDirectivetypeInstanceCreateCount = 0;

    readonly inputId = model<string>(`SelectItemUiActionNgDirectiveInputId${++SelectItemUiActionNgDirective.selectItemUiActionNgDirectivetypeInstanceCreateCount}`);

    private _filter: readonly T[] | undefined;

    constructor(
        elRef: ElementRef<HTMLElement>,
        typeInstanceCreateId: Integer,
        cdr: ChangeDetectorRef,
        settingsService: SettingsService,
        stateColorItemIdArray: ControlComponentBaseNgDirective.ReadonlyStateColorItemIdArray,
        private readonly _undefinedValue: T,
    ) {
        super(elRef, typeInstanceCreateId, cdr, settingsService, stateColorItemIdArray);
    }

    override get uiAction() { return super.uiAction as SelectItemUiAction<T>; }

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

    protected commitValue(value: T | undefined) {
        if (value !== undefined && value !== this._undefinedValue) {
            this.uiAction.commitValue(value, UiAction.CommitTypeId.Explicit);
        } else {
            if (!this.uiAction.valueRequired) {
                this.uiAction.commitValue(undefined, UiAction.CommitTypeId.Explicit);
            }
        }
    }

    protected override setUiAction(action: SelectItemUiAction<T>) {
        const pushEventHandlersInterface = super.setUiAction(action) as SelectItemUiAction.PushEventHandlersInterface<T>;

        pushEventHandlersInterface.value = (value, edited) => this.handleValuePushEvent(value, edited);
        pushEventHandlersInterface.filter = (filter) => this.handleFilterPushEvent(filter);
        pushEventHandlersInterface.item = (item, caption, title) => this.handleItemPushEvent(item, caption, title);
        pushEventHandlersInterface.list = () => this.handleListPushEvent();

        this.applyValue(action.value, action.edited);
        this.applyFilter(action.filter);

        return pushEventHandlersInterface;
    }

    private handleValuePushEvent(value: T | undefined, edited: boolean) {
        this.applyValue(value, edited);
    }

    private handleFilterPushEvent(filter: readonly T[] | undefined) {
        if (!isUndefinableArrayEqualUniquely(filter, this._filter)) {
            this.applyFilter(filter);
        }
    }

    private handleItemPushEvent(item: T, caption: string, title: string) {
        this.applyItemTitle(item, title);
        this.applyItemCaption(item, caption);
    }

    private handleListPushEvent() {
        this.applyItems();
    }

    protected abstract applyValue(value: T | undefined, edited: boolean): void;
}
