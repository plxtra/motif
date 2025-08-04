import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, ViewContainerRef, viewChild } from '@angular/core';
import { delay1Tick } from '@pbkware/js-utils';
import { BooleanUiAction, IntegerUiAction, NumberUiAction, StringUiAction } from '@pbkware/ui-action';
import { StringId, Strings, assert } from '@plxtra/motif-core';
import {
    CaptionLabelNgComponent,
    CaptionedCheckboxNgComponent,
    CheckboxInputNgComponent,
    IntegerTextInputNgComponent,
    NumberInputNgComponent,
    TextInputNgComponent
} from 'controls-ng-api';
import { SettingsComponentBaseNgDirective } from '../../ng/settings-component-base-ng.directive';

@Component({
    selector: 'app-grid-settings',
    templateUrl: './grid-settings-ng.component.html',
    styleUrls: ['./grid-settings-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class GridSettingsNgComponent extends SettingsComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    private readonly _fontFamilyLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('fontFamilyLabel');
    private readonly _fontFamilyControlComponentSignal = viewChild.required<TextInputNgComponent>('fontFamilyControl');
    private readonly _fontSizeLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('fontSizeLabel');
    private readonly _fontSizeControlComponentSignal = viewChild.required<TextInputNgComponent>('fontSizeControl');
    private readonly _columnHeaderFontSizeLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('columnHeaderFontSizeLabel');
    private readonly _columnHeaderFontSizeControlComponentSignal = viewChild.required<TextInputNgComponent>('columnHeaderFontSizeControl');
    private readonly _rowHeightLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('rowHeightLabel');
    private readonly _rowHeightControlComponentSignal = viewChild.required<IntegerTextInputNgComponent>('rowHeightControl');
    private readonly _showHorizontalGridLinesLabelSignal = viewChild.required<CaptionLabelNgComponent>('showHorizontalGridLinesLabel');
    private readonly _showHorizontalGridLinesCheckboxSignal = viewChild.required<CheckboxInputNgComponent>('showHorizontalGridLinesCheckbox');
    private readonly _showVerticalGridLinesLabelSignal = viewChild.required<CaptionLabelNgComponent>('showVerticalGridLinesLabel');
    private readonly _showVerticalGridLinesCheckboxSignal = viewChild.required<CheckboxInputNgComponent>('showVerticalGridLinesCheckbox');
    private readonly _showVerticalGridLinesInHeaderOnlyControlComponentSignal = viewChild.required<CaptionedCheckboxNgComponent>('showVerticalGridLinesInHeaderOnlyControl');
    private readonly _gridLineHorizontalWidthLabelSignal = viewChild.required<CaptionLabelNgComponent>('gridLineHorizontalWidthLabel');
    private readonly _gridLineHorizontalWidthEditSignal = viewChild.required<IntegerTextInputNgComponent>('gridLineHorizontalWidthEdit');
    private readonly _gridLineVerticalWidthLabelSignal = viewChild.required<CaptionLabelNgComponent>('gridLineVerticalWidthLabel');
    private readonly _gridLineVerticalWidthEditSignal = viewChild.required<IntegerTextInputNgComponent>('gridLineVerticalWidthEdit');
    private readonly _cellPaddingLabelSignal = viewChild.required<CaptionLabelNgComponent>('cellPaddingLabel');
    private readonly _cellPaddingEditSignal = viewChild.required<IntegerTextInputNgComponent>('cellPaddingEdit');
    private readonly _changedAllHighlightDurationLabelSignal = viewChild.required<CaptionLabelNgComponent>('changedAllHighlightDurationLabel');
    private readonly _changedAllHighlightDurationEditSignal = viewChild.required<IntegerTextInputNgComponent>('changedAllHighlightDurationEdit');
    private readonly _addedRowHighlightDurationLabelSignal = viewChild.required<CaptionLabelNgComponent>('addedRowHighlightDurationLabel');
    private readonly _addedRowHighlightDurationEditSignal = viewChild.required<IntegerTextInputNgComponent>('addedRowHighlightDurationEdit');
    private readonly _changedRowRecordHighlightDurationLabelSignal = viewChild.required<CaptionLabelNgComponent>('changedRowRecordHighlightDurationLabel');
    private readonly _changedRowRecordHighlightDurationEditSignal = viewChild.required<IntegerTextInputNgComponent>('changedRowRecordHighlightDurationEdit');
    private readonly _changedValueHighlightDurationLabelSignal = viewChild.required<CaptionLabelNgComponent>('changedValueHighlightDurationLabel');
    private readonly _changedValueHighlightDurationEditSignal = viewChild.required<IntegerTextInputNgComponent>('changedValueHighlightDurationEdit');
    private readonly _focusRowColoredLabelSignal = viewChild.required<CaptionLabelNgComponent>('focusRowColoredLabel');
    private readonly _focusRowColoredCheckboxSignal = viewChild.required<CheckboxInputNgComponent>('focusRowColoredCheckbox');
    private readonly _focusRowBorderedLabelSignal = viewChild.required<CaptionLabelNgComponent>('focusRowBorderedLabel');
    private readonly _focusRowBorderedCheckboxSignal = viewChild.required<CheckboxInputNgComponent>('focusRowBorderedCheckbox');
    private readonly _focusRowBorderWidthLabelSignal = viewChild.required<CaptionLabelNgComponent>('focusRowBorderWidthLabel');
    private readonly _focusRowBorderWidthEditSignal = viewChild.required<IntegerTextInputNgComponent>('focusRowBorderWidthEdit');
    private readonly _smoothHorizontalScrollingLabelSignal = viewChild.required<CaptionLabelNgComponent>('smoothHorizontalScrollingLabel');
    private readonly _smoothHorizontalScrollingCheckboxSignal = viewChild.required<CheckboxInputNgComponent>('smoothHorizontalScrollingCheckbox');
    private readonly _horizontalScrollbarWidthLabelSignal = viewChild.required<CaptionLabelNgComponent>('horizontalScrollbarWidthLabel');
    private readonly _horizontalScrollbarWidthEditSignal = viewChild.required<IntegerTextInputNgComponent>('horizontalScrollbarWidthEdit');
    private readonly _verticalScrollbarWidthLabelSignal = viewChild.required<CaptionLabelNgComponent>('verticalScrollbarWidthLabel');
    private readonly _verticalScrollbarWidthEditSignal = viewChild.required<IntegerTextInputNgComponent>('verticalScrollbarWidthEdit');
    private readonly _scrollbarMarginLabelSignal = viewChild.required<CaptionLabelNgComponent>('scrollbarMarginLabel');
    private readonly _scrollbarMarginEditSignal = viewChild.required<IntegerTextInputNgComponent>('scrollbarMarginEdit');
    private readonly _scrollbarThumbInactiveOpacityLabelSignal = viewChild.required<CaptionLabelNgComponent>('scrollbarThumbInactiveOpacityLabel');
    private readonly _scrollbarThumbInactiveOpacityEditSignal = viewChild.required<NumberInputNgComponent>('scrollbarThumbInactiveOpacityControl');

    private readonly _fontFamilyUiAction: StringUiAction;
    private readonly _fontSizeUiAction: StringUiAction;
    private readonly _columnHeaderFontSizeUiAction: StringUiAction;
    private readonly _rowHeightUiAction: IntegerUiAction;
    private readonly _showHorizontalGridLinesUiAction: BooleanUiAction;
    private readonly _showVerticalGridLinesUiAction: BooleanUiAction;
    private readonly _showVerticalGridLinesInHeaderOnlyUiAction: BooleanUiAction;
    private readonly _gridLineHorizontalWidthUiAction: IntegerUiAction;
    private readonly _gridLineVerticalWidthUiAction: IntegerUiAction;
    private readonly _cellPaddingUiAction: IntegerUiAction;
    private readonly _changedAllHighlightDurationUiAction: IntegerUiAction;
    private readonly _addedRowHighlightDurationUiAction: IntegerUiAction;
    private readonly _changedRowRecordHighlightDurationUiAction: IntegerUiAction;
    private readonly _changedValueHighlightDurationUiAction: IntegerUiAction;
    private readonly _focusRowColoredUiAction: BooleanUiAction;
    private readonly _focusRowBorderedUiAction: BooleanUiAction;
    private readonly _focusRowBorderWidthUiAction: IntegerUiAction;
    private readonly _smoothHorizontalScrollingUiAction: BooleanUiAction;
    private readonly _horizontalScrollbarWidthUiAction: IntegerUiAction;
    private readonly _verticalScrollbarWidthUiAction: IntegerUiAction;
    private readonly _scrollbarMarginUiAction: IntegerUiAction;
    private readonly _scrollbarThumbInactiveOpacityUiAction: NumberUiAction;

    private _fontFamilyLabelComponent: CaptionLabelNgComponent;
    private _fontFamilyControlComponent: TextInputNgComponent;
    private _fontSizeLabelComponent: CaptionLabelNgComponent;
    private _fontSizeControlComponent: TextInputNgComponent;
    private _columnHeaderFontSizeLabelComponent: CaptionLabelNgComponent;
    private _columnHeaderFontSizeControlComponent: TextInputNgComponent;
    private _rowHeightLabelComponent: CaptionLabelNgComponent;
    private _rowHeightControlComponent: IntegerTextInputNgComponent;
    private _showHorizontalGridLinesLabel: CaptionLabelNgComponent;
    private _showHorizontalGridLinesCheckbox: CheckboxInputNgComponent;
    private _showVerticalGridLinesLabel: CaptionLabelNgComponent;
    private _showVerticalGridLinesCheckbox: CheckboxInputNgComponent;
    private _showVerticalGridLinesInHeaderOnlyControlComponent: CaptionedCheckboxNgComponent;
    private _gridLineHorizontalWidthLabel: CaptionLabelNgComponent;
    private _gridLineHorizontalWidthEdit: IntegerTextInputNgComponent;
    private _gridLineVerticalWidthLabel: CaptionLabelNgComponent;
    private _gridLineVerticalWidthEdit: IntegerTextInputNgComponent;
    private _cellPaddingLabel: CaptionLabelNgComponent;
    private _cellPaddingEdit: IntegerTextInputNgComponent;
    private _changedAllHighlightDurationLabel: CaptionLabelNgComponent;
    private _changedAllHighlightDurationEdit: IntegerTextInputNgComponent;
    private _addedRowHighlightDurationLabel: CaptionLabelNgComponent;
    private _addedRowHighlightDurationEdit: IntegerTextInputNgComponent;
    private _changedRowRecordHighlightDurationLabel: CaptionLabelNgComponent;
    private _changedRowRecordHighlightDurationEdit: IntegerTextInputNgComponent;
    private _changedValueHighlightDurationLabel: CaptionLabelNgComponent;
    private _changedValueHighlightDurationEdit: IntegerTextInputNgComponent;
    private _focusRowColoredLabel: CaptionLabelNgComponent;
    private _focusRowColoredCheckbox: CheckboxInputNgComponent;
    private _focusRowBorderedLabel: CaptionLabelNgComponent;
    private _focusRowBorderedCheckbox: CheckboxInputNgComponent;
    private _focusRowBorderWidthLabel: CaptionLabelNgComponent;
    private _focusRowBorderWidthEdit: IntegerTextInputNgComponent;
    private _smoothHorizontalScrollingLabel: CaptionLabelNgComponent;
    private _smoothHorizontalScrollingCheckbox: CheckboxInputNgComponent;
    private _horizontalScrollbarWidthLabel: CaptionLabelNgComponent;
    private _horizontalScrollbarWidthEdit: IntegerTextInputNgComponent;
    private _verticalScrollbarWidthLabel: CaptionLabelNgComponent;
    private _verticalScrollbarWidthEdit: IntegerTextInputNgComponent;
    private _scrollbarMarginLabel: CaptionLabelNgComponent;
    private _scrollbarMarginEdit: IntegerTextInputNgComponent;
    private _scrollbarThumbInactiveOpacityLabel: CaptionLabelNgComponent;
    private _scrollbarThumbInactiveOpacityEdit: NumberInputNgComponent;

    constructor() {
        super(++GridSettingsNgComponent.typeInstanceCreateCount);

        this._fontFamilyUiAction = this.createFontFamilyUiAction();
        this._fontSizeUiAction = this.createFontSizeUiAction();
        this._columnHeaderFontSizeUiAction = this.createColumnHeaderFontSizeUiAction();
        this._rowHeightUiAction = this.createRowHeightUiAction();
        this._showHorizontalGridLinesUiAction = this.createShowHorizontalGridLinesUiAction();
        this._showVerticalGridLinesUiAction = this.createShowVerticalGridLinesUiAction();
        this._showVerticalGridLinesInHeaderOnlyUiAction = this.createShowVerticalGridLinesInHeaderOnlyUiAction();
        this._gridLineHorizontalWidthUiAction = this.createGridLineHorizontalWidthUiAction();
        this._gridLineVerticalWidthUiAction = this.createGridLineVerticalWidthUiAction();
        this._cellPaddingUiAction = this.createCellPaddingUiAction();
        this._changedAllHighlightDurationUiAction = this.createChangedAllHighlightDurationUiAction();
        this._addedRowHighlightDurationUiAction = this.createAddedRowHighlightDurationUiAction();
        this._changedRowRecordHighlightDurationUiAction = this.createChangedRowRecordHighlightDurationUiAction();
        this._changedValueHighlightDurationUiAction = this.createChangedValueHighlightDurationUiAction();
        this._focusRowColoredUiAction = this.createFocusRowColoredUiAction();
        this._focusRowBorderedUiAction = this.createFocusRowBorderedUiAction();
        this._focusRowBorderWidthUiAction = this.createFocusRowBorderWidthUiAction();
        this._smoothHorizontalScrollingUiAction = this.createSmoothHorizontalScrollingUiAction();
        this._horizontalScrollbarWidthUiAction = this.createHorizontalScrollbarWidthUiAction();
        this._verticalScrollbarWidthUiAction = this.createVerticalScrollbarWidthUiAction();
        this._scrollbarMarginUiAction = this.createScrollbarMarginUiAction();
        this._scrollbarThumbInactiveOpacityUiAction = this.createScrollbarThumbInactiveOpacityUiAction();

        this.processSettingsChanged();
    }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._fontFamilyLabelComponent = this._fontFamilyLabelComponentSignal();
        this._fontFamilyControlComponent = this._fontFamilyControlComponentSignal();
        this._fontSizeLabelComponent = this._fontSizeLabelComponentSignal();
        this._fontSizeControlComponent = this._fontSizeControlComponentSignal();
        this._columnHeaderFontSizeLabelComponent = this._columnHeaderFontSizeLabelComponentSignal();
        this._columnHeaderFontSizeControlComponent = this._columnHeaderFontSizeControlComponentSignal();
        this._rowHeightLabelComponent = this._rowHeightLabelComponentSignal();
        this._rowHeightControlComponent = this._rowHeightControlComponentSignal();
        this._showHorizontalGridLinesLabel = this._showHorizontalGridLinesLabelSignal();
        this._showHorizontalGridLinesCheckbox = this._showHorizontalGridLinesCheckboxSignal();
        this._showVerticalGridLinesLabel = this._showVerticalGridLinesLabelSignal();
        this._showVerticalGridLinesCheckbox = this._showVerticalGridLinesCheckboxSignal();
        this._showVerticalGridLinesInHeaderOnlyControlComponent = this._showVerticalGridLinesInHeaderOnlyControlComponentSignal();
        this._gridLineHorizontalWidthLabel = this._gridLineHorizontalWidthLabelSignal();
        this._gridLineHorizontalWidthEdit = this._gridLineHorizontalWidthEditSignal();
        this._gridLineVerticalWidthLabel = this._gridLineVerticalWidthLabelSignal();
        this._gridLineVerticalWidthEdit = this._gridLineVerticalWidthEditSignal();
        this._cellPaddingLabel = this._cellPaddingLabelSignal();
        this._cellPaddingEdit = this._cellPaddingEditSignal();
        this._changedAllHighlightDurationLabel = this._changedAllHighlightDurationLabelSignal();
        this._changedAllHighlightDurationEdit = this._changedAllHighlightDurationEditSignal();
        this._addedRowHighlightDurationLabel = this._addedRowHighlightDurationLabelSignal();
        this._addedRowHighlightDurationEdit = this._addedRowHighlightDurationEditSignal();
        this._changedRowRecordHighlightDurationLabel = this._changedRowRecordHighlightDurationLabelSignal();
        this._changedRowRecordHighlightDurationEdit = this._changedRowRecordHighlightDurationEditSignal();
        this._changedValueHighlightDurationLabel = this._changedValueHighlightDurationLabelSignal();
        this._changedValueHighlightDurationEdit = this._changedValueHighlightDurationEditSignal();
        this._focusRowColoredLabel = this._focusRowColoredLabelSignal();
        this._focusRowColoredCheckbox = this._focusRowColoredCheckboxSignal();
        this._focusRowBorderedLabel = this._focusRowBorderedLabelSignal();
        this._focusRowBorderedCheckbox = this._focusRowBorderedCheckboxSignal();
        this._focusRowBorderWidthLabel = this._focusRowBorderWidthLabelSignal();
        this._focusRowBorderWidthEdit = this._focusRowBorderWidthEditSignal();
        this._smoothHorizontalScrollingLabel = this._smoothHorizontalScrollingLabelSignal();
        this._smoothHorizontalScrollingCheckbox = this._smoothHorizontalScrollingCheckboxSignal();
        this._horizontalScrollbarWidthLabel = this._horizontalScrollbarWidthLabelSignal();
        this._horizontalScrollbarWidthEdit = this._horizontalScrollbarWidthEditSignal();
        this._verticalScrollbarWidthLabel = this._verticalScrollbarWidthLabelSignal();
        this._verticalScrollbarWidthEdit = this._verticalScrollbarWidthEditSignal();
        this._scrollbarMarginLabel = this._scrollbarMarginLabelSignal();
        this._scrollbarMarginEdit = this._scrollbarMarginEditSignal();
        this._scrollbarThumbInactiveOpacityLabel = this._scrollbarThumbInactiveOpacityLabelSignal();
        this._scrollbarThumbInactiveOpacityEdit = this._scrollbarThumbInactiveOpacityEditSignal();

        delay1Tick(() => {
            this.initialiseComponents();
            this.markForCheck();
        });
    }

    protected processSettingsChanged() {
        this.pushValues();
    }

    protected override finalise() {
        this._fontFamilyUiAction.finalise();
        this._fontSizeUiAction.finalise();
        this._columnHeaderFontSizeUiAction.finalise();
        this._rowHeightUiAction.finalise();
        this._showHorizontalGridLinesUiAction.finalise();
        this._showVerticalGridLinesUiAction.finalise();
        this._showVerticalGridLinesInHeaderOnlyUiAction.finalise();
        this._gridLineHorizontalWidthUiAction.finalise();
        this._gridLineVerticalWidthUiAction.finalise();
        this._cellPaddingUiAction.finalise();
        this._changedAllHighlightDurationUiAction.finalise();
        this._addedRowHighlightDurationUiAction.finalise();
        this._changedRowRecordHighlightDurationUiAction.finalise();
        this._changedValueHighlightDurationUiAction.finalise();
        this._focusRowColoredUiAction.finalise();
        this._focusRowBorderedUiAction.finalise();
        this._focusRowBorderWidthUiAction.finalise();
        this._smoothHorizontalScrollingUiAction.finalise();
        this._horizontalScrollbarWidthUiAction.finalise();
        this._verticalScrollbarWidthUiAction.finalise();
        this._scrollbarMarginUiAction.finalise();
        this._scrollbarThumbInactiveOpacityUiAction.finalise();

        super.finalise();
    }

    private initialiseComponents() {
        this._fontFamilyLabelComponent.initialise(this._fontFamilyUiAction);
        this._fontFamilyControlComponent.initialise(this._fontFamilyUiAction);
        this._fontSizeLabelComponent.initialise(this._fontSizeUiAction);
        this._fontSizeControlComponent.initialise(this._fontSizeUiAction);
        this._columnHeaderFontSizeLabelComponent.initialise(this._columnHeaderFontSizeUiAction);
        this._columnHeaderFontSizeControlComponent.initialise(this._columnHeaderFontSizeUiAction);
        this._rowHeightLabelComponent.initialise(this._rowHeightUiAction);
        this._rowHeightControlComponent.initialise(this._rowHeightUiAction);
        this._showHorizontalGridLinesLabel.initialise(this._showHorizontalGridLinesUiAction);
        this._showHorizontalGridLinesCheckbox.initialise(this._showHorizontalGridLinesUiAction);
        this._showVerticalGridLinesLabel.initialise(this._showVerticalGridLinesUiAction);
        this._showVerticalGridLinesCheckbox.initialise(this._showVerticalGridLinesUiAction);
        this._showVerticalGridLinesInHeaderOnlyControlComponent.initialise(this._showVerticalGridLinesInHeaderOnlyUiAction);
        this._gridLineHorizontalWidthLabel.initialise(this._gridLineHorizontalWidthUiAction);
        this._gridLineHorizontalWidthEdit.initialise(this._gridLineHorizontalWidthUiAction);
        this._gridLineVerticalWidthLabel.initialise(this._gridLineVerticalWidthUiAction);
        this._gridLineVerticalWidthEdit.initialise(this._gridLineVerticalWidthUiAction);
        this._cellPaddingLabel.initialise(this._cellPaddingUiAction);
        this._cellPaddingEdit.initialise(this._cellPaddingUiAction);
        this._changedAllHighlightDurationLabel.initialise(this._changedAllHighlightDurationUiAction);
        this._changedAllHighlightDurationEdit.initialise(this._changedAllHighlightDurationUiAction);
        this._addedRowHighlightDurationLabel.initialise(this._addedRowHighlightDurationUiAction);
        this._addedRowHighlightDurationEdit.initialise(this._addedRowHighlightDurationUiAction);
        this._changedRowRecordHighlightDurationLabel.initialise(this._changedRowRecordHighlightDurationUiAction);
        this._changedRowRecordHighlightDurationEdit.initialise(this._changedRowRecordHighlightDurationUiAction);
        this._changedValueHighlightDurationLabel.initialise(this._changedValueHighlightDurationUiAction);
        this._changedValueHighlightDurationEdit.initialise(this._changedValueHighlightDurationUiAction);
        this._focusRowColoredLabel.initialise(this._focusRowColoredUiAction);
        this._focusRowColoredCheckbox.initialise(this._focusRowColoredUiAction);
        this._focusRowBorderedLabel.initialise(this._focusRowBorderedUiAction);
        this._focusRowBorderedCheckbox.initialise(this._focusRowBorderedUiAction);
        this._focusRowBorderWidthLabel.initialise(this._focusRowBorderWidthUiAction);
        this._focusRowBorderWidthEdit.initialise(this._focusRowBorderWidthUiAction);
        this._smoothHorizontalScrollingLabel.initialise(this._smoothHorizontalScrollingUiAction);
        this._smoothHorizontalScrollingCheckbox.initialise(this._smoothHorizontalScrollingUiAction);
        this._horizontalScrollbarWidthLabel.initialise(this._horizontalScrollbarWidthUiAction);
        this._horizontalScrollbarWidthEdit.initialise(this._horizontalScrollbarWidthUiAction);
        this._verticalScrollbarWidthLabel.initialise(this._verticalScrollbarWidthUiAction);
        this._verticalScrollbarWidthEdit.initialise(this._verticalScrollbarWidthUiAction);
        this._scrollbarMarginLabel.initialise(this._scrollbarMarginUiAction);
        this._scrollbarMarginEdit.initialise(this._scrollbarMarginUiAction);
        this._scrollbarThumbInactiveOpacityLabel.initialise(this._scrollbarThumbInactiveOpacityUiAction);
        this._scrollbarThumbInactiveOpacityEdit.initialise(this._scrollbarThumbInactiveOpacityUiAction);
    }

    private createFontFamilyUiAction() {
        const action = new StringUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_FontFamily]);
        action.pushTitle(Strings[StringId.SettingTitle_FontFamily]);
        action.commitEvent = () => {
            this.userSettings.grid_FontFamily = this._fontFamilyUiAction.definedValue;
        };
        return action;
    }

    private createFontSizeUiAction() {
        const action = new StringUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_FontSize]);
        action.pushTitle(Strings[StringId.SettingTitle_FontSize]);
        action.commitEvent = () => {
            this.userSettings.grid_FontSize = this._fontSizeUiAction.definedValue;
        };
        return action;
    }

    private createColumnHeaderFontSizeUiAction() {
        const action = new StringUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_ColumnHeaderFontSize]);
        action.pushTitle(Strings[StringId.SettingTitle_ColumnHeaderFontSize]);
        action.commitEvent = () => {
            this.userSettings.grid_ColumnHeaderFontSize = this._columnHeaderFontSizeUiAction.definedValue;
        };
        return action;
    }

    private createRowHeightUiAction() {
        const action = new IntegerUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_RowHeight]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_RowHeight]);
        action.commitEvent = () => {
            this.userSettings.grid_RowHeight = this._rowHeightUiAction.definedValue;
        };
        return action;
    }

    private createScrollbarThumbInactiveOpacityUiAction() {
        const action = new NumberUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_ScrollbarThumbInactiveOpacity]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_ScrollbarThumbInactiveOpacity]);
        action.commitEvent = () => {
            this.userSettings.grid_ScrollbarThumbInactiveOpacity = this._scrollbarThumbInactiveOpacityUiAction.definedValue;
        };
        return action;
    }

    private createScrollbarMarginUiAction() {
        const action = new IntegerUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_ScrollbarMargin]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_ScrollbarMargin]);
        action.commitEvent = () => {
            this.userSettings.grid_ScrollbarMargin = this._scrollbarMarginUiAction.definedValue;
        };
        return action;
    }

    private createVerticalScrollbarWidthUiAction() {
        const action = new IntegerUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_VerticalScrollbarWidth]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_VerticalScrollbarWidth]);
        action.commitEvent = () => {
            this.userSettings.grid_VerticalScrollbarWidth = this._verticalScrollbarWidthUiAction.definedValue;
        };
        return action;
    }

    private createHorizontalScrollbarWidthUiAction() {
        const action = new IntegerUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_HorizontalScrollbarWidth]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_HorizontalScrollbarWidth]);
        action.commitEvent = () => {
            this.userSettings.grid_HorizontalScrollbarWidth = this._horizontalScrollbarWidthUiAction.definedValue;
        };
        return action;
    }

    private createSmoothHorizontalScrollingUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_SmoothHorizontalScrolling]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_SmoothHorizontalScrolling]);
        action.commitEvent = () => {
            this.userSettings.grid_ScrollHorizontallySmoothly = this._smoothHorizontalScrollingUiAction.definedValue;
        };
        return action;
    }

    private createFocusRowBorderWidthUiAction() {
        const action = new IntegerUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_FocusedRowBorderWidth]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_FocusedRowBorderWidth]);
        action.commitEvent = () => {
            this.userSettings.grid_FocusedRowBorderWidth = this._focusRowBorderWidthUiAction.definedValue;
        };
        return action;
    }

    private createFocusRowBorderedUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_FocusedRowBordered]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_FocusedRowBordered]);
        action.commitEvent = () => {
            this.userSettings.grid_FocusedRowBordered = this._focusRowBorderedUiAction.definedValue;
        };
        return action;
    }

    private createFocusRowColoredUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_FocusedRowColored]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_FocusedRowColored]);
        action.commitEvent = () => {
            this.userSettings.grid_FocusedRowColored = this._focusRowColoredUiAction.definedValue;
        };
        return action;
    }

    private createChangedAllHighlightDurationUiAction() {
        const action = new IntegerUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_ChangedAllHighlightDuration]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_ChangedAllHighlightDuration]);
        action.commitEvent = () => {
            this.userSettings.grid_AllChangedRecentDuration = this._changedAllHighlightDurationUiAction.definedValue;
        };
        return action;
    }

    private createAddedRowHighlightDurationUiAction() {
        const action = new IntegerUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_AddedRowHighlightDuration]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_AddedRowHighlightDuration]);
        action.commitEvent = () => {
            this.userSettings.grid_RecordInsertedRecentDuration = this._addedRowHighlightDurationUiAction.definedValue;
        };
        return action;
    }

    private createChangedRowRecordHighlightDurationUiAction() {
        const action = new IntegerUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_ChangedRowRecordHighlightDuration]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_ChangedRowRecordHighlightDuration]);
        action.commitEvent = () => {
            this.userSettings.grid_RecordUpdatedRecentDuration = this._changedRowRecordHighlightDurationUiAction.definedValue;
        };
        return action;
    }

    private createChangedValueHighlightDurationUiAction() {
        const action = new IntegerUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_ChangedValueHighlightDuration]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_ChangedValueHighlightDuration]);
        action.commitEvent = () => {
            this.userSettings.grid_ValueChangedRecentDuration = this._changedValueHighlightDurationUiAction.definedValue;
        };
        return action;
    }

    private createCellPaddingUiAction() {
        const action = new IntegerUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_CellPadding]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_CellPadding]);
        action.commitEvent = () => {
            this.userSettings.grid_CellPadding = this._cellPaddingUiAction.definedValue;
        };
        return action;
    }

    private createGridLineVerticalWidthUiAction() {
        const action = new IntegerUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_VerticalLineWidth]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_VerticalLineWidth]);
        action.commitEvent = () => {
            this.userSettings.grid_VerticalLineWidth = this._gridLineVerticalWidthUiAction.definedValue;
        };
        return action;
    }

    private createGridLineHorizontalWidthUiAction() {
        const action = new IntegerUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_HorizontalLineWidth]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_HorizontalLineWidth]);
        action.commitEvent = () => {
            this.userSettings.grid_HorizontalLineWidth = this._gridLineHorizontalWidthUiAction.definedValue;
        };
        return action;
    }

    private createShowVerticalGridLinesUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_VerticalLinesVisible]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_VerticalLinesVisible]);
        action.commitEvent = () => {
            const value = this._showVerticalGridLinesUiAction.definedValue;
            this.userSettings.grid_VerticalLinesVisible = value;
            if (value) {
                this._showVerticalGridLinesInHeaderOnlyUiAction.pushAccepted();
            } else {
                this._showVerticalGridLinesInHeaderOnlyUiAction.pushDisabled();
            }
        };
        return action;
    }

    private createShowVerticalGridLinesInHeaderOnlyUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_VerticalLinesVisibleInHeaderOnly]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_VerticalLinesVisibleInHeaderOnly]);
        action.commitEvent = () => {
            this.userSettings.grid_VerticalLinesVisibleInHeaderOnly = this._showVerticalGridLinesInHeaderOnlyUiAction.definedValue;
        };
        return action;
    }

    private createShowHorizontalGridLinesUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_HorizontalLinesVisible]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_HorizontalLinesVisible]);
        action.commitEvent = () => {
            this.userSettings.grid_HorizontalLinesVisible = this._showHorizontalGridLinesUiAction.definedValue;
        };
        return action;
    }

    private pushValues() {
        this._fontFamilyUiAction.pushValue(this.userSettings.grid_FontFamily);
        this._fontSizeUiAction.pushValue(this.userSettings.grid_FontSize);
        this._columnHeaderFontSizeUiAction.pushValue(this.userSettings.grid_ColumnHeaderFontSize);
        this._rowHeightUiAction.pushValue(this.userSettings.grid_RowHeight);
        this._showHorizontalGridLinesUiAction.pushValue(this.userSettings.grid_HorizontalLinesVisible);
        this._showVerticalGridLinesUiAction.pushValue(this.userSettings.grid_VerticalLinesVisible);
        this._showVerticalGridLinesInHeaderOnlyUiAction.pushValue(this.userSettings.grid_VerticalLinesVisibleInHeaderOnly);
        this._gridLineHorizontalWidthUiAction.pushValue(this.userSettings.grid_HorizontalLineWidth);
        this._gridLineVerticalWidthUiAction.pushValue(this.userSettings.grid_VerticalLineWidth);
        this._cellPaddingUiAction.pushValue(this.userSettings.grid_CellPadding);
        this._changedAllHighlightDurationUiAction.pushValue(this.userSettings.grid_AllChangedRecentDuration);
        this._addedRowHighlightDurationUiAction.pushValue(this.userSettings.grid_RecordInsertedRecentDuration);
        this._changedRowRecordHighlightDurationUiAction.pushValue(this.userSettings.grid_RecordUpdatedRecentDuration);
        this._changedValueHighlightDurationUiAction.pushValue(this.userSettings.grid_ValueChangedRecentDuration);
        this._focusRowColoredUiAction.pushValue(this.userSettings.grid_FocusedRowColored);
        this._focusRowBorderedUiAction.pushValue(this.userSettings.grid_FocusedRowBordered);
        this._focusRowBorderWidthUiAction.pushValue(this.userSettings.grid_FocusedRowBorderWidth);
        this._smoothHorizontalScrollingUiAction.pushValue(this.userSettings.grid_ScrollHorizontallySmoothly);
        this._horizontalScrollbarWidthUiAction.pushValue(this.userSettings.grid_HorizontalScrollbarWidth);
        this._verticalScrollbarWidthUiAction.pushValue(this.userSettings.grid_VerticalScrollbarWidth);
        this._scrollbarMarginUiAction.pushValue(this.userSettings.grid_ScrollbarMargin);
        this._scrollbarThumbInactiveOpacityUiAction.pushValue(this.userSettings.grid_ScrollbarThumbInactiveOpacity);
    }
}

export namespace GridSettingsNgComponent {

    export function create(container: ViewContainerRef) {
        container.clear();
        const componentRef = container.createComponent(GridSettingsNgComponent);
        assert(componentRef.instance instanceof GridSettingsNgComponent, 'GSCC39399987');
        return componentRef.instance;
    }
}
