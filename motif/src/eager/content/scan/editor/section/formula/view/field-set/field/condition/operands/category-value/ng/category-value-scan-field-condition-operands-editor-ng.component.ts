import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, viewChild } from '@angular/core';
import { delay1Tick } from '@pbkware/js-utils';
import { BooleanUiAction, IntegerListSelectItemUiAction } from '@pbkware/ui-action';
import { ScanFormula, StringId, Strings } from '@plxtra/motif-core';
import { ComponentInstanceId } from 'component-internal-api';
import { SettingsNgService } from 'component-services-ng-api';
import { CaptionedCheckboxNgComponent, CaptionLabelNgComponent, IntegerEnumInputNgComponent } from 'controls-ng-api';
import { ScanFieldConditionOperandsEditorNgDirective } from '../../ng/ng-api';
import { CategoryValueScanFieldConditionOperandsEditorFrame } from '../category-value-scan-field-condition-operands-editor-frame';

@Component({
    selector: 'app-category-value-scan-field-condition-operands-editor',
    templateUrl: './category-value-scan-field-condition-operands-editor-ng.component.html',
    styleUrls: ['./category-value-scan-field-condition-operands-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class CategoryValueScanFieldConditionOperandsEditorNgComponent extends ScanFieldConditionOperandsEditorNgDirective implements AfterViewInit {
    declare readonly _frame: CategoryValueScanFieldConditionOperandsEditorNgComponent.Frame;

    private readonly _notControlComponentSignal = viewChild.required<CaptionedCheckboxNgComponent>('notControl');
    private readonly _categoryLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('categoryLabel');
    private readonly _categoryControlComponentSignal = viewChild.required<IntegerEnumInputNgComponent>('categoryControl');

    private readonly _notUiAction: BooleanUiAction;
    private readonly _categoryUiAction: IntegerListSelectItemUiAction;

    private _notControlComponent: CaptionedCheckboxNgComponent;
    private _categoryLabelComponent: CaptionLabelNgComponent;
    private _categoryControlComponent: IntegerEnumInputNgComponent;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.frameInjectionToken) frame: CategoryValueScanFieldConditionOperandsEditorNgComponent.Frame,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.modifierRootInjectionToken) modifierRoot: ComponentInstanceId,
    ) {
        super(elRef, ++CategoryValueScanFieldConditionOperandsEditorNgComponent.typeInstanceCreateCount, cdr, settingsNgService, frame, modifierRoot);

        this._notUiAction = this.createNotUiAction();
        this._categoryUiAction = this.createCategoryUiAction();
        this.pushAll();
    }

    ngAfterViewInit(): void {
        this._notControlComponent = this._notControlComponentSignal();
        this._categoryLabelComponent = this._categoryLabelComponentSignal();
        this._categoryControlComponent = this._categoryControlComponentSignal();

        delay1Tick(() => this.initialiseComponents());
    }

    protected override finalise() {
        this._categoryUiAction.finalise();
        this._notUiAction.finalise();
        super.finalise();
    }


    protected override pushAll() {
        this._categoryUiAction.pushValue(this._frame.categoryId);
        this._notUiAction.pushValue(this._frame.not);
        super.pushAll();
    }

    private createCategoryUiAction() {
        const action = new IntegerListSelectItemUiAction();
        action.pushCaption(Strings[StringId.CategoryValueScanFieldConditionOperandsCaption_Category]);
        action.pushTitle(Strings[StringId.CategoryValueScanFieldConditionOperandsTitle_Category]);
        const ids = ScanFormula.IsNode.Category.allIds;
        const list = ids.map<IntegerListSelectItemUiAction.ItemProperties>(
            (id) => ({
                    item: id,
                    caption: ScanFormula.IsNode.Category.idToCaption(id),
                    title: ScanFormula.IsNode.Category.idToTitle(id),
                }
            )
        );
        action.pushList(list, undefined);
        action.commitEvent = () => {
            if (this._frame.setCategoryId(this._categoryUiAction.definedValue, this._modifier)) {
                this.markForCheck();
            }
        }

        return action;
    }

    private createNotUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.Not]);
        action.pushTitle(Strings[StringId.ScanFieldConditionOperandsEditor_NotIsCategory]);
        action.commitEvent = () => {
            if (this._frame.negateOperator(this._modifier)) {
                this.markForCheck();
            }
        };

        return action;
    }

    private initialiseComponents() {
        this._notControlComponent.initialise(this._notUiAction);
        this._categoryLabelComponent.initialise(this._categoryUiAction);
        this._categoryControlComponent.initialise(this._categoryUiAction);
    }
}

export namespace CategoryValueScanFieldConditionOperandsEditorNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type Frame = CategoryValueScanFieldConditionOperandsEditorFrame;
}
