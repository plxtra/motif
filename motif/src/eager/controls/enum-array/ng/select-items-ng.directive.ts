import { AfterViewInit, ChangeDetectorRef, Directive, ElementRef, input, viewChild } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Integer, MultiEvent } from '@pbkware/js-utils';
import { UiAction } from '@pbkware/ui-action';
import { SettingsService } from '@plxtra/motif-core';
import { NgSelectUtils } from '../../ng-select-utils';
import { ControlComponentBaseNgDirective } from '../../ng/control-component-base-ng.directive';
import { NgSelectOverlayNgService } from '../../ng/ng-select-overlay-ng.service';
import { SelectItemsUiActionNgDirective } from './select-items-ui-action-ng.directive';

@Directive()
export abstract class SelectItemsNgDirective<T> extends SelectItemsUiActionNgDirective<T> implements AfterViewInit {
    readonly inputSize = input('8em');

    public selected: T[];
    public entries: Entry<T>[] = [];

    private readonly _ngSelectComponentSignal = viewChild.required<NgSelectComponent>('ngSelect');

    private _ngSelectComponent: NgSelectComponent;

    private _measureCanvasContextsEventSubscriptionId: MultiEvent.SubscriptionId;
    private _measureCanvasContext: CanvasRenderingContext2D;
    private _ngSelectDropDownPanelWidth: number | undefined;

    constructor(
        elRef: ElementRef<HTMLElement>,
        typeInstanceCreateCount: Integer,
        cdr: ChangeDetectorRef,
        private readonly _ngSelectOverlayNgService: NgSelectOverlayNgService,
        settingsService: SettingsService,
        stateColorItemIdArray: ControlComponentBaseNgDirective.ReadonlyStateColorItemIdArray,
    ) {
        super(
            elRef,
            typeInstanceCreateCount,
            cdr,
            settingsService,
            stateColorItemIdArray,
        );
        this._measureCanvasContext = this._ngSelectOverlayNgService.measureCanvasContext;
        this._measureCanvasContextsEventSubscriptionId = this._ngSelectOverlayNgService.subscribeMeasureCanvasContextsEvent(
            () => this.handleMeasureCanvasContextsEvent()
        );
    }

    ngAfterViewInit() {
        this._ngSelectComponent = this._ngSelectComponentSignal();
        this._ngSelectComponent.element.style.setProperty(inputSizeCssCustomPropertyName, this.inputSize());
    }

    public compareWithFtn(entry: Entry<T>, item: T) {
        return entry.item === item;
    }

    public customSearchFtn(term: string, item: Entry<T>) {
        term = term.toUpperCase();
        return item.upperCaption.includes(term);
    }

    public handleSelectChangeEvent(event: ChangeEvent<T>) {
        if (event === undefined || event === null) {
            this.commitValue(undefined);
        } else {
            const count = event.length;
            const value = new Array<T>(count);
            for (let i = 0; i < count; i++) {
                value[i] = event[i].item;
            }
            this.commitValue(value);
        }
    }

    public handleSelectSearchEvent(event: SearchEvent<T>) {
        // const items = event.items;
        // const count = items.length;
        // const value = new Array<Integer>(count);
        // for (let i = 0; i < count; i++) {
        //     value[i] = items[i].element;
        // }
        // this.inputValue(value);
    }

    public handleSelectOpenEvent() {
        this._ngSelectOverlayNgService.notifyDropDownOpen();

        this._ngSelectDropDownPanelWidth ??= this.calculateNgSelectDropDownPanelWidth();
        this._ngSelectOverlayNgService.setDropDownPanelClientWidth(this._ngSelectDropDownPanelWidth, false);
    }

    protected override setStateColors(stateId: UiAction.StateId) {
        super.setStateColors(stateId);

        NgSelectUtils.ApplyColors(this._ngSelectComponent.element, this.foreColor, this.bkgdColor);
    }

    protected override applyValue(value: T[] | undefined, edited: boolean) {
        if (!edited) {
            super.applyValue(value, edited);
            this._ngSelectComponent.searchTerm = '';
            if (value === undefined) {
                this.selected = [];
            } else {
                this.selected = value;
            }
            // if (value === undefined) {
            //     this.selected = undefined;
            // } else {
            //     const entry = this.findEntry(value);
            //     this.selected = entry.element;
            // }
            this.markForCheck();
        }
    }

    protected override applyFilter(filter: T[] | undefined) {
        super.applyFilter(filter);
        this.updateEntries();
        this._ngSelectDropDownPanelWidth = undefined; // force recalculation
    }

    protected override applyItemCaption(element: T, caption: string) {
        super.applyItemCaption(element, caption);
        this.updateEntries();
        this._ngSelectDropDownPanelWidth = undefined; // force recalculation
    }

    protected override applyItems() {
        super.applyItems();
        this.updateEntries();
        this._ngSelectDropDownPanelWidth = undefined; // force recalculation
    }

    protected override finalise() {
        this._ngSelectOverlayNgService.unsubscribeMeasureCanvasContextsEvent(this._measureCanvasContextsEventSubscriptionId);
        super.finalise();
    }

    private handleMeasureCanvasContextsEvent() {
        this._measureCanvasContext = this._ngSelectOverlayNgService.measureCanvasContext;
        this._ngSelectDropDownPanelWidth = undefined; // force recalculation
    }

    private calculateNgSelectDropDownPanelWidth() {
        let maxWidth = 0;
        const filter = this.uiAction.filter;
        const itemPropertiesArray = this.uiAction.getItemPropertiesArray();
        for (const properties of itemPropertiesArray) {
            const item = properties.item;
            if (filter === undefined || filter.includes(item)) {
                const caption = properties.caption;
                const metrics = this._measureCanvasContext.measureText(caption);
                if (metrics.width > maxWidth) {
                    maxWidth = metrics.width;
                }
            }
        }

        const componentWidth = this._ngSelectComponent.element.offsetWidth;
        if (maxWidth < componentWidth) {
            maxWidth = componentWidth;
        }

        return maxWidth;
    }

    private updateEntries() {
        const filter = this.uiAction.filter;

        const itemPropertiesArray = this.uiAction.getItemPropertiesArray();
        const maxCount = itemPropertiesArray.length;
        const entries = new Array<Entry<T>>(maxCount);
        let count = 0;
        for (const properties of itemPropertiesArray) {
            const item = properties.item;
            if (filter === undefined || filter.includes(item)) {
                const caption = properties.caption;
                const title = properties.title;
                const entry: Entry<T> = {
                    item,
                    caption,
                    upperCaption: caption.toUpperCase(),
                    title,
                };
                entries[count++] = entry;
            }
        }

        entries.length = count;
        this.entries = entries;
        this.markForCheck();
    }
}

const inputSizeCssCustomPropertyName = '--inputSize';

interface Entry<T> {
    item: T;
    caption: string;
    upperCaption: string;
    title: string;
}

interface SearchEvent<T> {
    term: string;
    items: Entry<T>[];
}

type ChangeEvent<T> = Entry<T>[] | undefined | null;
