import { Directive, model, OnDestroy } from '@angular/core';
import { concatenateElementToArrayUniquely, subtractElementFromArrayUniquely } from '@pbkware/js-utils';
import { UiAction } from '@pbkware/ui-action';
import { ListItemSelectItemsUiActionNgDirective } from './list-item-select-items-ui-action-ng.directive';

@Directive()
export abstract class CaptionedItemsCheckboxNgDirective<T> extends ListItemSelectItemsUiActionNgDirective<T> implements OnDestroy {
    readonly checked = model<boolean>(false);

    public checkboxDisabled = true;

    // constructor(
    //     elRef: ElementRef<HTMLElement>,
    //     typeInstanceCreateId: Integer,
    //     cdr: ChangeDetectorRef,
    //     settingsNgService: SettingsNgService,
    //     stateColorItemIdArray: ControlComponentBaseNgDirective.ReadonlyStateColorItemIdArray,
    //     undefinedItem: T,
    // ) {
    //     super(
    //         elRef,
    //         typeInstanceCreateId,
    //         cdr,
    //         settingsNgService.service,
    //         stateColorItemIdArray,
    //         undefinedItem,
    //     );
    // }

    override ngOnDestroy() {
        this.finalise();
    }

    onChange(checked: boolean) {
        const oldValue = this.uiAction.value;
        let newValue: T[];
        if (checked) {
            if (oldValue === undefined) {
                newValue = [this.item];
            } else {
                newValue = concatenateElementToArrayUniquely(oldValue, this.item);
            }
        } else {
            if (oldValue === undefined) {
                newValue = []; // control always makes value defined
            } else {
                newValue = subtractElementFromArrayUniquely(oldValue, this.item);
            }
        }

        this.commitValue(newValue);
    }

    protected override applyValue(value: T[] | undefined, edited: boolean) {
        super.applyValue(value, edited);
        const newChecked = value === undefined ? false : value.includes(this.item);

        if (newChecked !== this.checked()) {
            this.checked.set(newChecked);
            this.markForCheck();
        }
    }

    protected override applyStateId(newStateId: UiAction.StateId) {
        super.applyStateId(newStateId);
    }

    protected override applyFilter(filter: T[] | undefined) {
        super.applyFilter(filter);
        this.updateCheckboxDisabled();
    }

    protected override applyItems() {
        super.applyItems();
        this.updateCheckboxDisabled();
    }

    protected override finalise() {
        super.finalise();
    }

    private updateCheckboxDisabled() {
        const filter = this.uiAction.filter;
        this.checkboxDisabled = this.disabled || (filter !== undefined && !filter.includes(this.item));
    }
}
