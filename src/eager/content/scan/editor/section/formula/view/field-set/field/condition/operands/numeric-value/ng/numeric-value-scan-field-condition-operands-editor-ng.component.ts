import { AfterViewInit, ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { delay1Tick } from '@pbkware/js-utils';
import { BooleanUiAction, NumberUiAction } from '@pbkware/ui-action';
import { StringId, Strings } from '@plxtra/motif-core';
import { ComponentInstanceId } from 'component-internal-api';
import { CaptionedCheckboxNgComponent, CaptionLabelNgComponent, NumberInputNgComponent } from 'controls-ng-api';
import { ScanFieldConditionOperandsEditorNgDirective } from '../../ng/ng-api';
import { NumericValueScanFieldConditionOperandsEditorFrame } from '../numeric-value-scan-field-condition-operands-editor-frame';

@Component({
    selector: 'app-numeric-value-scan-field-condition-operands-editor',
    templateUrl: './numeric-value-scan-field-condition-operands-editor-ng.component.html',
    styleUrls: ['./numeric-value-scan-field-condition-operands-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class NumericValueScanFieldConditionOperandsEditorNgComponent extends ScanFieldConditionOperandsEditorNgDirective implements AfterViewInit {
    declare readonly _frame: NumericValueScanFieldConditionOperandsEditorNgComponent.Frame;

    private readonly _notControlComponentSignal = viewChild.required<CaptionedCheckboxNgComponent>('notControl');
    private readonly _valueLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('valueLabel');
    private readonly _valueControlComponentSignal = viewChild.required<NumberInputNgComponent>('valueControl');

    private readonly _notUiAction: BooleanUiAction;
    private readonly _valueUiAction: NumberUiAction;

    private _notControlComponent: CaptionedCheckboxNgComponent;
    private _valueLabelComponent: CaptionLabelNgComponent;
    private _valueControlComponent: NumberInputNgComponent;

    constructor() {
        const frame = inject<NumericValueScanFieldConditionOperandsEditorNgComponent.Frame>(ScanFieldConditionOperandsEditorNgDirective.frameInjectionToken);
        const modifierRoot = inject<ComponentInstanceId>(ScanFieldConditionOperandsEditorNgDirective.modifierRootInjectionToken);

        super(++NumericValueScanFieldConditionOperandsEditorNgComponent.typeInstanceCreateCount, frame, modifierRoot);

        this._notUiAction = this.createNotUiAction();
        this._valueUiAction = this.createValueUiAction();
        this.pushAll();
    }

    ngAfterViewInit(): void {
        this._notControlComponent = this._notControlComponentSignal();
        this._valueLabelComponent = this._valueLabelComponentSignal();
        this._valueControlComponent = this._valueControlComponentSignal();

        delay1Tick(() => this.initialiseComponents());
    }

    protected override finalise() {
        this._valueUiAction.finalise();
        this._notUiAction.finalise();
        super.finalise();
    }

    protected override pushAll() {
        this._valueUiAction.pushValue(this._frame.value);
        this._notUiAction.pushValue(this._frame.not);
        super.pushAll();
    }

    private createValueUiAction() {
        const action = new NumberUiAction();
        action.pushCaption(Strings[StringId.ValueScanFieldConditionOperandsCaption_Value]);
        action.pushTitle(Strings[StringId.NumericValueScanFieldConditionOperandsTitle_Value]);
        action.commitEvent = () => {
            if (this._frame.setValue(this._valueUiAction.value, this._modifier)) {
                this.markForCheck();
            }
        }

        return action;
    }

    private createNotUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.Not]);
        action.pushTitle(Strings[StringId.ScanFieldConditionOperandsEditor_NotEqualsValue]);
        action.commitEvent = () => {
            if (this._frame.negateOperator(this._modifier)) {
                this.markForCheck();
            }
        };

        return action;
    }

    private initialiseComponents() {
        this._notControlComponent.initialise(this._notUiAction);
        this._valueLabelComponent.initialise(this._valueUiAction);
        this._valueControlComponent.initialise(this._valueUiAction);
    }
}

export namespace NumericValueScanFieldConditionOperandsEditorNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type Frame = NumericValueScanFieldConditionOperandsEditorFrame;
}
