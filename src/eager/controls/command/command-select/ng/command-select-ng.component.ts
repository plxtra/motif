import { AfterViewInit, ChangeDetectionStrategy, Component, ViewEncapsulation, inject, viewChild } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { MultiEvent } from '@pbkware/js-utils';
import { UiAction } from '@pbkware/ui-action';
import { BrokerageAccount, Command } from '@plxtra/motif-core';
import { NgSelectUtils } from '../../../ng-select-utils';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { NgSelectOverlayNgService } from '../../../ng/ng-select-overlay-ng.service';
import { CommandComponentNgDirective } from '../../ng/command-component-ng.directive';

@Component({
    selector: 'app-command-select',
    templateUrl: './command-select-ng.component.html',
    styleUrls: ['./command-select-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class CommandSelectNgComponent extends CommandComponentNgDirective implements AfterViewInit {
    private static typeInstanceCreateCount = 0;

    // public selected: ProcessorCommandUiAction.Item | undefined;
    public entries: Entry[] = [];

    private _ngSelectOverlayNgService = inject(NgSelectOverlayNgService);

    private readonly _ngSelectComponentSignal = viewChild.required<NgSelectComponent>('ngSelect');

    private _ngSelectComponent: NgSelectComponent;

    private _measureCanvasContextsEventSubscriptionId: MultiEvent.SubscriptionId;
    private _measureCanvasContext: CanvasRenderingContext2D;
    private _ngSelectDropDownPanelWidth: number | undefined;

    constructor() {
        super(++CommandSelectNgComponent.typeInstanceCreateCount, ControlComponentBaseNgDirective.textControlStateColorItemIdArray);
        this.inputId.set(`EnumInput:${this.typeInstanceId}`);
        this._measureCanvasContext = this._ngSelectOverlayNgService.measureCanvasContext;
        this._measureCanvasContextsEventSubscriptionId = this._ngSelectOverlayNgService.subscribeMeasureCanvasContextsEvent(
            () => this.handleMeasureCanvasContextsEvent()
        );
    }

    ngAfterViewInit(): void {
        this._ngSelectComponent = this._ngSelectComponentSignal();
    }

    public customSearchFtn(term: string, item: Entry) {
        term = term.toUpperCase();
        return item.upperCaption.includes(term);
    }

    public handleSelectChangeEvent(_event: unknown) {
        // const changeEvent = event as ChangeEvent;

        // if (changeEvent === undefined || changeEvent === null) {
        //     this.commitValue(undefined);
        // } else {
        //     this.commitValue(changeEvent.item);
        // }
    }

    public handleSelectSearchEvent(event: SearchEvent) {
        // this.inputValue(event.term, event.items.length === 1);
    }

    public handleSelectOpenEvent() {
        this._ngSelectOverlayNgService.notifyDropDownOpen();

        // this.uiAction.notifyLatestItemsWanted();
        if (this._ngSelectDropDownPanelWidth === undefined) {
            this._ngSelectDropDownPanelWidth = this.calculateNgSelectDropDownPanelWidth();
        }
        this._ngSelectOverlayNgService.setDropDownPanelClientWidth(this._ngSelectDropDownPanelWidth, false);
    }

    protected override setStateColors(stateId: UiAction.StateId) {
        super.setStateColors(stateId);

        NgSelectUtils.ApplyColors(this._ngSelectComponent.element, this.foreColor, this.bkgdColor);
    }

    // protected override applyValue(value: ProcessorCommandUiAction.Item | undefined, edited: boolean) {
    //     if (!edited) {
    //         super.applyValue(value);
    //         this._ngSelectComponent.searchTerm = '';
    //         this.selected = value;
    //         // if (value === undefined) {
    //         //     this.selected = undefined;
    //         // } else {
    //         //     const entry = this.findEntry(value);
    //         //     this.selected = entry.command;
    //         // }
    //         this.markForCheck();
    //     }
    // }

    protected override applyItemCaption(command: Command, caption: string) {
        super.applyItemCaption(command, caption);
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
        // const items = this.uiAction.items;
        // for (const item of items) {
        //     const command = item.command;
        //     const caption = extStrings[command.extensionHandle][command.defaultDisplayIndex];
        //     const metrics = this._measureCanvasContext.measureText(caption);
        //     if (metrics.width > maxWidth) {
        //         maxWidth = metrics.width;
        //     }
        // }

        const componentWidth = this._ngSelectComponent.element.offsetWidth;
        if (maxWidth < componentWidth) {
            maxWidth = componentWidth;
        }

        return maxWidth;
    }

    private updateEntries() {
        // const items = this.uiAction.items;
        // const count = items.length;
        // const entries = new Array<Entry>(count);
        // for (let i = 0; i < count; i++) {
        //     const item = items[i];
        //     const command = item.command;
        //     const caption = extStrings[command.extensionHandle][command.defaultDisplayIndex];
        //     const title = caption;
        //     const entry: Entry = {
        //         item,
        //         caption,
        //         upperCaption: caption.toUpperCase(),
        //         title,
        //     };
        //     entries[i] = entry;
        // }
        // this.entries = entries;
        // this.markForCheck();
    }
}

interface Entry {
    // item: ProcessorCommandUiAction.Item;
    caption: string;
    upperCaption: string;
    title: string;
}

interface SearchEvent {
    term: string;
    items: BrokerageAccount[];
}

// type ChangeEvent = Entry | undefined | null;
