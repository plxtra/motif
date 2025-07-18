import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, viewChild } from '@angular/core';
import { delay1Tick, SourceTzOffsetDate } from '@pbkware/js-utils';
import { BooleanUiAction, DateUiAction } from '@pbkware/ui-action';
import { StringId, Strings } from '@plxtra/motif-core';
import { ComponentInstanceId } from 'component-internal-api';
import { SettingsNgService } from 'component-services-ng-api';
import { CaptionedCheckboxNgComponent, CaptionLabelNgComponent, DateInputNgComponent } from 'controls-ng-api';
import { ScanFieldConditionOperandsEditorNgDirective } from '../../ng/ng-api';
import { DateValueScanFieldConditionOperandsEditorFrame } from '../date-value-scan-field-condition-operands-editor-frame';

@Component({
    selector: 'app-date-value-scan-field-condition-operands-editor',
    templateUrl: './date-value-scan-field-condition-operands-editor-ng.component.html',
    styleUrls: ['./date-value-scan-field-condition-operands-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DateValueScanFieldConditionOperandsEditorNgComponent extends ScanFieldConditionOperandsEditorNgDirective implements AfterViewInit {
    declare readonly _frame: DateValueScanFieldConditionOperandsEditorNgComponent.Frame;

    private readonly _notControlComponentSignal = viewChild.required<CaptionedCheckboxNgComponent>('notControl');
    private readonly _valueLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('valueLabel');
    private readonly _valueControlComponentSignal = viewChild.required<DateInputNgComponent>('valueControl');

    private readonly _notUiAction: BooleanUiAction;
    private readonly _valueUiAction: DateUiAction;

    private _notControlComponent: CaptionedCheckboxNgComponent;
    private _valueLabelComponent: CaptionLabelNgComponent;
    private _valueControlComponent: DateInputNgComponent;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.frameInjectionToken) frame: DateValueScanFieldConditionOperandsEditorNgComponent.Frame,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.modifierRootInjectionToken) modifierRoot: ComponentInstanceId,
    ) {
        super(elRef, ++DateValueScanFieldConditionOperandsEditorNgComponent.typeInstanceCreateCount, cdr, settingsNgService, frame, modifierRoot);

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
        const value = this._frame.value;
        if (value === undefined) {
            this._valueUiAction.pushValue(undefined);
        } else {
            this._valueUiAction.pushValue(value.utcMidnight);
        }
        this._notUiAction.pushValue(this._frame.not);
        super.pushAll();
    }

    private createValueUiAction() {
        const action = new DateUiAction();
        action.pushCaption(Strings[StringId.ValueScanFieldConditionOperandsCaption_Value]);
        action.pushTitle(Strings[StringId.DateValueScanFieldConditionOperandsTitle_Value]);
        action.commitEvent = () => {
            const value = this._valueUiAction.value;
            const sourceTzOffsetDate = value === undefined ? undefined : SourceTzOffsetDate.createFromUtcDate(value);
            if (this._frame.setValue(sourceTzOffsetDate, this._modifier)) {
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

export namespace DateValueScanFieldConditionOperandsEditorNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type Frame = DateValueScanFieldConditionOperandsEditorFrame;
}
