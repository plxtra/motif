import { Directive, OnDestroy, input, model } from '@angular/core';
import { UiAction } from '@pbkware/ui-action';
import { ListItemSelectItemUiActionNgDirectiveNgDirective } from './list-item-select-item-ui-action-ng.directive';

@Directive()
export abstract class CaptionedRadioNgDirective<T> extends ListItemSelectItemUiActionNgDirectiveNgDirective<T> implements OnDestroy {
    readonly name = input('');
    readonly checked = model<boolean>(false);

    public radioDisabled = true;

    onChange(checked: boolean) {
        if (checked) {
            this.commitValue(this.item);
        }
    }

    protected override applyValue(value: T | undefined, _edited: boolean) {
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

    protected override applyFilter(filter: T[] | undefined) {
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
