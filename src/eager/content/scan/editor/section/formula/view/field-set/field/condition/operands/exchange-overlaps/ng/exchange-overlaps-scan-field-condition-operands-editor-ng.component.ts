import { AfterViewInit, ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { delay1Tick } from '@pbkware/js-utils';
import { BooleanUiAction } from '@pbkware/ui-action';
import { ExchangeListSelectItemsUiAction, MarketsService, StringId, Strings } from '@plxtra/motif-core';
import { ComponentInstanceId } from 'component-internal-api';
import { MarketsNgService } from 'component-services-ng-api';
import { CaptionedCheckboxNgComponent, CaptionLabelNgComponent, EnumArrayInputNgComponent } from 'controls-ng-api';
import { ScanFieldConditionOperandsEditorNgDirective } from '../../ng/ng-api';
import { ExchangeOverlapsScanFieldConditionOperandsEditorFrame } from '../exchange-overlaps-scan-field-condition-operands-editor-frame';

@Component({
    selector: 'app-exchange-overlaps-scan-field-condition-operands-editor',
    templateUrl: './exchange-overlaps-scan-field-condition-operands-editor-ng.component.html',
    styleUrls: ['./exchange-overlaps-scan-field-condition-operands-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ExchangeOverlapsScanFieldConditionOperandsEditorNgComponent extends ScanFieldConditionOperandsEditorNgDirective implements AfterViewInit {
    declare readonly _frame: ExchangeOverlapsScanFieldConditionOperandsEditorNgComponent.Frame;

    private readonly _notControlComponentSignal = viewChild.required<CaptionedCheckboxNgComponent>('notControl');
    private readonly _exchangeLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('exchangeLabel');
    private readonly _exchangeControlComponentSignal = viewChild.required<EnumArrayInputNgComponent>('exchangeControl');

    private readonly _marketsService: MarketsService;
    private readonly _notUiAction: BooleanUiAction;
    private readonly _valuesUiAction: ExchangeListSelectItemsUiAction;

    private _notControlComponent: CaptionedCheckboxNgComponent;
    private _exchangeLabelComponent: CaptionLabelNgComponent;
    private _exchangeControlComponent: EnumArrayInputNgComponent;

    constructor() {
        const marketsNgService = inject(MarketsNgService);
        const frame = inject<ExchangeOverlapsScanFieldConditionOperandsEditorNgComponent.Frame>(ScanFieldConditionOperandsEditorNgDirective.frameInjectionToken);
        const modifierRoot = inject<ComponentInstanceId>(ScanFieldConditionOperandsEditorNgDirective.modifierRootInjectionToken);

        super(++ExchangeOverlapsScanFieldConditionOperandsEditorNgComponent.typeInstanceCreateCount, frame, modifierRoot);

        this._marketsService = marketsNgService.service;
        this._notUiAction = this.createNotUiAction();
        this._valuesUiAction = this.createValuesUiAction();
        this.pushAll();
    }

    ngAfterViewInit(): void {
        this._notControlComponent = this._notControlComponentSignal();
        this._exchangeLabelComponent = this._exchangeLabelComponentSignal();
        this._exchangeControlComponent = this._exchangeControlComponentSignal();

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
        const action = new ExchangeListSelectItemsUiAction(this._marketsService);
        action.pushCaption(Strings[StringId.ExchangeOverlapsScanFieldConditionOperandsCaption_Values]);
        action.pushTitle(Strings[StringId.ExchangeOverlapsScanFieldConditionOperandsTitle_Values]);
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
        this._exchangeLabelComponent.initialise(this._valuesUiAction);
        this._exchangeControlComponent.initialise(this._valuesUiAction);
    }
}

export namespace ExchangeOverlapsScanFieldConditionOperandsEditorNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type Frame = ExchangeOverlapsScanFieldConditionOperandsEditorFrame;
}
