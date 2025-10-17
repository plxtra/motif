import { AfterViewInit, ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { delay1Tick } from '@pbkware/js-utils';
import { BooleanUiAction } from '@pbkware/ui-action';
import { StringId, Strings } from '@plxtra/motif-core';
import { ComponentInstanceId } from 'component-internal-api';
import { CaptionedCheckboxNgComponent } from 'controls-ng-api';
import { ScanFieldConditionOperandsEditorNgDirective } from '../../ng/ng-api';
import { HasValueScanFieldConditionOperandsEditorFrame } from '../has-value-scan-field-condition-operands-editor-frame';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
    selector: 'app-has-value-scan-field-condition-operands-editor',
    templateUrl: './has-value-scan-field-condition-operands-editor-ng.component.html',
    styleUrls: ['./has-value-scan-field-condition-operands-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SvgIconComponent, CaptionedCheckboxNgComponent]
})
export class HasValueScanFieldConditionOperandsEditorNgComponent extends ScanFieldConditionOperandsEditorNgDirective implements AfterViewInit {
    declare readonly _frame: HasValueScanFieldConditionOperandsEditorNgComponent.Frame;

    private readonly _notControlComponentSignal = viewChild.required<CaptionedCheckboxNgComponent>('notControl');

    private readonly _notUiAction: BooleanUiAction;

    private _notControlComponent: CaptionedCheckboxNgComponent;

    constructor() {
        const frame = inject<HasValueScanFieldConditionOperandsEditorNgComponent.Frame>(ScanFieldConditionOperandsEditorNgDirective.frameInjectionToken);
        const modifierRoot = inject<ComponentInstanceId>(ScanFieldConditionOperandsEditorNgDirective.modifierRootInjectionToken);

        super(++HasValueScanFieldConditionOperandsEditorNgComponent.typeInstanceCreateCount, frame, modifierRoot);

        this._notUiAction = this.createNotUiAction();
        this.pushAll();
    }

    ngAfterViewInit(): void {
        this._notControlComponent = this._notControlComponentSignal();

        delay1Tick(() => this.initialiseComponents());
    }

    protected override finalise() {
        this._notUiAction.finalise();
        super.finalise();
    }

    protected override pushAll() {
        this._notUiAction.pushValue(this._frame.not);
        super.pushAll();
    }

    private createNotUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.Not]);
        action.pushTitle(Strings[StringId.ScanFieldConditionOperandsEditor_NotHasValue]);
        action.commitEvent = () => {
            if (this._frame.negateOperator(this._modifier)) {
                this.markForCheck();
            }
        };

        return action;
    }

    private initialiseComponents() {
        this._notControlComponent.initialise(this._notUiAction);
    }
}

export namespace HasValueScanFieldConditionOperandsEditorNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type Frame = HasValueScanFieldConditionOperandsEditorFrame;
}
