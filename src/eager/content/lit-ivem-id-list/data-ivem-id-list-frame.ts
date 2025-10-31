import { Integer } from '@pbkware/js-utils';
import {
    AdaptedRevgridBehavioredColumnSettings,
    AdaptedRevgridGridSettings,
    CellPainterFactoryService,
    DataIvemId,
    DataIvemIdComparableListTableRecordSource,
    DataSourceDefinition,
    DataSourceOrReferenceDefinition,
    GridField,
    ReferenceableColumnLayoutsService,
    ReferenceableDataSourcesService,
    SettingsService,
    TableFieldSourceDefinitionCachingFactory,
    TableRecordSourceFactory,
    TextFormattableValueRecordGridCellPainter,
    TextHeaderCellPainter,
    TextTextFormattableValueCellPainter,
    UiComparableList
} from '@plxtra/motif-core';
import { ToastService } from 'component-services-internal-api';
import { RevColumnLayoutOrReferenceDefinition, RevViewCell } from 'revgrid';
import { DelayedBadnessGridSourceFrame } from '../delayed-badness-grid-source/internal-api';
import { LegacyTableRecordSourceDefinitionFactoryService } from '../legacy-table-record-source-definition-factory-service';

export class DataIvemIdListFrame extends DelayedBadnessGridSourceFrame {
    getListEventer: DataIvemIdListFrame.GetListEventer | undefined;
    gridSourceOpenedEventer: DataIvemIdListFrame.GridSourceOpenedEventer | undefined;
    recordFocusedEventer: DataIvemIdListFrame.RecordFocusedEventer | undefined
    selectionChangedEventer: DataIvemIdListFrame.SelectionChangedEventer | undefined;

    private readonly _initialCustomGridSettings: Partial<AdaptedRevgridGridSettings>;

    private _recordSource: DataIvemIdComparableListTableRecordSource;
    private _list: UiComparableList<DataIvemId>;

    private _gridHeaderCellPainter: TextHeaderCellPainter;
    private _gridMainCellPainter: TextFormattableValueRecordGridCellPainter<TextTextFormattableValueCellPainter>;

    private _filterText = '';
    private _uppercaseFilterText = '';

    constructor(
        settingsService: SettingsService,
        referenceableColumnLayoutsService: ReferenceableColumnLayoutsService,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        tableRecordSourceDefinitionFactoryService: LegacyTableRecordSourceDefinitionFactoryService,
        tableRecordSourceFactory: TableRecordSourceFactory,
        referenceableGridSourcesService: ReferenceableDataSourcesService,
        cellPainterFactoryService: CellPainterFactoryService,
        toastService: ToastService,
        initialCustomGridSettings: Partial<AdaptedRevgridGridSettings> | undefined,
    ) {
        super(
            settingsService,
            referenceableColumnLayoutsService,
            tableFieldSourceDefinitionCachingFactory,
            tableRecordSourceDefinitionFactoryService,
            tableRecordSourceFactory,
            referenceableGridSourcesService,
            cellPainterFactoryService,
            toastService,
        );

        if (initialCustomGridSettings === undefined) {
            this._initialCustomGridSettings = DataIvemIdListFrame.defaultCustomGridSettings;
        } else {
            this._initialCustomGridSettings = initialCustomGridSettings;
        }
    }

    get list() { return this._list; }

    public get filterText() { return this._filterText; }
    public set filterText(value: string) {
        if (value !== this._filterText) {
            this._filterText = value;
            this._uppercaseFilterText = value.toLocaleUpperCase();

            if (this._uppercaseFilterText.length > 0) {
                this.applyFilter((record) => {
                    const index = record.index;
                    const listIvemId = this.list.getAt(index);
                    return this.filterItems(listIvemId);
            });
            } else {
                this.clearFilter();
            }
        }
    }

    override finalise() {
        this.grid.selectionChangedEventer = undefined;
        super.finalise();
    }

    override createGridAndCellPainters(gridCanvasElement: HTMLCanvasElement) {
        const grid = this.createGrid(
            gridCanvasElement,
            this._initialCustomGridSettings,
            (columnSettings) => this.customiseSettingsForNewGridColumn(columnSettings),
            (viewCell) => this.getGridMainCellPainter(viewCell),
            (viewCell) => this.getGridHeaderCellPainter(viewCell),
        );

        this._gridHeaderCellPainter = this._cellPainterFactoryService.createTextHeader(grid, grid.headerDataServer);
        this._gridMainCellPainter = this._cellPainterFactoryService.createTextTextFormattableValueRecordGrid(grid, grid.mainDataServer);

        grid.selectionChangedEventer = () => {
            if (this.selectionChangedEventer !== undefined) {
                this.selectionChangedEventer();
            }
        }

        return grid;
    }

    tryOpenList(list: UiComparableList<DataIvemId>, keepView: boolean) {
        const definition = this.createListGridSourceOrReferenceDefinition(list, undefined);
        return this.tryOpenGridSource(definition, keepView);
    }

    deleteSelected() {
        const grid = this.grid;
        const mainSubgrid = grid.mainSubgrid;
        if (!grid.isFiltered && grid.selection.isDynamicAllSelected(mainSubgrid)) {
            this._list.clear();
        } else {
            const rowIndices = grid.selection.getSubgridRowIndices(mainSubgrid);
            const count = rowIndices.length;
            const recordIndices = new Array<Integer>(count);
            for (let i = 0; i < count; i++) {
                const rowIndex = rowIndices[i];
                recordIndices[i] = this.grid.rowToRecordIndex(rowIndex);
            }
            this.list.removeAtIndices(recordIndices);
        }
    }

    protected override getDefaultGridSourceOrReferenceDefinition() {
        let list: UiComparableList<DataIvemId> | undefined;
        if (this.getListEventer !== undefined) {
            list = this.getListEventer();
        }
        if (list === undefined) {
            list = new UiComparableList<DataIvemId>();
        }
        return this.createListGridSourceOrReferenceDefinition(list, undefined);
    }

    protected override processGridSourceOpenedEvent() {
        this._recordSource = this.grid.openedRecordSource as DataIvemIdComparableListTableRecordSource;
        this._list = this._recordSource.list;
        if (this.gridSourceOpenedEventer !== undefined) {
            this.gridSourceOpenedEventer();
        }
    }

    protected override processRecordFocusedEvent(newRecordIndex: Integer | undefined, _oldRecordIndex: Integer | undefined) {
        if (this.recordFocusedEventer !== undefined) {
            this.recordFocusedEventer(newRecordIndex);
        }
    }

    private customiseSettingsForNewGridColumn(_columnSettings: AdaptedRevgridBehavioredColumnSettings) {
        // no customisation
    }

    private getGridHeaderCellPainter(_viewCell: RevViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>) {
        return this._gridHeaderCellPainter;
    }

    private getGridMainCellPainter(_viewCell: RevViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>) {
        return this._gridMainCellPainter;
    }

    private createListGridSourceOrReferenceDefinition(list: UiComparableList<DataIvemId>, layoutDefinition: RevColumnLayoutOrReferenceDefinition | undefined) {
        const tableRecordSourceDefinition = this._legacyTableRecordSourceDefinitionFactoryService.createDataIvemIdComparableList(list);
        const dataSourceDefinition = new DataSourceDefinition(tableRecordSourceDefinition, layoutDefinition, undefined);
        return new DataSourceOrReferenceDefinition(dataSourceDefinition);
    }

    private filterItems(dataIvemId: DataIvemId) {
        if (this._uppercaseFilterText.length === 0) {
            return true;
        } else {
            return dataIvemId.code.toUpperCase().includes(this._uppercaseFilterText) || dataIvemId.market.display.toUpperCase().includes(this._uppercaseFilterText);
        }
    }
}

export namespace DataIvemIdListFrame {
    export type GetListEventer = (this: void) => UiComparableList<DataIvemId> | undefined;
    export type GridSourceOpenedEventer = (this: void) => void;
    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;
    export type SelectionChangedEventer = (this: void) => void;

    export const defaultCustomGridSettings: Partial<AdaptedRevgridGridSettings> = { fixedColumnCount: 1 } as const;
}
