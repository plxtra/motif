import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, viewChild } from '@angular/core';
import { delay1Tick } from '@pbkware/js-utils';
import { BooleanUiAction } from '@pbkware/ui-action';
import { MarketBoardListSelectItemsUiAction, MarketsService, StringId, Strings } from '@plxtra/motif-core';
import { ComponentInstanceId } from 'component-internal-api';
import { MarketsNgService, SettingsNgService } from 'component-services-ng-api';
import { CaptionedCheckboxNgComponent, CaptionLabelNgComponent, EnumArrayInputNgComponent } from 'controls-ng-api';
import { ScanFieldConditionOperandsEditorNgDirective } from '../../ng/ng-api';
import { MarketBoardOverlapsScanFieldConditionOperandsEditorFrame } from '../trading-market-board-overlaps-scan-field-condition-operands-editor-frame';

@Component({
    selector: 'app-market-board-overlaps-scan-field-condition-operands-editor',
    templateUrl: './trading-market-board-overlaps-scan-field-condition-operands-editor-ng.component.html',
    styleUrls: ['./trading-market-board-overlaps-scan-field-condition-operands-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class MarketBoardOverlapsScanFieldConditionOperandsEditorNgComponent extends ScanFieldConditionOperandsEditorNgDirective implements AfterViewInit {
    declare readonly _frame: MarketBoardOverlapsScanFieldConditionOperandsEditorNgComponent.Frame;

    private readonly _notControlComponentSignal = viewChild.required<CaptionedCheckboxNgComponent>('notControl');
    private readonly _marketBoardLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('marketBoardLabel');
    private readonly _marketBoardControlComponentSignal = viewChild.required<EnumArrayInputNgComponent>('marketBoardControl');

    private readonly _marketsService: MarketsService;
    private readonly _notUiAction: BooleanUiAction;
    private readonly _valuesUiAction: MarketBoardListSelectItemsUiAction;

    private _notControlComponent: CaptionedCheckboxNgComponent;
    private _marketBoardLabelComponent: CaptionLabelNgComponent;
    private _marketBoardControlComponent: EnumArrayInputNgComponent;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        marketsNgService: MarketsNgService,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.frameInjectionToken) frame: MarketBoardOverlapsScanFieldConditionOperandsEditorNgComponent.Frame,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.modifierRootInjectionToken) modifierRoot: ComponentInstanceId,
    ) {
        super(elRef, ++MarketBoardOverlapsScanFieldConditionOperandsEditorNgComponent.typeInstanceCreateCount, cdr, settingsNgService, frame, modifierRoot);

        this._marketsService = marketsNgService.service;
        this._notUiAction = this.createNotUiAction();
        this._valuesUiAction = this.createValuesUiAction();
        this.pushAll();
    }

    ngAfterViewInit(): void {
        this._notControlComponent = this._notControlComponentSignal();
        this._marketBoardLabelComponent = this._marketBoardLabelComponentSignal();
        this._marketBoardControlComponent = this._marketBoardControlComponentSignal();

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
        const action = new MarketBoardListSelectItemsUiAction(this._marketsService);
        action.pushCaption(Strings[StringId.MarketBoardOverlapsScanFieldConditionOperandsCaption_Values]);
        action.pushTitle(Strings[StringId.MarketBoardOverlapsScanFieldConditionOperandsTitle_Values]);
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
        this._marketBoardLabelComponent.initialise(this._valuesUiAction);
        this._marketBoardControlComponent.initialise(this._valuesUiAction);
    }
}

export namespace MarketBoardOverlapsScanFieldConditionOperandsEditorNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type Frame = MarketBoardOverlapsScanFieldConditionOperandsEditorFrame;
}
