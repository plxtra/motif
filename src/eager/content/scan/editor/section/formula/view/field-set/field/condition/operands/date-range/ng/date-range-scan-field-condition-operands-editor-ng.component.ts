import { AfterViewInit, ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { delay1Tick, SourceTzOffsetDate } from '@pbkware/js-utils';
import { BooleanUiAction, DateUiAction } from '@pbkware/ui-action';
import { StringId, Strings } from '@plxtra/motif-core';
import { ComponentInstanceId } from 'component-internal-api';
import { CaptionedCheckboxNgComponent, CaptionLabelNgComponent, DateInputNgComponent } from 'controls-ng-api';
import { ScanFieldConditionOperandsEditorNgDirective } from '../../ng/ng-api';
import { DateRangeScanFieldConditionOperandsEditorFrame } from '../date-range-scan-field-condition-operands-editor-frame';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
    selector: 'app-date-range-scan-field-condition-operands-editor',
    templateUrl: './date-range-scan-field-condition-operands-editor-ng.component.html',
    styleUrls: ['./date-range-scan-field-condition-operands-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SvgIconComponent, CaptionedCheckboxNgComponent, CaptionLabelNgComponent, DateInputNgComponent]
})
export class DateRangeScanFieldConditionOperandsEditorNgComponent extends ScanFieldConditionOperandsEditorNgDirective implements AfterViewInit {
    declare readonly _frame: DateRangeScanFieldConditionOperandsEditorNgComponent.Frame;

    private readonly _notControlComponentSignal = viewChild.required<CaptionedCheckboxNgComponent>('notControl');
    private readonly _minLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('minLabel');
    private readonly _minControlComponentSignal = viewChild.required<DateInputNgComponent>('minControl');
    private readonly _maxLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('maxLabel');
    private readonly _maxControlComponentSignal = viewChild.required<DateInputNgComponent>('maxControl');

    private readonly _notUiAction: BooleanUiAction;
    private readonly _minUiAction: DateUiAction;
    private readonly _maxUiAction: DateUiAction;

    private _notControlComponent: CaptionedCheckboxNgComponent;
    private _minLabelComponent: CaptionLabelNgComponent;
    private _minControlComponent: DateInputNgComponent;
    private _maxLabelComponent: CaptionLabelNgComponent;
    private _maxControlComponent: DateInputNgComponent;

    constructor() {
        const frame = inject<DateRangeScanFieldConditionOperandsEditorNgComponent.Frame>(ScanFieldConditionOperandsEditorNgDirective.frameInjectionToken);
        const modifierRoot = inject<ComponentInstanceId>(ScanFieldConditionOperandsEditorNgDirective.modifierRootInjectionToken);

        super(++DateRangeScanFieldConditionOperandsEditorNgComponent.typeInstanceCreateCount, frame, modifierRoot);

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
        const min = this._frame.min;
        if (min === undefined) {
            this._minUiAction.pushValue(undefined);
        } else {
            this._minUiAction.pushValue(min.utcMidnight);
        }
        const max = this._frame.max;
        if (max === undefined) {
            this._maxUiAction.pushValue(undefined);
        } else {
            this._maxUiAction.pushValue(max.utcMidnight);
        }
        this._notUiAction.pushValue(this._frame.not);
        super.pushAll();
    }

    private createMinUiAction() {
        const action = new DateUiAction(false);
        action.pushCaption(Strings[StringId.RangeScanFieldConditionOperandsCaption_Min]);
        action.pushTitle(Strings[StringId.DateRangeValueScanFieldConditionOperandsTitle_Min]);
        action.commitEvent = () => {
            const min = this._minUiAction.value;
            const sourceTzOffsetDate = min === undefined ? undefined : SourceTzOffsetDate.createFromUtcDate(min);
            if (this._frame.setMin(sourceTzOffsetDate, this._modifier)) {
                this.markForCheck();
            }
        }

        return action;
    }

    private createMaxUiAction() {
        const action = new DateUiAction(false);
        action.pushCaption(Strings[StringId.RangeScanFieldConditionOperandsCaption_Max]);
        action.pushTitle(Strings[StringId.DateRangeValueScanFieldConditionOperandsTitle_Max]);
        action.commitEvent = () => {
            const max = this._maxUiAction.value;
            const sourceTzOffsetDate = max === undefined ? undefined : SourceTzOffsetDate.createFromUtcDate(max);
            if (this._frame.setMax(sourceTzOffsetDate, this._modifier)) {
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

export namespace DateRangeScanFieldConditionOperandsEditorNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type Frame = DateRangeScanFieldConditionOperandsEditorFrame;
}
