import { AfterViewInit, ChangeDetectionStrategy, Component, input, viewChild } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { delay1Tick, isArrayEqualUniquely } from '@pbkware/js-utils';
import { UiAction } from '@pbkware/ui-action';
import { StringId, Strings, TradingMarket, TradingMarketUiAction } from '@plxtra/motif-core';
import { NgSelectUtils } from '../../../ng-select-utils';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';

@Component({
    selector: 'app-trading-market-input',
    templateUrl: './trading-market-input-ng.component.html',
    styleUrls: ['./trading-market-input-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class TradingMarketInputNgComponent extends ControlComponentBaseNgDirective implements AfterViewInit {
    private static typeInstanceCreateCount = 0;

    readonly inputId = input<string>();

    public inputAttrs: InputAttrs = { size: '5' };
    public selected: TradingMarket | undefined;
    public allowedValues: TradingMarket[] = [];

    private readonly _ngSelectComponentSignal = viewChild.required<NgSelectComponent>('ngSelect');

    private _ngSelectComponent: NgSelectComponent;

    constructor() {
        super(++TradingMarketInputNgComponent.typeInstanceCreateCount, ControlComponentBaseNgDirective.textControlStateColorItemIdArray);
    }

    public override get uiAction() { return super.uiAction as TradingMarketUiAction; }

    ngAfterViewInit(): void {
        this._ngSelectComponent = this._ngSelectComponentSignal();

        delay1Tick(() => this.setInitialiseReady());
    }

    public customSearchFtn(term: string, item: TradingMarket) {
        term = term.toUpperCase();
        return item.upperSymbologyCode.includes(term) || item.upperDisplay.includes(term);
    }

    public handleSelectChangeEvent(event: unknown) {
        const changeEvent = event as ChangeEvent;

        if (changeEvent !== undefined && changeEvent !== null) {
            this.commitValue(changeEvent, UiAction.CommitTypeId.Explicit);
        } else {
            if (!this.uiAction.valueRequired) {
                this.commitValue(undefined, UiAction.CommitTypeId.Explicit);
            }
        }
    }

    public handleSelectSearchEvent(event: SearchEvent) {
        const text = event.term;
        let value: TradingMarket | undefined;
        let valid: boolean;
        let missing: boolean;
        let errorText: string | undefined;
        if (text === '') {
            value = undefined;
            missing = this.uiAction.valueRequired;
            if (missing) {
                valid = false;
                errorText = Strings[StringId.ValueRequired];
            } else {
                valid = true;
                errorText = undefined;
            }
        } else {
            missing = false;
            if (event.items.length === 1) {
                const onlyItem = event.items[0];
                const upperText = text.toUpperCase();
                if (upperText === onlyItem.upperSymbologyCode || upperText === onlyItem.upperSymbologyCode) {
                    value = event.items[0];
                    valid = true;
                    errorText = undefined;
                } else {
                    value = undefined;
                    valid = false;
                    errorText = Strings[StringId.BrokerageAccountNotMatched];
                }
            } else {
                value = undefined;
                valid = false;
                if (event.items.length === 0) {
                    errorText = Strings[StringId.BrokerageAccountNotFound];
                } else {
                    errorText = Strings[StringId.BrokerageAccountNotMatched];
                }
            }
        }

        this.uiAction.input(text, valid, missing, errorText);

        if (valid && this.uiAction.commitOnAnyValidInput) {
            this.uiAction.commitValue(value, UiAction.CommitTypeId.Input);
        }
    }

    protected override setStateColors(stateId: UiAction.StateId) {
        super.setStateColors(stateId);

        NgSelectUtils.ApplyColors(this._ngSelectComponent.element, this.foreColor, this.bkgdColor);
    }

    protected override setUiAction(action: TradingMarketUiAction) {
        const pushEventHandlersInterface = super.setUiAction(action) as TradingMarketUiAction.PushEventHandlersInterface;

        pushEventHandlersInterface.value = (value, edited) => this.handleValuePushEvent(value, edited);
        pushEventHandlersInterface.allowedValues = (allowedValues) => this.handleAllowedValuesPushEvent(allowedValues);

        this.applyValue(action.value, action.edited);
        this.applyAllowedValues(action.allowedValues);

        return pushEventHandlersInterface;
    }

    private handleValuePushEvent(value: TradingMarket | undefined, edited: boolean) {
        this.applyValue(value, edited);
    }

    private handleAllowedValuesPushEvent(allowedValues: readonly TradingMarket[]) {
        const arraysEqual = isArrayEqualUniquely(allowedValues, this.allowedValues);
        if (!arraysEqual) {
            this.applyAllowedValues(allowedValues);
        }
    }

    private applyValue(value: TradingMarket | undefined, edited: boolean) {
        if (!edited) {
            this._ngSelectComponent.searchTerm = '';
            if (value === undefined) {
                this.selected = undefined;
            } else {
                this.selected = value;
            }
            this.markForCheck();
        }
    }

    private applyAllowedValues(allowedValues: readonly TradingMarket[]) {
        this.allowedValues = allowedValues.slice();
        this.markForCheck();
    }

    private commitValue(value: TradingMarket | undefined, typeId: UiAction.CommitType.NotInputId) {
        this.uiAction.commitValue(value, typeId);
    }
}

type InputAttrs = Record<string, string>;

interface SearchEvent {
    term: string;
    items: TradingMarket[];
}

type ChangeEvent = TradingMarket | undefined | null;
