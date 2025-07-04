import {
    ChangeDetectorRef,
    Directive,
    ElementRef
} from '@angular/core';
import { Integer } from '@pbkware/js-utils';
import { Market, MarketIvemId, MarketIvemIdUiAction, SettingsService, SymbolsService } from '@plxtra/motif-core';
import { ControlComponentBaseNgDirective } from '../../ng/control-component-base-ng.directive';

@Directive()
export abstract class ReadonlyMarketIvemIdNgDirective<T extends Market> extends ControlComponentBaseNgDirective {
    public symbol = ReadonlyMarketIvemIdNgDirective.emptySymbol;

    constructor(
        elRef: ElementRef<HTMLElement>,
        typeInstanceCreateId: Integer,
        cdr: ChangeDetectorRef,
        settingsService: SettingsService,
        protected readonly _symbolsService: SymbolsService,
        stateColorItemIdArray: ControlComponentBaseNgDirective.ReadonlyStateColorItemIdArray,
    ) {
        super(elRef, typeInstanceCreateId, cdr, settingsService, stateColorItemIdArray);
    }

    public override get uiAction() { return super.uiAction as MarketIvemIdUiAction<T>; }

    protected override pushSettings() {
        super.pushSettings();
        this.applyValue(this.uiAction.value, false);
    }

    protected applyValue(value: MarketIvemId<T> | undefined, edited: boolean, selectAll = true) {
        if (!edited) {
            let symbol: string;
            if (value === undefined) {
                symbol = ReadonlyMarketIvemIdNgDirective.emptySymbol;
            } else {
                symbol = this._symbolsService.marketIvemIdToDisplay(value);
            }

            if (symbol !== this.symbol) {
                this.symbol = symbol;
                this.markForCheck();
            }

            if (selectAll) {
//                delay1Tick(() => this.selectAllText() );
            }
        }
    }
    protected override setUiAction(action: MarketIvemIdUiAction<T>) {
        const pushEventHandlersInterface = super.setUiAction(action) as MarketIvemIdUiAction.PushEventHandlersInterface<T>;

        pushEventHandlersInterface.value = (value, edited, selectAll) => this.handleValuePushEvent(value, edited, selectAll);

        this.applyValue(action.value, action.edited);

        return pushEventHandlersInterface;
    }

    private handleValuePushEvent(value: MarketIvemId<T> | undefined, edited: boolean, selectAll: boolean) {
        this.applyValue(value, edited, selectAll);
    }

    // protected abstract selectAllText(): void;
}

export namespace ReadonlyMarketIvemIdNgDirective {
    export const emptySymbol = '';
}
