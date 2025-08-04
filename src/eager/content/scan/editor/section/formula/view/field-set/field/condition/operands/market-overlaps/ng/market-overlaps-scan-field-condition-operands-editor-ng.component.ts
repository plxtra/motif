import { AfterViewInit, ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { delay1Tick } from '@pbkware/js-utils';
import { BooleanUiAction } from '@pbkware/ui-action';
import { MarketListSelectItemsUiAction, MarketsService, StringId, Strings } from '@plxtra/motif-core';
import { ComponentInstanceId } from 'component-internal-api';
import { MarketsNgService } from 'component-services-ng-api';
import { CaptionedCheckboxNgComponent, CaptionLabelNgComponent, EnumArrayInputNgComponent } from 'controls-ng-api';
import { ScanFieldConditionOperandsEditorNgDirective } from '../../ng/ng-api';
import { MarketOverlapsScanFieldConditionOperandsEditorFrame } from '../market-overlaps-scan-field-condition-operands-editor-frame';

@Component({
    selector: 'app-market-overlaps-scan-field-condition-operands-editor',
    templateUrl: './market-overlaps-scan-field-condition-operands-editor-ng.component.html',
    styleUrls: ['./market-overlaps-scan-field-condition-operands-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class MarketOverlapsScanFieldConditionOperandsEditorNgComponent extends ScanFieldConditionOperandsEditorNgDirective implements AfterViewInit {
    declare readonly _frame: MarketOverlapsScanFieldConditionOperandsEditorNgComponent.Frame;

    private readonly _notControlComponentSignal  = viewChild.required<CaptionedCheckboxNgComponent>('notControl');
    private readonly _marketLabelComponentSignal  = viewChild.required<CaptionLabelNgComponent>('marketLabel');
    private readonly _marketControlComponentSignal  = viewChild.required<EnumArrayInputNgComponent>('marketControl');

    private readonly _marketsService: MarketsService;
    private readonly _notUiAction: BooleanUiAction;
    private readonly _valuesUiAction: MarketListSelectItemsUiAction;

    private _notControlComponent: CaptionedCheckboxNgComponent;
    private _marketLabelComponent: CaptionLabelNgComponent;
    private _marketControlComponent: EnumArrayInputNgComponent;

    constructor() {
        const marketsNgService = inject(MarketsNgService);
        const frame = inject<MarketOverlapsScanFieldConditionOperandsEditorNgComponent.Frame>(ScanFieldConditionOperandsEditorNgDirective.frameInjectionToken);
        const modifierRoot = inject<ComponentInstanceId>(ScanFieldConditionOperandsEditorNgDirective.modifierRootInjectionToken);

        super(++MarketOverlapsScanFieldConditionOperandsEditorNgComponent.typeInstanceCreateCount, frame, modifierRoot);

        this._marketsService = marketsNgService.service;
        this._notUiAction = this.createNotUiAction();
        this._valuesUiAction = this.createValuesUiAction();
        this.pushAll();
    }

    ngAfterViewInit(): void {
        this._notControlComponent = this._notControlComponentSignal();
        this._marketLabelComponent = this._marketLabelComponentSignal();
        this._marketControlComponent = this._marketControlComponentSignal();

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
        const action = new MarketListSelectItemsUiAction(this._marketsService);
        action.pushCaption(Strings[StringId.MarketOverlapsScanFieldConditionOperandsCaption_Values]);
        action.pushTitle(Strings[StringId.MarketOverlapsScanFieldConditionOperandsTitle_Values]);
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
        this._marketLabelComponent.initialise(this._valuesUiAction);
        this._marketControlComponent.initialise(this._valuesUiAction);
    }
}

export namespace MarketOverlapsScanFieldConditionOperandsEditorNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type Frame = MarketOverlapsScanFieldConditionOperandsEditorFrame;
}
