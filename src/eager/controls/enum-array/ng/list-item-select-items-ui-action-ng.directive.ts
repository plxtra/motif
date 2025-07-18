import { ChangeDetectorRef, Directive, ElementRef } from '@angular/core';
import { Integer } from '@pbkware/js-utils';
import { SelectItemsUiAction } from '@pbkware/ui-action';
import { SettingsService } from '@plxtra/motif-core';
import { ControlComponentBaseNgDirective } from '../../ng/control-component-base-ng.directive';
import { SelectItemsUiActionNgDirective } from './select-items-ui-action-ng.directive';

@Directive()
export abstract class ListItemSelectItemsUiActionNgDirective<T> extends SelectItemsUiActionNgDirective<T> {
    public itemCaption = '';
    public itemTitle = '';

    private _item: T;

    constructor(
        elRef: ElementRef<HTMLElement>,
        typeInstanceCreateId: Integer,
        cdr: ChangeDetectorRef,
        settingsService: SettingsService,
        stateColorItemIdArray: ControlComponentBaseNgDirective.ReadonlyStateColorItemIdArray,
        undefinedItem: T,
    ) {
        super(
            elRef,
            typeInstanceCreateId,
            cdr,
            settingsService,
            stateColorItemIdArray,
        )
        this._item = undefinedItem;
    }

    protected get item() { return this._item; }

    initialiseEnum(action: SelectItemsUiAction<T>, item: T) {
        this._item = item;
        this.initialise(action);
        this.applyItems();
    }

    protected override applyItemTitle(item: T, title: string) {
        super.applyItemTitle(item, title);
        if (item === this.item && title !== this.itemTitle) {
            this.itemTitle = title;
            this.markForCheck();
        }
    }

    protected override applyItemCaption(item: T, caption: string) {
        super.applyItemCaption(item, caption);
        if (item === this.item && caption !== this.itemCaption) {
            this.itemCaption = caption;
            this.applyCaption(caption);
            this.markForCheck();
        }
    }

    protected override applyItems() {
        super.applyItems();
        const properties = this.uiAction.getItemProperties(this._item);
        if (properties === undefined) {
            this.itemCaption = '?';
            this.itemTitle = '?';
        } else {
            this.itemCaption = properties.caption;
            this.itemTitle = properties.title;
        }
        this.markForCheck();
    }
}
