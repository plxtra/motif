import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, viewChild } from '@angular/core';
import { delay1Tick } from '@pbkware/js-utils';
import { BooleanUiAction, NumberUiAction } from '@pbkware/ui-action';
import { StringId, Strings } from '@plxtra/motif-core';
import { ComponentInstanceId } from 'component-internal-api';
import { SettingsNgService } from 'component-services-ng-api';
import { CaptionedCheckboxNgComponent, CaptionLabelNgComponent, NumberInputNgComponent } from 'controls-ng-api';
import { ScanFieldConditionOperandsEditorNgDirective } from '../../ng/ng-api';
import { NumericRangeScanFieldConditionOperandsEditorFrame } from '../numeric-range-scan-field-condition-operands-editor-frame';

@Component({
    selector: 'app-numeric-range-scan-field-condition-operands-editor',
    templateUrl: './numeric-range-scan-field-condition-operands-editor-ng.component.html',
    styleUrls: ['./numeric-range-scan-field-condition-operands-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class NumericRangeScanFieldConditionOperandsEditorNgComponent extends ScanFieldConditionOperandsEditorNgDirective implements AfterViewInit {
    declare readonly _frame: NumericRangeScanFieldConditionOperandsEditorNgComponent.Frame;

    private readonly _notControlComponentSignal = viewChild.required<CaptionedCheckboxNgComponent>('notControl');
    private readonly _minLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('minLabel');
    private readonly _minControlComponentSignal = viewChild.required<NumberInputNgComponent>('minControl');
    private readonly _maxLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('maxLabel');
    private readonly _maxControlComponentSignal = viewChild.required<NumberInputNgComponent>('maxControl');

    private readonly _notUiAction: BooleanUiAction;
    private readonly _minUiAction: NumberUiAction;
    private readonly _maxUiAction: NumberUiAction;

    private _notControlComponent: CaptionedCheckboxNgComponent;
    private _minLabelComponent: CaptionLabelNgComponent;
    private _minControlComponent: NumberInputNgComponent;
    private _maxLabelComponent: CaptionLabelNgComponent;
    private _maxControlComponent: NumberInputNgComponent;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.frameInjectionToken) frame: NumericRangeScanFieldConditionOperandsEditorNgComponent.Frame,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.modifierRootInjectionToken) modifierRoot: ComponentInstanceId,
    ) {
        super(elRef, ++NumericRangeScanFieldConditionOperandsEditorNgComponent.typeInstanceCreateCount, cdr, settingsNgService, frame, modifierRoot);

        this._notUiAction = this.createNotUiAction();
        this._minUiAction = this.createMinUiAction();
        this._maxUiAction = this.createMaxUiAction();
        this.pushAll();
    }

    ngAfterViewInit(): void {
        this._notControlComponent = this._notControlComponentSignal();
        this._minLabelComponent = this._minLabelComponentSignal();
        this._minControlComponent = this._minControlComponentSignal();
        this._maxLabelComponent = this._maxLabelComponentSignal();
        this._maxControlComponent = this._maxControlComponentSignal();

        delay1Tick(() => this.initialiseComponents());
    }

    protected override finalise() {
        this._minUiAction.finalise();
        this._maxUiAction.finalise();
        this._notUiAction.finalise();
        super.finalise();
    }

    protected override pushAll() {
        this._minUiAction.pushValue(this._frame.min);
        this._maxUiAction.pushValue(this._frame.max);
        this._notUiAction.pushValue(this._frame.not);
        super.pushAll();
    }

    private createMinUiAction() {
        const action = new NumberUiAction(false);
        action.pushCaption(Strings[StringId.RangeScanFieldConditionOperandsCaption_Min]);
        action.pushTitle(Strings[StringId.NumericRangeValueScanFieldConditionOperandsTitle_Min]);
        action.commitEvent = () => {
            if (this._frame.setMin(this._minUiAction.value, this._modifier)) {
                this.markForCheck();
            }
        }

        return action;
    }

    private createMaxUiAction() {
        const action = new NumberUiAction(false);
        action.pushCaption(Strings[StringId.RangeScanFieldConditionOperandsCaption_Max]);
        action.pushTitle(Strings[StringId.NumericRangeValueScanFieldConditionOperandsTitle_Max]);
        action.commitEvent = () => {
            if (this._frame.setMax(this._maxUiAction.value, this._modifier)) {
                this.markForCheck();
            }
        }

        return action;
    }

    private createNotUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.Not]);
        action.pushTitle(Strings[StringId.ScanFieldConditionOperandsEditor_NotInRange]);
        action.commitEvent = () => {
            if (this._frame.negateOperator(this._modifier)) {
                this.markForCheck();
            }
        };

        return action;
    }

    private initialiseComponents() {
        this._notControlComponent.initialise(this._notUiAction);
        this._minLabelComponent.initialise(this._minUiAction);
        this._minControlComponent.initialise(this._minUiAction);
        this._maxLabelComponent.initialise(this._maxUiAction);
        this._maxControlComponent.initialise(this._maxUiAction);
    }
}

export namespace NumericRangeScanFieldConditionOperandsEditorNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type Frame = NumericRangeScanFieldConditionOperandsEditorFrame;
}
