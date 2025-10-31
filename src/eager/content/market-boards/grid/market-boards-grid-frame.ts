import { AssertInternalError, ChangeSubscribableComparableList, Integer } from '@pbkware/js-utils';
import {
    AdaptedRevgridBehavioredColumnSettings,
    Badness,
    CellPainterFactoryService,
    CheckboxTextFormattableValueRecordGridCellEditor,
    CheckboxTextFormattableValueRecordGridCellPainter,
    DataSourceDefinition,
    DataSourceOrReferenceDefinition,
    GridField,
    MarketBoard,
    ReferenceableColumnLayoutsService,
    ReferenceableDataSourcesService,
    SettingsService,
    TableFieldSourceDefinitionCachingFactory,
    TableRecordSourceFactory,
    TextFormattableValueRecordGridCellPainter,
    TextHeaderCellPainter,
    TextTextFormattableValueCellPainter
} from '@plxtra/motif-core';
import { RevCellEditor, RevColumnLayoutOrReferenceDefinition, RevSourcedFieldCustomHeadings, RevSubgrid, RevViewCell } from 'revgrid';
import { ToastService } from '../../../component-services/internal-api';
import { GridSourceFrame } from '../../grid-source/internal-api';
import { LegacyTableRecordSourceDefinitionFactoryService } from '../../legacy-table-record-source-definition-factory-service';
import { MarketBoardListTableRecordSource } from './table/market-board-list-table-record-source';
import { MarketBoardListTableRecordSourceDefinition } from './table/market-board-list-table-record-source-definition';

export class MarketBoardsGridFrame extends GridSourceFrame {
    recordFocusedEventer: ScanFieldEditorFramesGridFrame.RecordFocusedEventer | undefined

    private _list: ChangeSubscribableComparableList<MarketBoard>;

    private _gridHeaderCellPainter: TextHeaderCellPainter;
    private _gridMainCellPainter: TextFormattableValueRecordGridCellPainter<TextTextFormattableValueCellPainter>;
    private _visibleCheckboxPainter: CheckboxTextFormattableValueRecordGridCellPainter;
    private _visibleCheckboxEditor: CheckboxTextFormattableValueRecordGridCellEditor;
    private _widthEditor: RevCellEditor<AdaptedRevgridBehavioredColumnSettings, GridField>;

    constructor(
        settingsService: SettingsService,
        private readonly _customHeadingsService: RevSourcedFieldCustomHeadings | undefined,
        referenceableColumnLayoutsService: ReferenceableColumnLayoutsService,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        legacyTableRecordSourceDefinitionFactoryService: LegacyTableRecordSourceDefinitionFactoryService,
        tableRecordSourceFactory: TableRecordSourceFactory,
        referenceableGridSourcesService: ReferenceableDataSourcesService,
        cellPainterFactoryService: CellPainterFactoryService,
        toastService: ToastService,
    ) {
        super(
            settingsService,
            referenceableColumnLayoutsService,
            tableFieldSourceDefinitionCachingFactory,
            legacyTableRecordSourceDefinitionFactoryService,
            tableRecordSourceFactory,
            referenceableGridSourcesService,
            cellPainterFactoryService,
            toastService,
        );
    }

    get list() { return this._list; }

    override createGridAndCellPainters(gridCanvasElement: HTMLCanvasElement) {
        const grid = this.createGrid(
            gridCanvasElement,
            {
                fixedColumnCount: 1,
                mouseColumnSelectionEnabled: false,
                switchNewRectangleSelectionToRowOrColumn: 'row',
            },
            (columnSettings) => this.customiseSettingsForNewGridColumn(columnSettings),
            (viewCell) => this.getGridMainCellPainter(viewCell),
            (viewCell) => this.getGridHeaderCellPainter(viewCell),
        );

        this._gridHeaderCellPainter = this._cellPainterFactoryService.createTextHeader(grid, grid.headerDataServer);
        this._gridMainCellPainter = this._cellPainterFactoryService.createTextTextFormattableValueRecordGrid(grid, grid.mainDataServer);
        this._visibleCheckboxPainter = this._cellPainterFactoryService.createCheckboxTextFormattableValueRecordGrid(grid, grid.mainDataServer);
        this._visibleCheckboxEditor = new CheckboxTextFormattableValueRecordGridCellEditor(this._settingsService, grid, grid.mainDataServer);

        grid.focus.getCellEditorEventer = (
            field,
            subgridRowIndex,
            subgrid,
            readonly,
            viewCell
        ) => this.getCellEditor(field, subgridRowIndex, subgrid, readonly, viewCell);


        return grid;
    }

    tryOpenList(list: ChangeSubscribableComparableList<MarketBoard>, keepView: boolean) {
        const definition = this.createListGridSourceOrReferenceDefinition(list, undefined);
        return this.tryOpenGridSource(definition, keepView);
    }

    getScanFieldEditorFrameAt(index: Integer) {
        return this._list.getAt(index);
    }

    protected override getDefaultGridSourceOrReferenceDefinition() {
        const list = new ChangeSubscribableComparableList<MarketBoard>();
        return this.createListGridSourceOrReferenceDefinition(list, undefined);
    }

    protected override processGridSourceOpenedEvent() {
        const recordSource = this.grid.openedRecordSource as MarketBoardListTableRecordSource;
        this._list = recordSource.list;
    }

    protected override setBadness(value: Badness) {
        if (!Badness.isUsable(value)) {
            throw new AssertInternalError('EEGFSB42112', Badness.generateText(value));
        }
    }

    protected override hideBadnessWithVisibleDelay(_badness: Badness) {
        // always hidden as never bad
    }

    protected override processRecordFocusedEvent(newRecordIndex: Integer | undefined, _oldRecordIndex: Integer | undefined) {
        if (this.recordFocusedEventer !== undefined) {
            this.recordFocusedEventer(newRecordIndex);
        }
    }

    private createListGridSourceOrReferenceDefinition(list: ChangeSubscribableComparableList<MarketBoard>, layoutDefinition: RevColumnLayoutOrReferenceDefinition | undefined) {
        const tableRecordSourceDefinition = new MarketBoardListTableRecordSourceDefinition(
            this._customHeadingsService,
            this._tableFieldSourceDefinitionCachingFactory,
            list,
        );
        const dataSourceDefinition = new DataSourceDefinition(tableRecordSourceDefinition, layoutDefinition, undefined);
        return new DataSourceOrReferenceDefinition(dataSourceDefinition);
    }

    private customiseSettingsForNewGridColumn(_columnSettings: AdaptedRevgridBehavioredColumnSettings) {
        // no customisation
    }

    private getGridHeaderCellPainter(_viewCell: RevViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>) {
        return this._gridHeaderCellPainter;
    }

    private getGridMainCellPainter(viewCell: RevViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>) {
        return this._gridMainCellPainter;
    }

    private getCellEditor(
        field: GridField,
        subgridRowIndex: Integer,
        _subgrid: RevSubgrid<AdaptedRevgridBehavioredColumnSettings, GridField>,
        readonly: boolean,
        _viewCell: RevViewCell<AdaptedRevgridBehavioredColumnSettings, GridField> | undefined
    ): RevCellEditor<AdaptedRevgridBehavioredColumnSettings, GridField> | undefined {
        return this.tryGetCellEditor(field.definition.sourcelessName, readonly, subgridRowIndex);
    }

    private tryGetCellEditor(sourcelesFieldName: string, readonly: boolean, subgridRowIndex: Integer): RevCellEditor<AdaptedRevgridBehavioredColumnSettings, GridField> | undefined {
        // if (sourcelesFieldName === EditableColumnLayoutDefinitionColumn.FieldName.visible) {
        //     this._visibleCheckboxEditor.readonly = readonly || subgridRowIndex < this._recordList.fixedColumnCount;
        //     return this._visibleCheckboxEditor;
        // } else {
        //     if (sourcelesFieldName === EditableColumnLayoutDefinitionColumn.FieldName.width) {
        //         this._widthEditor.readonly = readonly
        //         return this._widthEditor;
        //     } else {
                return undefined;
        //     }
        // }
    }
}

export namespace ScanFieldEditorFramesGridFrame {
    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;
}
