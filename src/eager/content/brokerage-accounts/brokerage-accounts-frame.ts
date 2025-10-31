import { Integer } from '@pbkware/js-utils';
import {
    AdaptedRevgridBehavioredColumnSettings,
    BrokerageAccount,
    BrokerageAccountTableRecordSource,
    DataSourceDefinition,
    DataSourceOrReferenceDefinition,
    GridField,
    KeyedCorrectnessList,
    TextFormattableValueRecordGridCellPainter,
    TextHeaderCellPainter,
    TextTextFormattableValueCellPainter
} from '@plxtra/motif-core';
import { RevViewCell } from 'revgrid';
import { DelayedBadnessGridSourceFrame } from '../delayed-badness-grid-source/internal-api';

export class BrokerageAccountsFrame extends DelayedBadnessGridSourceFrame {
    recordFocusedEventer: BrokerageAccountsFrame.RecordFocusedEventer | undefined

    private _recordSource: BrokerageAccountTableRecordSource;
    private _recordList: KeyedCorrectnessList<BrokerageAccount>;

    private _gridHeaderCellPainter: TextHeaderCellPainter;
    private _gridMainCellPainter: TextFormattableValueRecordGridCellPainter<TextTextFormattableValueCellPainter>;

    get recordList() { return this._recordList; }

    override createGridAndCellPainters(gridCanvasElement: HTMLCanvasElement) {
        const grid = this.createGrid(
            gridCanvasElement,
            { fixedColumnCount: 1 },
            (columnSettings) => this.customiseSettingsForNewGridColumn(columnSettings),
            (viewCell) => this.getGridMainCellPainter(viewCell),
            (viewCell) => this.getGridHeaderCellPainter(viewCell),
        );

        this._gridHeaderCellPainter = this._cellPainterFactoryService.createTextHeader(grid, grid.headerDataServer);
        this._gridMainCellPainter = this._cellPainterFactoryService.createTextTextFormattableValueRecordGrid(grid, grid.mainDataServer);

        return grid;
    }

    protected override getDefaultGridSourceOrReferenceDefinition() {
        return this.createDefaultLayoutGridSourceOrReferenceDefinition();
    }

    protected override processGridSourceOpenedEvent() {
        this._recordSource = this.grid.openedRecordSource as BrokerageAccountTableRecordSource;
        this._recordList = this._recordSource.recordList;
    }

    protected override processRecordFocusedEvent(newRecordIndex: Integer | undefined, _oldRecordIndex: Integer | undefined) {
        if (this.recordFocusedEventer !== undefined) {
            this.recordFocusedEventer(newRecordIndex);
        }
    }

    private createDefaultLayoutGridSourceOrReferenceDefinition() {
        const tableRecordSourceDefinition = this._legacyTableRecordSourceDefinitionFactoryService.createBrokerageAccount();
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


export namespace BrokerageAccountsFrame {
    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;
    export type GridSourceOpenedEventer = (this: void) => void;
}

