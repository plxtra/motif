import {
    AssertInternalError,
    Integer,
    LockOpenListItem,
    ModifierKey,
    ModifierKeyId,
    MultiEvent,
    UsableListChangeTypeId,
    delay1Tick
} from '@pbkware/js-utils';
import {
    AdaptedRevgridBehavioredColumnSettings,
    Badness,
    CellPainterFactoryService,
    DataSourceDefinition,
    DataSourceOrReferenceDefinition,
    EditableColumnLayoutDefinitionColumnList,
    GridField,
    GridFieldTableRecordSource,
    ReferenceableColumnLayoutsService,
    ReferenceableDataSourcesService,
    SettingsService,
    StringId,
    Strings,
    TableFieldSourceDefinitionCachingFactory,
    TableRecordSourceFactory,
    TextFormattableValueRecordGridCellPainter,
    TextHeaderCellPainter,
    TextTextFormattableValueCellPainter,
} from '@plxtra/motif-core';
import { ToastService } from 'component-services-internal-api';
import { RevColumnLayoutOrReferenceDefinition, RevRecord, RevViewCell } from 'revgrid';
import { GridSourceFrame } from '../../../grid-source/internal-api';
import { LegacyTableRecordSourceDefinitionFactoryService } from '../../../legacy-table-record-source-definition-factory-service';

export class ColumnLayoutEditorAllowedFieldsFrame extends GridSourceFrame {
    selectionChangedEventer: ColumnLayoutEditorAllowedFieldsFrame.SelectionChangedEventer | undefined;
    columnsViewWidthsChangedEventer: ColumnLayoutEditorAllowedFieldsFrame.ColumnsViewWidthsChangedEventer | undefined;


    private _records: readonly GridField[];

    private _gridHeaderCellPainter: TextHeaderCellPainter;
    private _gridMainCellPainter: TextFormattableValueRecordGridCellPainter<TextTextFormattableValueCellPainter>;

    private _columnListChangeSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        settingsService: SettingsService,
        namedColumnLayoutsService: ReferenceableColumnLayoutsService,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        tableRecordSourceDefinitionFactoryService: LegacyTableRecordSourceDefinitionFactoryService,
        tableRecordSourceFactory: TableRecordSourceFactory,
        namedGridSourcesService: ReferenceableDataSourcesService,
        cellPainterFactoryService: CellPainterFactoryService,
        toastService: ToastService,
        private readonly _allowedFields: readonly GridField[],
        private readonly _columnList: EditableColumnLayoutDefinitionColumnList,
    ) {
        super(
            settingsService,
            namedColumnLayoutsService,
            tableFieldSourceDefinitionCachingFactory,
            tableRecordSourceDefinitionFactoryService,
            tableRecordSourceFactory,
            namedGridSourcesService,
            cellPainterFactoryService,
            toastService,
        );

        this._columnListChangeSubscriptionId = this._columnList.subscribeListChangeEvent(
            (listChangeTypeId, idx, count) => this.handleColumnListChangeEvent(listChangeTypeId, idx, count)
        );
    }

    get selectedCount() {
        const mainSubgrid = this.grid.mainSubgrid;
        return this.grid.getSelectedRowCount(mainSubgrid, true);
    }

    get selectedFields() {
        const selection = this.grid.selection
        const mainSubgrid = this.grid.mainSubgrid;
        const rowIndices = selection.getSubgridRowIndices(mainSubgrid);
        const count = rowIndices.length;
        const fields = new Array<GridField>(count);
        for (let i = 0; i < count; i++) {
            const rowIndex = rowIndices[i];
            const recordIndex = this.grid.rowToRecordIndex(rowIndex);
            fields[i] = this._records[recordIndex];
        }
        return fields;
    }

    override initialise(opener: LockOpenListItem.Opener, previousLayoutDefinition: RevColumnLayoutOrReferenceDefinition | undefined, keepPreviousLayoutIfPossible: boolean): void {
        super.initialise(opener, previousLayoutDefinition, keepPreviousLayoutIfPossible);

        const openPromise = this.tryOpenDefault(false);
        openPromise.then(
            (result) => {
                if (result.isErr()) {
                    this._toastService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.AllowedFields]}: ${result.error}`);
                } else {
                    this.applyColumnListFilter();
                }
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'GLEAFIPRJ31310'); }
        );

        this.grid.columnsViewWidthsChangedEventer = (_fixedChanged, _nonFixedChanged, allChanged) => {
            if (allChanged && this.columnsViewWidthsChangedEventer !== undefined) {
                this.columnsViewWidthsChangedEventer();
            }
        }
    }

    override finalise() {
        super.finalise();
        this._columnList.unsubscribeListChangeEvent(this._columnListChangeSubscriptionId);
        this._columnListChangeSubscriptionId = undefined;
        this.grid.clearFilter();
    }

    override createGridAndCellPainters(gridHostElement: HTMLElement) {
        const grid = this.createGrid(
            gridHostElement,
            {
                fixedColumnCount: 1,
                sortOnClick: false,
                sortOnDoubleClick: false,
                mouseColumnSelectionEnabled: false,
                switchNewRectangleSelectionToRowOrColumn: 'row',
            },
            (columnSettings) => this.customiseSettingsForNewGridColumn(columnSettings),
            (viewCell) => this.getGridMainCellPainter(viewCell),
            (viewCell) => this.getGridHeaderCellPainter(viewCell),
        );

        this._gridHeaderCellPainter = this._cellPainterFactoryService.createTextHeader(grid, grid.headerDataServer);
        this._gridMainCellPainter = this._cellPainterFactoryService.createTextTextFormattableValueRecordGrid(grid, grid.mainDataServer);

        grid.selectionChangedEventer = () => this.handleGridSelectionChangedEventer();

        return grid;
    }

    applyColumnListFilter() {
        this.grid.applyFilter((record) => this.filterInuseFields(record));
    }

    tryFocusFirstSearchMatch(searchText: string) {
        if (searchText.length > 0) {
            const rowCount = this.grid.mainDataServer.getRowCount();
            if (rowCount > 0) {
                // specify last as this will immediately wrap and start searching at first
                const lastRowIndex = this.grid.mainDataServer.getRowCount() - 1;
                this.tryFocusNextSearchMatchFromRow(searchText, lastRowIndex, false);
            }
        }
    }

    tryFocusNextSearchMatch(searchText: string, downKeys: ModifierKey.IdSet) {
        if (searchText.length > 0) {
            const rowCount = this.grid.mainDataServer.getRowCount();
            if (rowCount > 0) {
                const backwards = ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Shift);
                const focusedRecIdx = this.grid.focusedRecordIndex;

                let rowIndex: Integer;
                if (focusedRecIdx === undefined) {
                    rowIndex = 0;
                } else {
                    rowIndex = this.grid.recordToRowIndex(focusedRecIdx);
                }

                this.tryFocusNextSearchMatchFromRow(searchText, rowIndex, backwards);
            }
        }
    }

    protected override getDefaultGridSourceOrReferenceDefinition() {
        return this.createDefaultLayoutGridSourceOrReferenceDefinition();
    }

    protected override processGridSourceOpenedEvent() {
        const recordSource = this.grid.openedRecordSource as GridFieldTableRecordSource;
        this._records = recordSource.records;
    }

    protected override setBadness(value: Badness) {
        if (!Badness.isUsable(value)) {
            throw new AssertInternalError('GLEAFFSB42112', Badness.generateText(value));
        }
    }

    protected override hideBadnessWithVisibleDelay(_badness: Badness) {
        // always hidden as never bad
    }

    private createDefaultLayoutGridSourceOrReferenceDefinition() {
        const tableRecordSourceDefinition = this._legacyTableRecordSourceDefinitionFactoryService.createGridField(this._allowedFields.slice());
        const dataSourceDefinition = new DataSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
        return new DataSourceOrReferenceDefinition(dataSourceDefinition);
    }

    private handleGridSelectionChangedEventer() {
        if (this.selectionChangedEventer !== undefined) {
            this.selectionChangedEventer();
        }
    }

    private handleColumnListChangeEvent(_listChangeTypeId: UsableListChangeTypeId, _idx: Integer, _count: Integer) {
        delay1Tick(() => this.applyColumnListFilter());
    }

    private tryFocusNextSearchMatchFromRow(searchText: string, fromRowIndex: Integer, backwards: boolean) {
        const rowIncrement = backwards ? -1 : 1;
        const upperSearchText = searchText.toUpperCase();
        const rowCount = this.grid.mainDataServer.getRowCount();

        let rowIndex = fromRowIndex;
        let wrapped = false;
        do {
            rowIndex += rowIncrement;
            if (rowIndex < 0) {
                rowIndex = rowCount - 1
                wrapped = true;
            } else {
                if (rowIndex >= rowCount) {
                    rowIndex = 0;
                    wrapped = true;
                }
            }

            const recordIndex = this.grid.rowToRecordIndex(rowIndex);
            const field = this._allowedFields[recordIndex];
            const upperHeading = field.heading.toUpperCase();
            if (upperHeading.includes(upperSearchText)) {
                this.grid.focusedRecordIndex = recordIndex;
                break;
            }
        } while (!wrapped || (backwards ? rowIndex > fromRowIndex : rowIndex < fromRowIndex));
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

    private filterInuseFields(record: RevRecord) {
        const gridField = this._records[record.index];
        return !this._columnList.includesField(gridField);
    }
}

export namespace ColumnLayoutEditorAllowedFieldsFrame {
    export type SelectionChangedEventer = (this: void) => void;
    export type ColumnsViewWidthsChangedEventer = (this: void) => void;
}
