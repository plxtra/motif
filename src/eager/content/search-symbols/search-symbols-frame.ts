import { AssertInternalError, Integer } from '@pbkware/js-utils';
import {
    AdaptedRevgridBehavioredColumnSettings,
    DataIvemBaseDetail,
    DataIvemDetailFromSearchSymbolsTableRecordSource,
    DataSourceDefinition,
    DataSourceOrReferenceDefinition,
    GridField,
    SearchSymbolsDataDefinition,
    StringId,
    Strings,
    TextFormattableValueRecordGridCellPainter,
    TextHeaderCellPainter,
    TextTextFormattableValueCellPainter
} from '@plxtra/motif-core';
import { RevViewCell } from 'revgrid';
import { DelayedBadnessGridSourceFrame } from '../delayed-badness-grid-source/internal-api';

export class SearchSymbolsFrame extends DelayedBadnessGridSourceFrame {
    gridSourceOpenedEventer: SearchSymbolsFrame.GridSourceOpenedEventer | undefined;
    recordFocusedEventer: SearchSymbolsFrame.RecordFocusedEventer | undefined

    private _recordList: DataIvemBaseDetail[];

    private _gridHeaderCellPainter: TextHeaderCellPainter;
    private _gridMainCellPainter: TextFormattableValueRecordGridCellPainter<TextTextFormattableValueCellPainter>;

    private _showFull: boolean;

    get recordList() { return this._recordList; }

    override createGridAndCellPainters(gridCanvasElement: HTMLCanvasElement) {
        const grid = this.createGrid(
            gridCanvasElement,
            {},
            (columnSettings) => this.customiseSettingsForNewGridColumn(columnSettings),
            (viewCell) => this.getGridMainCellPainter(viewCell),
            (viewCell) => this.getGridHeaderCellPainter(viewCell),
        );

        this._gridHeaderCellPainter = this._cellPainterFactoryService.createTextHeader(grid, grid.headerDataServer);
        this._gridMainCellPainter = this._cellPainterFactoryService.createTextTextFormattableValueRecordGrid(grid, grid.mainDataServer);

        return grid;
    }

    executeRequest(dataDefinition: SearchSymbolsDataDefinition) {
        this.keepPreviousLayoutIfPossible = dataDefinition.fullSymbol === this._showFull;
        this._showFull = dataDefinition.fullSymbol;

        const gridSourceOrReferenceDefinition = this.createDefaultLayoutGridSourceOrReferenceDefinition(dataDefinition);

        const openPromise = this.tryOpenGridSource(gridSourceOrReferenceDefinition, false);
        openPromise.then(
            (result) => {
                if (result.isErr()) {
                    this._toastService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.SearchSymbols]}: ${result.error}`);
                }
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'SSFER13971') }
        );
    }

    protected override getDefaultGridSourceOrReferenceDefinition() {
        throw new AssertInternalError('SSFGDGSORD44218');
        return new DataSourceOrReferenceDefinition(''); // Invalid definition - should never be returned
    }

    protected override processGridSourceOpenedEvent() {
        const recordSource = this.grid.openedRecordSource as DataIvemDetailFromSearchSymbolsTableRecordSource;
        this._recordList = recordSource.recordList;
        const dataDefinition = recordSource.dataDefinition;
        if (this.gridSourceOpenedEventer !== undefined) {
            this.gridSourceOpenedEventer(dataDefinition);
        }
    }

    protected override processRecordFocusedEvent(newRecordIndex: Integer | undefined, _oldRecordIndex: Integer | undefined) {
        if (this.recordFocusedEventer !== undefined) {
            this.recordFocusedEventer(newRecordIndex);
        }
    }

    private createDefaultLayoutGridSourceOrReferenceDefinition(dataDefinition: SearchSymbolsDataDefinition) {
        const tableRecordSourceDefinition = this._legacyTableRecordSourceDefinitionFactoryService.createDataIvemIdFromSearchSymbols(dataDefinition);
        const dataSourceDefinition = new DataSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
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
}

export namespace SearchSymbolsFrame {
    export type GridSourceOpenedEventer = (this: void, dataDefinition: SearchSymbolsDataDefinition) => void;
    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;
}
