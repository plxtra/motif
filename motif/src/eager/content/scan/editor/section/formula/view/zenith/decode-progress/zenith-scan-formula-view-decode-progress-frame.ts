import { Integer } from '@pbkware/js-utils';
import {
    AdaptedRevgridBehavioredColumnSettings,
    CellPainterFactoryService,
    GridField,
    IntegerTextFormattableValue,
    RowDataArrayGrid,
    ScanFormulaZenithEncodingService,
    SettingsService,
    SourcedFieldGrid,
    StringId,
    StringTextFormattableValue,
    Strings,
    TextFormattableValueRowDataArrayGridCellPainter,
    TextHeaderCellPainter,
    TextTextFormattableValueCellPainter
} from '@plxtra/motif-core';
import { RevDataRowArrayGrid, RevHorizontalAlignId, RevViewCell } from 'revgrid';

export class ZenithScanFormulaViewDecodeProgressFrame {
    private _grid: RowDataArrayGrid;

    private _gridHeaderCellPainter: TextHeaderCellPainter;
    private _gridMainCellPainter: TextFormattableValueRowDataArrayGridCellPainter<TextTextFormattableValueCellPainter>;
    private _dataBeenSet: boolean;

    constructor(
        private readonly _settingsService: SettingsService,
        private readonly _cellPainterFactoryService: CellPainterFactoryService,
    ) {
    }

    get dataBeenSet() { return this._dataBeenSet; }
    get emWidth() { return this._grid.emWidth; }

    finalise() {
        this._grid.destroy();
    }

    setupGrid(gridHost: HTMLElement) {
        this._grid = this.createGridAndCellPainters(gridHost);
        this._grid.activate();
    }

    setData(nodes: readonly ScanFormulaZenithEncodingService.DecodeProgress.DecodedNode[] | undefined) {
        if (nodes === undefined) {
            const rows = new Array<ZenithScanFormulaViewDecodeProgressFrame.DataRow>(1);
            rows[0] = {
                depth: Strings[StringId.Depth],
                nodeType: Strings[StringId.NodeType],
            };
            this._grid.setData(rows, false);
        } else {
            const count = nodes.length;
            const rows = new Array<ZenithScanFormulaViewDecodeProgressFrame.DataRow>(count + 1);
            rows[0] = {
                depth: Strings[StringId.Depth],
                nodeType: Strings[StringId.NodeType],
            };
            for (let i = 0; i < count; i++) {
                const node = nodes[i];
                const row: ZenithScanFormulaViewDecodeProgressFrame.DataRow = {
                    depth: new IntegerTextFormattableValue(node.nodeDepth),
                    nodeType: new StringTextFormattableValue(node.tupleNodeType),
                };
                rows[i + 1] = row;
            }
            this._grid.setData(rows, false);
        }

        this._dataBeenSet = true;
    }

    waitLastServerNotificationRendered(next: boolean) {
        return this._grid.renderer.waitLastServerNotificationRendered(next);
    }

    calculateActiveColumnsWidth() {
        return this._grid.calculateActiveColumnsWidth();
    }

    private handleRowFocusEvent(newRowIndex: Integer | undefined) {
        //
    }

    private handleGridClickEvent(columnIndex: Integer, rowIndex: Integer) {
        //
    }

    private createGridAndCellPainters(gridHostElement: HTMLElement) {
        const grid = this.createGrid(gridHostElement);

        grid.rowFocusEventer = (newRowIndex) => this.handleRowFocusEvent(newRowIndex);
        grid.mainClickEventer = (fieldIndex, rowIndex) => this.handleGridClickEvent(fieldIndex, rowIndex);

        this._gridHeaderCellPainter = this._cellPainterFactoryService.createTextHeader(grid, grid.headerDataServer);
        this._gridMainCellPainter = this._cellPainterFactoryService.createTextTextFormattableValueRowDataArrayGrid(grid, grid.mainDataServer);

        return grid;
    }

    private createGrid(gridHostElement: HTMLElement) {
        const customGridSettings: SourcedFieldGrid.CustomGridSettings = {
        }

        const grid = new RowDataArrayGrid(
            this._settingsService,
            gridHostElement,
            customGridSettings,
            (index, key, heading) => this.createField(key, heading),
            (columnSettings) => this.customiseSettingsForNewGridColumn(columnSettings),
            (viewCell) => this.getGridMainCellPainter(viewCell),
            (viewCell) => this.getGridHeaderCellPainter(viewCell),
            this,
        );
        return grid;
    }

    private createField(key: string, heading: string) {
        const field = RowDataArrayGrid.createField(
            key,
            heading,
            RevHorizontalAlignId.Left,
        );
        return field;
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

    // private createDefaultColumnLayout() {
    //     const definition = DayTradesGridField.createDefaultColumnLayoutDefinition();
    //     return new RevColumnLayout(definition);
    // }

}

export namespace ZenithScanFormulaViewDecodeProgressFrame {
    export interface DataRow extends RevDataRowArrayGrid.DataRow {
        readonly depth: string | IntegerTextFormattableValue;
        readonly nodeType: string | StringTextFormattableValue;
    }
}
