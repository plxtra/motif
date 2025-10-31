import { Integer } from '@pbkware/js-utils';
import {
    AdaptedRevgridBehavioredColumnSettings,
    Balances,
    BalancesTableRecordSource,
    BrokerageAccountGroup,
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

export class BalancesFrame extends DelayedBadnessGridSourceFrame {
    gridSourceOpenedEventer: BalancesFrame.GridSourceOpenedEventer | undefined;
    recordFocusedEventer: BalancesFrame.RecordFocusedEventer | undefined

    private _recordSource: BalancesTableRecordSource;
    private _recordList: KeyedCorrectnessList<Balances>;

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
        return this.createDefaultLayoutGridSourceOrReferenceDefinition(BalancesFrame.defaultBrokerageAccountGroup);
    }

    protected override processGridSourceOpenedEvent() {
        this._recordSource = this.grid.openedRecordSource as BalancesTableRecordSource;
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

    private getGridMainCellPainter(_viewCell: RevViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>) {
        return this._gridMainCellPainter;
    }

    private createDefaultLayoutGridSourceOrReferenceDefinition(brokerageAccountGroup: BrokerageAccountGroup) {
        const tableRecordSourceDefinition = this._legacyTableRecordSourceDefinitionFactoryService.createBalances(brokerageAccountGroup);
        const dataSourceDefinition = new DataSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
        return new DataSourceOrReferenceDefinition(dataSourceDefinition);
    }
}

export namespace BalancesFrame {
    export type GridSourceOpenedEventer = (this: void, brokerageAccountGroup: BrokerageAccountGroup) => void;
    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;

    export const defaultBrokerageAccountGroup = BrokerageAccountGroup.createAll();
}
