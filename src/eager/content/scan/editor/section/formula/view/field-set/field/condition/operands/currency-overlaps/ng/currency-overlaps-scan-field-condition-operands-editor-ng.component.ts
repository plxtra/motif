import { AfterViewInit, ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { delay1Tick } from '@pbkware/js-utils';
import { BooleanUiAction, IntegerListSelectItemsUiAction } from '@pbkware/ui-action';
import { Currency, StringId, Strings } from '@plxtra/motif-core';
import { ComponentInstanceId } from 'component-internal-api';
import { CaptionedCheckboxNgComponent, CaptionLabelNgComponent, EnumArrayInputNgComponent } from 'controls-ng-api';
import { ScanFieldConditionOperandsEditorNgDirective } from '../../ng/ng-api';
import { CurrencyOverlapsScanFieldConditionOperandsEditorFrame } from '../currency-overlaps-scan-field-condition-operands-editor-frame';

@Component({
    selector: 'app-currency-overlaps-scan-field-condition-operands-editor',
    templateUrl: './currency-overlaps-scan-field-condition-operands-editor-ng.component.html',
    styleUrls: ['./currency-overlaps-scan-field-condition-operands-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class CurrencyOverlapsScanFieldConditionOperandsEditorNgComponent extends ScanFieldConditionOperandsEditorNgDirective implements AfterViewInit {
    declare readonly _frame: CurrencyOverlapsScanFieldConditionOperandsEditorNgComponent.Frame;

    private readonly _notControlComponentSignal = viewChild.required<CaptionedCheckboxNgComponent>('notControl');
    private readonly _currencyLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('currencyLabel');
    private readonly _currencyControlComponentSignal = viewChild.required<EnumArrayInputNgComponent>('currencyControl');

    private readonly _notUiAction: BooleanUiAction;
    private readonly _valuesUiAction: IntegerListSelectItemsUiAction;

    private _notControlComponent: CaptionedCheckboxNgComponent;
    private _currencyLabelComponent: CaptionLabelNgComponent;
    private _currencyControlComponent: EnumArrayInputNgComponent;

    constructor() {
        const frame = inject<CurrencyOverlapsScanFieldConditionOperandsEditorNgComponent.Frame>(ScanFieldConditionOperandsEditorNgDirective.frameInjectionToken);
        const modifierRoot = inject<ComponentInstanceId>(ScanFieldConditionOperandsEditorNgDirective.modifierRootInjectionToken);

        super(++CurrencyOverlapsScanFieldConditionOperandsEditorNgComponent.typeInstanceCreateCount, frame, modifierRoot);

        this._notUiAction = this.createNotUiAction();
        this._valuesUiAction = this.createValuesUiAction();
        this.pushAll();
    }

    ngAfterViewInit(): void {
        this._notControlComponent = this._notControlComponentSignal();
        this._currencyLabelComponent = this._currencyLabelComponentSignal();
        this._currencyControlComponent = this._currencyControlComponentSignal();

        delay1Tick(() => this.initialiseComponents());
    }

    protected override finalise() {
        this._valuesUiAction.finalise();
        this._notUiAction.finalise();
        super.finalise();
    }


    protected override pushAll() {
        this._valuesUiAction.pushValue(this._frame.values);
        this._notUiAction.pushValue(this._frame.not);
        super.pushAll();
    }

    private createValuesUiAction() {
        const action = new IntegerListSelectItemsUiAction();
        action.pushCaption(Strings[StringId.CurrencyOverlapsScanFieldConditionOperandsCaption_Values]);
        action.pushTitle(Strings[StringId.CurrencyOverlapsScanFieldConditionOperandsTitle_Values]);
        const ids = Currency.allIds;
        const list = ids.map<IntegerListSelectItemsUiAction.ItemProperties>(
            (id) => ({
                    item: id,
                    caption: Currency.idToCode(id),
                    title: '',
                }
            )
        );
        action.pushList(list, undefined);
        action.commitEvent = () => {
            if (this._frame.setValues(this._valuesUiAction.definedValue, this._modifier)) {
                this.markForCheck();
            }
        }

        return action;
    }

    private createNotUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.Not]);
        action.pushTitle(Strings[StringId.ScanFieldConditionOperandsEditor_NotOverlaps]);
        action.commitEvent = () => {
            if (this._frame.negateOperator(this._modifier)) {
                this.markForCheck();
            }
        };

        return action;
    }

    private initialiseComponents() {
        this._notControlComponent.initialise(this._notUiAction);
        this._currencyLabelComponent.initialise(this._valuesUiAction);
        this._currencyControlComponent.initialise(this._valuesUiAction);
    }
}

export namespace CurrencyOverlapsScanFieldConditionOperandsEditorNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type Frame = CurrencyOverlapsScanFieldConditionOperandsEditorFrame;
}
