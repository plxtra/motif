import { Integer } from '@pbkware/js-utils';
import {
    AdaptedRevgridBehavioredColumnSettings,
    BrokerageAccountGroup,
    DataSourceDefinition,
    DataSourceOrReferenceDefinition,
    GridField,
    KeyedCorrectnessList,
    Order,
    OrderTableRecordSource,
    TextFormattableValueRecordGridCellPainter,
    TextHeaderCellPainter,
    TextTextFormattableValueCellPainter
} from '@plxtra/motif-core';
import { RevViewCell } from 'revgrid';
import { DelayedBadnessGridSourceFrame } from '../delayed-badness-grid-source/internal-api';

export class OrdersFrame extends DelayedBadnessGridSourceFrame {
    gridSourceOpenedEventer: OrdersFrame.GridSourceOpenedEventer | undefined;
    recordFocusedEventer: OrdersFrame.RecordFocusedEventer | undefined

    private _recordSource: OrderTableRecordSource;
    private _recordList: KeyedCorrectnessList<Order>;

    private _gridHeaderCellPainter: TextHeaderCellPainter;
    private _gridMainCellPainter: TextFormattableValueRecordGridCellPainter<TextTextFormattableValueCellPainter>;

    get recordList() { return this._recordList; }

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

    getFocusedOrder() {
        const focusedIndex = this.getFocusedRecordIndex();
        if (focusedIndex === undefined) {
            return undefined;
        } else {
            return this._recordList.getAt(focusedIndex);
        }
    }

    canAmendFocusedOrder() {
        const focusedOrder = this.getFocusedOrder();
        if (focusedOrder === undefined) {
            return false;
        } else {
            return focusedOrder.canAmend();
        }
    }

    canCancelFocusedOrder() {
        const focusedOrder = this.getFocusedOrder();
        if (focusedOrder === undefined) {
            return false;
        } else {
            return focusedOrder.canCancel();
        }
    }

    canMoveFocusedOrder(): boolean {
        const focusedOrder = this.getFocusedOrder();
        if (focusedOrder === undefined) {
            return false;
        } else {
            return focusedOrder.canMove();
        }
    }

    tryOpenBrokerageAccountGroup(group: BrokerageAccountGroup, keepView: boolean) {
        const definition = this.createDefaultLayoutGridSourceOrReferenceDefinition(group);
        return this.tryOpenGridSource(definition, keepView);
    }

    createDefaultLayoutGridSourceOrReferenceDefinition(brokerageAccountGroup: BrokerageAccountGroup) {
        const tableRecordSourceDefinition = this._legacyTableRecordSourceDefinitionFactoryService.createOrder(brokerageAccountGroup);
        const dataSourceDefinition = new DataSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
        return new DataSourceOrReferenceDefinition(dataSourceDefinition);
    }

    protected override getDefaultGridSourceOrReferenceDefinition() {
        return this.createDefaultLayoutGridSourceOrReferenceDefinition(OrdersFrame.defaultBrokerageAccountGroup);
    }

    protected override processGridSourceOpenedEvent() {
        this._recordSource = this.grid.openedRecordSource as OrderTableRecordSource;
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
}


export namespace OrdersFrame {
    export type GridSourceOpenedEventer = (this: void, brokerageAccountGroup: BrokerageAccountGroup) => void;
    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;

    export const defaultBrokerageAccountGroup = BrokerageAccountGroup.createAll();
}
