import { AfterViewInit, ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { AssertInternalError, delay1Tick } from '@pbkware/js-utils';
import { BooleanUiAction, StringUiAction } from '@pbkware/ui-action';
import { StringId, Strings } from '@plxtra/motif-core';
import { ComponentInstanceId } from 'component-internal-api';
import { CaptionedCheckboxNgComponent, CheckboxInputNgComponent, TextInputNgComponent } from 'controls-ng-api';
import { ScanFieldConditionOperandsEditorNgDirective } from '../../ng/ng-api';
import { TextContainsScanFieldConditionOperandsEditorFrame } from '../text-contains-scan-field-condition-operands-editor-frame';
import { SvgIconComponent } from 'angular-svg-icon';
import { CaptionedCheckboxNgComponent as CaptionedCheckboxNgComponent_1 } from '../../../../../../../../../../../../controls/boolean/captioned-checkbox/ng/captioned-checkbox-ng.component';
import { CheckboxInputNgComponent as CheckboxInputNgComponent_1 } from '../../../../../../../../../../../../controls/boolean/checkbox-input/ng/checkbox-input-ng.component';
import { TextInputNgComponent as TextInputNgComponent_1 } from '../../../../../../../../../../../../controls/string/text-input/ng/text-input-ng.component';

@Component({
    selector: 'app-text-value-scan-field-condition-operands-editor',
    templateUrl: './text-contains-scan-field-condition-operands-editor-ng.component.html',
    styleUrls: ['./text-contains-scan-field-condition-operands-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SvgIconComponent, CaptionedCheckboxNgComponent_1, CheckboxInputNgComponent_1, TextInputNgComponent_1]
})
export class TextContainsScanFieldConditionOperandsEditorNgComponent extends ScanFieldConditionOperandsEditorNgDirective implements AfterViewInit {
    declare readonly _frame: TextContainsScanFieldConditionOperandsEditorNgComponent.Frame;

    private readonly _notControlComponentSignal = viewChild.required<CaptionedCheckboxNgComponent>('notControl');
    private readonly _valueControlComponentSignal = viewChild.required<TextInputNgComponent>('valueControl');
    // private readonly _fromStartLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('fromStartLabel');
    private readonly _fromStartControlComponentSignal = viewChild.required<CheckboxInputNgComponent>('fromStartControl');
    // private readonly _fromEndLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('fromEndLabel');
    private readonly _fromEndControlComponentSignal = viewChild.required<CheckboxInputNgComponent>('fromEndControl');
    private readonly _exactControlComponentSignal = viewChild.required<CaptionedCheckboxNgComponent>('exactControl');
    private readonly _ignoreCaseControlComponentSignal = viewChild.required<CaptionedCheckboxNgComponent>('ignoreCaseControl');

    private readonly _notUiAction: BooleanUiAction;
    private readonly _valueUiAction: StringUiAction;
    private readonly _fromStartUiAction: BooleanUiAction;
    private readonly _fromEndUiAction: BooleanUiAction;
    private readonly _exactUiAction: BooleanUiAction;
    private readonly _ignoreCaseUiAction: BooleanUiAction;

    private _notControlComponent: CaptionedCheckboxNgComponent;
    private _valueControlComponent: TextInputNgComponent;
    private _fromStartControlComponent: CheckboxInputNgComponent;
    private _fromEndControlComponent: CheckboxInputNgComponent;
    private _exactControlComponent: CaptionedCheckboxNgComponent;
    private _ignoreCaseControlComponent: CaptionedCheckboxNgComponent;

    constructor() {
        const frame = inject<TextContainsScanFieldConditionOperandsEditorNgComponent.Frame>(ScanFieldConditionOperandsEditorNgDirective.frameInjectionToken);
        const modifierRoot = inject<ComponentInstanceId>(ScanFieldConditionOperandsEditorNgDirective.modifierRootInjectionToken);

        super(++TextContainsScanFieldConditionOperandsEditorNgComponent.typeInstanceCreateCount, frame, modifierRoot);

        this._notUiAction = this.createNotUiAction();
        this._valueUiAction = this.createValueUiAction();
        this._fromStartUiAction = this.createFromStartUiAction();
        this._fromEndUiAction = this.createFromEndUiAction();
        this._exactUiAction = this.createExactUiAction();
        this._ignoreCaseUiAction = this.createIgnoreCaseUiAction();

        this.pushAll();
    }

    ngAfterViewInit(): void {
        this._notControlComponent = this._notControlComponentSignal();
        this._valueControlComponent = this._valueControlComponentSignal();
        this._fromStartControlComponent = this._fromStartControlComponentSignal();
        this._fromEndControlComponent = this._fromEndControlComponentSignal();
        this._exactControlComponent = this._exactControlComponentSignal();
        this._ignoreCaseControlComponent = this._ignoreCaseControlComponentSignal();

        delay1Tick(() => this.initialiseComponents());
    }

    protected override finalise() {
        this._notUiAction.finalise();
        this._valueUiAction.finalise();
        this._fromStartUiAction.finalise();
        this._fromEndUiAction.finalise();
        this._exactUiAction.finalise();
        this._ignoreCaseUiAction.finalise();
        super.finalise();
    }

    protected override pushAll() {
        this._notUiAction.pushValue(this._frame.not);
        this._valueUiAction.pushValue(this._frame.value);
        this._fromStartUiAction.pushValue(this._frame.fromStart);
        this._fromEndUiAction.pushValue(this._frame.fromEnd);
        this._exactUiAction.pushValue(this._frame.exact);
        this._ignoreCaseUiAction.pushValue(this._frame.ignoreCase);
        super.pushAll();
    }

    private createNotUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.Not]);
        action.pushTitle(Strings[StringId.ScanFieldConditionOperandsEditor_NotContainsValue]);
        action.commitEvent = () => {
            if (this._frame.negateOperator(this._modifier)) {
                this.markForCheck();
            }
        };

        return action;
    }

    private createValueUiAction() {
        const action = new StringUiAction(false);
        action.commitOnAnyValidInput = true;
        action.pushCaption(Strings[StringId.ValueScanFieldConditionOperandsCaption_Value]);
        action.pushTitle(Strings[StringId.TextContainsScanFieldConditionOperandsTitle_Value]);
        action.commitEvent = () => {
            const value = this._valueUiAction.value;
            if (value === undefined) {
                throw new AssertInternalError('TCSFCOOENCCVUA55598');
            } else {
                if (this._frame.setValue(value, this._modifier)) {
                    this.markForCheck();
                }
            }
        }

        return action;
    }

    private createFromStartUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.FromStart]);
        action.pushTitle(Strings[StringId.TextContainsScanFieldConditionOperandsTitle_FromStart]);
        action.commitEvent = () => {
            const value = this._fromStartUiAction.value;
            if (value === undefined) {
                throw new AssertInternalError('TCSFCOOENCCFSUA55598');
            } else {
                if (this._frame.setFromStart(value, this._modifier)) {
                    this.markForCheck();
                }
                this._fromEndUiAction.pushValue(this._frame.fromEnd);
                this._exactUiAction.pushValue(this._frame.exact);
            }
        };

        return action;
    }

    private createFromEndUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.FromEnd]);
        action.pushTitle(Strings[StringId.TextContainsScanFieldConditionOperandsTitle_FromEnd]);
        action.commitEvent = () => {
            const value = this._fromEndUiAction.value;
            if (value === undefined) {
                throw new AssertInternalError('TCSFCOOENCCFEUA55598');
            } else {
                if (this._frame.setFromEnd(value, this._modifier)) {
                    this.markForCheck();
                }
                this._fromStartUiAction.pushValue(this._frame.fromStart);
                this._exactUiAction.pushValue(this._frame.exact);
            }
        };

        return action;
    }

    private createExactUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.Exact]);
        action.pushTitle(Strings[StringId.TextContainsScanFieldConditionOperandsTitle_Exact]);
        action.commitEvent = () => {
            const value = this._exactUiAction.value;
            if (value === undefined) {
                throw new AssertInternalError('TCSFCOOENCCEUA55598');
            } else {
                if (this._frame.setExact(value, this._modifier)) {
                    this.markForCheck();
                }
                this._fromStartUiAction.pushValue(this._frame.fromStart);
                this._fromEndUiAction.pushValue(this._frame.fromEnd);
            }
        };

        return action;
    }

    private createIgnoreCaseUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.IgnoreCase]);
        action.pushTitle(Strings[StringId.TextContainsScanFieldConditionOperandsTitle_IgnoreCase]);
        action.commitEvent = () => {
            const value = this._ignoreCaseUiAction.value;
            if (value === undefined) {
                throw new AssertInternalError('TCSFCOOENCCICUA55598');
            } else {
                if (this._frame.setIgnoreCase(value, this._modifier)) {
                    this.markForCheck();
                }
            }
        };

        return action;
    }

    private initialiseComponents() {
        this._notControlComponent.initialise(this._notUiAction);
        this._valueControlComponent.initialise(this._valueUiAction);
        // this._fromStartLabelComponent.initialise(this._fromStartUiAction);
        this._fromStartControlComponent.initialise(this._fromStartUiAction);
        // this._fromEndLabelComponent.initialise(this._fromEndUiAction);
        this._fromEndControlComponent.initialise(this._fromEndUiAction);
        this._exactControlComponent.initialise(this._exactUiAction);
        this._ignoreCaseControlComponent.initialise(this._ignoreCaseUiAction);
    }
}

export namespace TextContainsScanFieldConditionOperandsEditorNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type Frame = TextContainsScanFieldConditionOperandsEditorFrame;
}
