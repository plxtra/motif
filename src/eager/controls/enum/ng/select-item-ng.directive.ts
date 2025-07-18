import { AfterViewInit, ChangeDetectorRef, Directive, ElementRef, viewChild } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { AssertInternalError, Integer, MultiEvent } from '@pbkware/js-utils';
import { UiAction } from '@pbkware/ui-action';
import { BrokerageAccount, SettingsService } from '@plxtra/motif-core';
import { NgSelectUtils } from '../../ng-select-utils';
import { ControlComponentBaseNgDirective } from '../../ng/control-component-base-ng.directive';
import { NgSelectOverlayNgService } from '../../ng/ng-select-overlay-ng.service';
import { SelectItemUiActionNgDirective } from './select-item-ui-action-ng.directive';

@Directive()
export abstract class SelectItemNgDirective<T> extends SelectItemUiActionNgDirective<T> implements AfterViewInit {
    openEventer: EnumInputNgComponent.OpenEventer | undefined;

    public selected: T | undefined;
    public entries: Entry<T>[] = [];

    private readonly _ngSelectComponentSignal = viewChild.required<NgSelectComponent>('ngSelect');

    private _ngSelectComponent: NgSelectComponent;

    private _measureCanvasContextsEventSubscriptionId: MultiEvent.SubscriptionId;
    private _measureCanvasContext: CanvasRenderingContext2D;
    private _ngSelectDropDownPanelWidth: number | undefined;

    constructor(
        elRef: ElementRef<HTMLElement>,
        typeInstanceCreateId: Integer,
        private _ngSelectOverlayNgService: NgSelectOverlayNgService,
        cdr: ChangeDetectorRef,
        settingsService: SettingsService,
        undefinedValue: T,
    ) {
        super(
            elRef,
            typeInstanceCreateId,
            cdr,
            settingsService,
            ControlComponentBaseNgDirective.textControlStateColorItemIdArray,
            undefinedValue,
        );
        this.inputId.set('EnumInput' + this.typeInstanceId);
        this._measureCanvasContext = this._ngSelectOverlayNgService.measureCanvasContext;
        this._measureCanvasContextsEventSubscriptionId = this._ngSelectOverlayNgService.subscribeMeasureCanvasContextsEvent(
            () => this.handleMeasureCanvasContextsEvent()
        );
    }

    ngAfterViewInit(): void {
        this._ngSelectComponent = this._ngSelectComponentSignal();
    }

    public compareWithFn(entry: Entry<T>, item: T) {
        return entry.item === item;
    }

    public customSearchFtn(term: string, item: Entry<T>) {
        term = term.toUpperCase();
        return item.upperCaption.includes(term);
    }

    public handleSelectChangeEvent(event: unknown) {
        const changeEvent = event as ChangeEvent<T>;

        if (changeEvent === undefined || changeEvent === null) {
            this.commitValue(undefined);
        } else {
            this.commitValue(changeEvent.item);
        }
    }

    public handleSelectSearchEvent(event: SearchEvent) {
        // this.inputValue(event.term, event.items.length === 1);
    }

    public handleSelectOpenEvent() {
        if (this.openEventer !== undefined) {
            const promise = this.openEventer();
            promise.then(
                () => {
                    this.setDropDownPanelClientWidth();
                },
                (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'EINCHSOE31313'); }
            );
        } else {
            this.setDropDownPanelClientWidth();
        }
    }

    protected override setStateColors(stateId: UiAction.StateId) {
        super.setStateColors(stateId);

        NgSelectUtils.ApplyColors(this._ngSelectComponent.element, this.foreColor, this.bkgdColor);
    }

    protected override applyValue(value: T | undefined, edited: boolean) {
        if (!edited) {
            this._ngSelectComponent.searchTerm = '';
            this.selected = value;
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

    private setDropDownPanelClientWidth() {
        this._ngSelectOverlayNgService.notifyDropDownOpen();

        if (this._ngSelectDropDownPanelWidth === undefined) {
            this._ngSelectDropDownPanelWidth = this.calculateNgSelectDropDownPanelWidth();
        }
        this._ngSelectOverlayNgService.setDropDownPanelClientWidth(this._ngSelectDropDownPanelWidth, false);
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

interface Entry<T> {
    item: T;
    caption: string;
    upperCaption: string;
    title: string;
}

interface SearchEvent {
    term: string;
    items: BrokerageAccount[];
}

type ChangeEvent<T> = Entry<T> | undefined | null;

export namespace EnumInputNgComponent {
    export type OpenEventer = (this: void) => Promise<void>;
}
