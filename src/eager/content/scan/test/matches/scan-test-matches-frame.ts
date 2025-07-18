import { AssertInternalError, Integer } from '@pbkware/js-utils';
import {
    AdaptedRevgridBehavioredColumnSettings,
    DataIvemIdExecuteScanDataDefinition,
    DataIvemIdExecuteScanRankedDataIvemIdListDefinition,
    DataSourceDefinition,
    DataSourceOrReferenceDefinition,
    GridField,
    RankedDataIvemIdList,
    RankedDataIvemIdListTableRecordSource,
    StringId,
    Strings,
    TextFormattableValueRecordGridCellPainter,
    TextHeaderCellPainter,
    TextTextFormattableValueCellPainter
} from '@plxtra/motif-core';
import { RevViewCell } from 'revgrid';
import { DelayedBadnessGridSourceFrame } from '../../../delayed-badness-grid-source/internal-api';

export class ScanTestMatchesFrame extends DelayedBadnessGridSourceFrame {
    gridSourceOpenedEventer: ScanTestMatchesFrame.GridSourceOpenedEventer | undefined;
    recordFocusedEventer: ScanTestMatchesFrame.RecordFocusedEventer | undefined

    private _rankedDataIvemIdList: RankedDataIvemIdList;

    private _gridHeaderCellPainter: TextHeaderCellPainter;
    private _gridMainCellPainter: TextFormattableValueRecordGridCellPainter<TextTextFormattableValueCellPainter>;

    private _showFull: boolean;

    get rankedDataIvemIdList() { return this._rankedDataIvemIdList; }

    override createGridAndCellPainters(gridHostElement: HTMLElement) {
        const grid = this.createGrid(
            gridHostElement,
            {},
            (columnSettings) => this.customiseSettingsForNewGridColumn(columnSettings),
            (viewCell) => this.getGridMainCellPainter(viewCell),
            (viewCell) => this.getGridHeaderCellPainter(viewCell),
        );

        this._gridHeaderCellPainter = this._cellPainterFactoryService.createTextHeader(grid, grid.headerDataServer);
        this._gridMainCellPainter = this._cellPainterFactoryService.createTextTextFormattableValueRecordGrid(grid, grid.mainDataServer);

        return grid;
    }

    executeTest(
        name: string,
        description: string,
        category: string,
        dataDefinition: DataIvemIdExecuteScanDataDefinition
    ) {
        this.keepPreviousLayoutIfPossible = true;

        const gridSourceOrReferenceDefinition = this.createDefaultLayoutGridSourceOrReferenceDefinition(name, description, category, dataDefinition);

        const openPromise = this.tryOpenGridSource(gridSourceOrReferenceDefinition, false);
        openPromise.then(
            (result) => {
                if (result.isErr()) {
                    this._toastService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.ScanTestMatches]}: ${result.error}`);
                }
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'SSFER13971') }
        );
    }

    protected override getDefaultGridSourceOrReferenceDefinition() {
        throw new AssertInternalError('SCMFGDGSORD44218');
        return new DataSourceOrReferenceDefinition(''); // Invalid definition - should never be returned
    }

    protected override processGridSourceOpenedEvent() {
        const recordSource = this.grid.openedRecordSource as RankedDataIvemIdListTableRecordSource;
        this._rankedDataIvemIdList = recordSource.recordList;
        if (this.gridSourceOpenedEventer !== undefined) {
            this.gridSourceOpenedEventer();
        }
    }

    protected override processRecordFocusedEvent(newRecordIndex: Integer | undefined, _oldRecordIndex: Integer | undefined) {
        if (this.recordFocusedEventer !== undefined) {
            this.recordFocusedEventer(newRecordIndex);
        }
    }

    private createDefaultLayoutGridSourceOrReferenceDefinition(
        name: string,
        description: string,
        category: string,
        dataDefinition: DataIvemIdExecuteScanDataDefinition
    ) {
        const listDefinition = new DataIvemIdExecuteScanRankedDataIvemIdListDefinition(
            name,
            description,
            category,
            dataDefinition
        )
        const tableRecordSourceDefinition = this._legacyTableRecordSourceDefinitionFactoryService.createScanTest(listDefinition);
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

export namespace ScanTestMatchesFrame {
    export type GridSourceOpenedEventer = (this: void) => void;
    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;
}
