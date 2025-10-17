import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, input, viewChild } from '@angular/core';
import { NgSelectComponent, NgOptionTemplateDirective } from '@ng-select/ng-select';
import { isArrayEqualUniquely } from '@pbkware/js-utils';
import { UiAction } from '@pbkware/ui-action';
import { DataMarket, DataMarketUiAction, StringId, Strings } from '@plxtra/motif-core';
import { NgSelectUtils } from '../../../ng-select-utils';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-data-market-route-input',
    templateUrl: './data-market-input-ng.component.html',
    styleUrls: ['./data-market-input-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgSelectComponent, FormsModule, NgOptionTemplateDirective]
})
export class DataMarketInputNgComponent extends ControlComponentBaseNgDirective implements OnInit, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    readonly inputId = input<string>();

    public inputAttrs: InputAttrs = { size: '5' };
    public selected: DataMarket | undefined;
    public allowedValues: DataMarket[] = [];

    private readonly _ngSelectComponentSignal = viewChild.required<NgSelectComponent>('ngSelect');

    private _ngSelectComponent: NgSelectComponent;

    constructor() {
        super(++DataMarketInputNgComponent.typeInstanceCreateCount, ControlComponentBaseNgDirective.textControlStateColorItemIdArray);
    }

    public override get uiAction() { return super.uiAction as DataMarketUiAction; }

    ngOnInit() {
        this.setInitialiseReady();
    }

    ngAfterViewInit(): void {
        this._ngSelectComponent = this._ngSelectComponentSignal();
    }

    public customSearchFtn(term: string, item: DataMarket) {
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
        let value: DataMarket | undefined;
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

    protected override setUiAction(action: DataMarketUiAction) {
        const pushEventHandlersInterface = super.setUiAction(action) as DataMarketUiAction.PushEventHandlersInterface;

        pushEventHandlersInterface.value = (value, edited) => this.handleValuePushEvent(value, edited);
        pushEventHandlersInterface.allowedValues = (allowedValues) => this.handleAllowedValuesPushEvent(allowedValues);

        this.applyValue(action.value, action.edited);
        this.applyAllowedValues(action.allowedValues);

        return pushEventHandlersInterface;
    }

    private handleValuePushEvent(value: DataMarket | undefined, edited: boolean) {
        this.applyValue(value, edited);
    }

    private handleAllowedValuesPushEvent(allowedValues: readonly DataMarket[]) {
        const arraysEqual = isArrayEqualUniquely(allowedValues, this.allowedValues);
        if (!arraysEqual) {
            this.applyAllowedValues(allowedValues);
        }
    }

    private applyValue(value: DataMarket | undefined, edited: boolean) {
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

    private applyAllowedValues(allowedValues: readonly DataMarket[]) {
        this.allowedValues = allowedValues.slice();
        this.markForCheck();
    }

    private commitValue(value: DataMarket | undefined, typeId: UiAction.CommitType.NotInputId) {
        this.uiAction.commitValue(value, typeId);
    }
}

type InputAttrs = Record<string, string>;

interface SearchEvent {
    term: string;
    items: DataMarket[];
}

type ChangeEvent = DataMarket | undefined | null;
