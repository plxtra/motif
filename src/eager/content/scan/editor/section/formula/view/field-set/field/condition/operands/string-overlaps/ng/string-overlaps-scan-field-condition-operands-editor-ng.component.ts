import { AfterViewInit, ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { delay1Tick } from '@pbkware/js-utils';
import { BooleanUiAction, StringArrayUiAction } from '@pbkware/ui-action';
import { StringId, Strings } from '@plxtra/motif-core';
import { ComponentInstanceId } from 'component-internal-api';
import { CaptionedCheckboxNgComponent, CaptionLabelNgComponent, StringArrayInputNgComponent } from 'controls-ng-api';
import { ScanFieldConditionOperandsEditorNgDirective } from '../../ng/ng-api';
import { StringOverlapsScanFieldConditionOperandsEditorFrame } from '../string-overlaps-scan-field-condition-operands-editor-frame';
import { SvgIconComponent } from 'angular-svg-icon';
import { CaptionedCheckboxNgComponent as CaptionedCheckboxNgComponent_1 } from '../../../../../../../../../../../../controls/boolean/captioned-checkbox/ng/captioned-checkbox-ng.component';
import { CaptionLabelNgComponent as CaptionLabelNgComponent_1 } from '../../../../../../../../../../../../controls/label/caption-label/ng/caption-label-ng.component';
import { StringArrayInputNgComponent as StringArrayInputNgComponent_1 } from '../../../../../../../../../../../../controls/string-array/string-array-input/ng/string-array-input-ng.component';

@Component({
    selector: 'app-string-overlaps-scan-field-condition-operands-editor',
    templateUrl: './string-overlaps-scan-field-condition-operands-editor-ng.component.html',
    styleUrls: ['./string-overlaps-scan-field-condition-operands-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SvgIconComponent, CaptionedCheckboxNgComponent_1, CaptionLabelNgComponent_1, StringArrayInputNgComponent_1]
})
export class StringOverlapsScanFieldConditionOperandsEditorNgComponent extends ScanFieldConditionOperandsEditorNgDirective implements AfterViewInit {
    declare readonly _frame: StringOverlapsScanFieldConditionOperandsEditorNgComponent.Frame;

    private readonly _notControlComponentSignal = viewChild.required<CaptionedCheckboxNgComponent>('notControl');
    private readonly _valuesLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('valuesLabel');
    private readonly _valuesControlComponentSignal = viewChild.required<StringArrayInputNgComponent>('valuesControl');

    private readonly _notUiAction: BooleanUiAction;
    private readonly _valuesUiAction: StringArrayUiAction;

    private _notControlComponent: CaptionedCheckboxNgComponent;
    private _valuesLabelComponent: CaptionLabelNgComponent;
    private _valuesControlComponent: StringArrayInputNgComponent;

    constructor() {
        const frame = inject<StringOverlapsScanFieldConditionOperandsEditorNgComponent.Frame>(ScanFieldConditionOperandsEditorNgDirective.frameInjectionToken);
        const modifierRoot = inject<ComponentInstanceId>(ScanFieldConditionOperandsEditorNgDirective.modifierRootInjectionToken);

        super(++StringOverlapsScanFieldConditionOperandsEditorNgComponent.typeInstanceCreateCount, frame, modifierRoot);

        this._notUiAction = this.createNotUiAction();
        this._valuesUiAction = this.createValuesUiAction();
        this.pushAll();
    }

    ngAfterViewInit(): void {
        this._notControlComponent = this._notControlComponentSignal();
        this._valuesLabelComponent = this._valuesLabelComponentSignal();
        this._valuesControlComponent = this._valuesControlComponentSignal();

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
        const action = new StringArrayUiAction();
        action.pushCaption(Strings[StringId.StringOverlapsScanFieldConditionOperandsCaption_Values]);
        action.pushTitle(Strings[StringId.StringOverlapsScanFieldConditionOperandsTitle_Values]);
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
        this._valuesLabelComponent.initialise(this._valuesUiAction);
        this._valuesControlComponent.initialise(this._valuesUiAction);
    }
}

export namespace StringOverlapsScanFieldConditionOperandsEditorNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type Frame = StringOverlapsScanFieldConditionOperandsEditorFrame;
}
