import { AfterViewInit, ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { AssertInternalError, delay1Tick } from '@pbkware/js-utils';
import { BooleanUiAction, StringUiAction } from '@pbkware/ui-action';
import { StringId, Strings } from '@plxtra/motif-core';
import { ComponentInstanceId } from 'component-internal-api';
import { CaptionedCheckboxNgComponent, CaptionLabelNgComponent, TextInputNgComponent } from 'controls-ng-api';
import { ScanFieldConditionOperandsEditorNgDirective } from '../../ng/ng-api';
import { TextValueScanFieldConditionOperandsEditorFrame } from '../text-value-scan-field-condition-operands-editor-frame';

@Component({
    selector: 'app-text-value-scan-field-condition-operands-editor',
    templateUrl: './text-value-scan-field-condition-operands-editor-ng.component.html',
    styleUrls: ['./text-value-scan-field-condition-operands-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class TextValueScanFieldConditionOperandsEditorNgComponent extends ScanFieldConditionOperandsEditorNgDirective implements AfterViewInit {
    declare readonly _frame: TextValueScanFieldConditionOperandsEditorNgComponent.Frame;

    private readonly _notControlComponentSignal = viewChild.required<CaptionedCheckboxNgComponent>('notControl');
    private readonly _valueLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('valueLabel');
    private readonly _valueControlComponentSignal = viewChild.required<TextInputNgComponent>('valueControl');

    private readonly _notUiAction: BooleanUiAction;
    private readonly _valueUiAction: StringUiAction;

    private _notControlComponent: CaptionedCheckboxNgComponent;
    private _valueLabelComponent: CaptionLabelNgComponent;
    private _valueControlComponent: TextInputNgComponent;

    constructor() {
        const frame = inject<TextValueScanFieldConditionOperandsEditorNgComponent.Frame>(ScanFieldConditionOperandsEditorNgDirective.frameInjectionToken);
        const modifierRoot = inject<ComponentInstanceId>(ScanFieldConditionOperandsEditorNgDirective.modifierRootInjectionToken);

        super(++TextValueScanFieldConditionOperandsEditorNgComponent.typeInstanceCreateCount, frame, modifierRoot);

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
        const action = new StringUiAction(false);
        action.commitOnAnyValidInput = true;
        action.pushCaption(Strings[StringId.ValueScanFieldConditionOperandsCaption_Value]);
        action.pushTitle(Strings[StringId.TextValueScanFieldConditionOperandsTitle_Value]);
        action.commitEvent = () => {
            const value = this._valueUiAction.value;
            if (value === undefined) {
                throw new AssertInternalError('TVSFCOENCCVUA55598');
            } else {
                if (this._frame.setValue(value, this._modifier)) {
                    this.markForCheck();
                }
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

export namespace TextValueScanFieldConditionOperandsEditorNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type Frame = TextValueScanFieldConditionOperandsEditorFrame;
}
