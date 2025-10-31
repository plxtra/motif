import { Integer } from '@pbkware/js-utils';
import {
    AdaptedRevgridBehavioredColumnSettings,
    BrokerageAccountGroup,
    DataSourceDefinition,
    DataSourceOrReferenceDefinition,
    GridField,
    Holding,
    HoldingTableRecordSource,
    KeyedCorrectnessList,
    TextFormattableValueRecordGridCellPainter,
    TextHeaderCellPainter,
    TextTextFormattableValueCellPainter
} from '@plxtra/motif-core';
import { RevViewCell } from 'revgrid';
import { DelayedBadnessGridSourceFrame } from '../delayed-badness-grid-source/internal-api';

export class HoldingsFrame extends DelayedBadnessGridSourceFrame {
    gridSourceOpenedEventer: HoldingsFrame.GridSourceOpenedEventer | undefined;
    recordFocusedEventer: HoldingsFrame.RecordFocusedEventer | undefined

    private _recordSource: HoldingTableRecordSource;
    private _recordList: KeyedCorrectnessList<Holding>;

    private _gridHeaderCellPainter: TextHeaderCellPainter;
    private _gridMainCellPainter: TextFormattableValueRecordGridCellPainter<TextTextFormattableValueCellPainter>;

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

    tryOpenBrokerageAccountGroup(group: BrokerageAccountGroup, keepView: boolean) {
        const definition = this.createDefaultLayoutGridSourceOrReferenceDefinition(group);
        return this.tryOpenGridSource(definition, keepView);
    }

    protected override getDefaultGridSourceOrReferenceDefinition() {
        return this.createDefaultLayoutGridSourceOrReferenceDefinition(HoldingsFrame.defaultBrokerageAccountGroup);
    }

    protected override processGridSourceOpenedEvent() {
        this._recordSource = this.grid.openedRecordSource as HoldingTableRecordSource;
        this._recordList = this._recordSource.recordList;
        const brokerageAccountGroup = this._recordSource.brokerageAccountGroup;
        if (this.gridSourceOpenedEventer !== undefined) {
            this.gridSourceOpenedEventer(brokerageAccountGroup);
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

    private getGridMainCellPainter(viewCell: RevViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>) {
        return this._gridMainCellPainter;
    }

    private createDefaultLayoutGridSourceOrReferenceDefinition(brokerageAccountGroup: BrokerageAccountGroup) {
        const tableRecordSourceDefinition = this._legacyTableRecordSourceDefinitionFactoryService.createHolding(brokerageAccountGroup);
        const dataSourceDefinition = new DataSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
        return new DataSourceOrReferenceDefinition(dataSourceDefinition);
    }
}


export namespace HoldingsFrame {
    export type GridSourceOpenedEventer = (this: void, brokerageAccountGroup: BrokerageAccountGroup) => void;
    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;

    export const defaultBrokerageAccountGroup = BrokerageAccountGroup.createAll();
}
