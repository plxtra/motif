import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, viewChild } from '@angular/core';
import { delay1Tick } from '@pbkware/js-utils';
import { IntegerListSelectItemUiAction, NumberUiAction } from '@pbkware/ui-action';
import { NumericComparisonScanFieldCondition, ScanFieldCondition, StringId, Strings } from '@plxtra/motif-core';
import { ComponentInstanceId } from 'component-internal-api';
import { SettingsNgService } from 'component-services-ng-api';
import { CaptionLabelNgComponent, IntegerEnumInputNgComponent, NumberInputNgComponent } from 'controls-ng-api';
import { ScanFieldConditionOperandsEditorNgDirective } from '../../ng/ng-api';
import { NumericComparisonValueScanFieldConditionOperandsEditorFrame } from '../numeric-comparison-value-scan-field-condition-operands-editor-frame';

@Component({
    selector: 'app-numeric-comparison-value-scan-field-condition-operands-editor',
    templateUrl: './numeric-comparison-value-scan-field-condition-operands-editor-ng.component.html',
    styleUrls: ['./numeric-comparison-value-scan-field-condition-operands-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class NumericComparisonValueScanFieldConditionOperandsEditorNgComponent extends ScanFieldConditionOperandsEditorNgDirective implements AfterViewInit {
    declare readonly _frame: NumericComparisonValueScanFieldConditionOperandsEditorNgComponent.Frame;

    // private readonly _operatorLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('operatorLabel');
    private readonly _operatorControlComponentSignal = viewChild.required<IntegerEnumInputNgComponent>('operatorControl');
    private readonly _valueLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('valueLabel');
    private readonly _valueControlComponentSignal = viewChild.required<NumberInputNgComponent>('valueControl');

    private readonly _operatorUiAction: IntegerListSelectItemUiAction;
    private readonly _valueUiAction: NumberUiAction;

    private _operatorControlComponent: IntegerEnumInputNgComponent;
    private _valueLabelComponent: CaptionLabelNgComponent;
    private _valueControlComponent: NumberInputNgComponent;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.frameInjectionToken) frame: NumericComparisonValueScanFieldConditionOperandsEditorNgComponent.Frame,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.modifierRootInjectionToken) modifierRoot: ComponentInstanceId,
    ) {
        super(elRef, ++NumericComparisonValueScanFieldConditionOperandsEditorNgComponent.typeInstanceCreateCount, cdr, settingsNgService, frame, modifierRoot);

        this._operatorUiAction = this.createOperatorUiAction();
        this._valueUiAction = this.createValueUiAction();
        this.pushAll();
    }

    public override get affirmativeOperatorDisplayLines() { return ['']; }

    ngAfterViewInit(): void {
        this._operatorControlComponent = this._operatorControlComponentSignal();
        this._valueLabelComponent = this._valueLabelComponentSignal();
        this._valueControlComponent = this._valueControlComponentSignal();

        delay1Tick(() => this.initialiseComponents());
    }

    protected override finalise() {
        this._valueUiAction.finalise();
        this._operatorUiAction.finalise();
        super.finalise();
    }


    protected override pushAll() {
        this._valueUiAction.pushValue(this._frame.value);
        this._operatorUiAction.pushValue(this._frame.operatorId);
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

    private createOperatorUiAction() {
        const action = new IntegerListSelectItemUiAction(false);
        action.pushCaption(Strings[StringId.NumericComparisonValueScanFieldConditionOperandsCaption_Operator]);
        action.pushTitle(Strings[StringId.NumericComparisonValueScanFieldConditionOperandsTitle_Operator]);
        const ids = NumericComparisonScanFieldCondition.ValueOperands.supportedOperatorIds;
        const list = ids.map<IntegerListSelectItemUiAction.ItemProperties>(
            (id) => ({
                    item: id,
                    caption: ScanFieldCondition.Operator.idToCode(id),
                    title: ScanFieldCondition.Operator.idToDescription(id),
                }
            )
        );
        action.pushList(list, undefined);
        action.commitEvent = () => {
            if (this._frame.setOperatorId(this._operatorUiAction.definedValue, this._modifier)) {
                this.markForCheck();
            }
        }

        return action;
    }

    private initialiseComponents() {
        // this._operatorLabelComponent.initialise(this._operatorUiAction);
        this._operatorControlComponent.initialise(this._operatorUiAction);
        this._valueLabelComponent.initialise(this._valueUiAction);
        this._valueControlComponent.initialise(this._valueUiAction);
    }
}

export namespace NumericComparisonValueScanFieldConditionOperandsEditorNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type Frame = NumericComparisonValueScanFieldConditionOperandsEditorFrame;
}
