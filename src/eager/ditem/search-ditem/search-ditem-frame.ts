import { IndexSignatureHack, Integer } from '@pbkware/js-utils';
import {
    AdaptedRevgridBehavioredColumnSettings,
    AdiService,
    CellPainterFactoryService,
    CommandRegisterService,
    GridField,
    MarketsService,
    RowDataArrayGrid,
    SettingsService,
    SourcedFieldGrid,
    StringTextFormattableValue,
    SymbolsService,
    TextFormattableValue,
    TextFormattableValueRowDataArrayGridCellPainter,
    TextHeaderCellPainter,
    TextTextFormattableValueCellPainter
} from '@plxtra/motif-core';
import { RevHorizontalAlignId, RevViewCell } from 'revgrid';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';


export class SearchDitemFrame extends BuiltinDitemFrame {
    readonly initialised = true;

    private _grid: RowDataArrayGrid;
    private _gridHeaderCellPainter: TextHeaderCellPainter;
    private _gridMainCellPainter: TextFormattableValueRowDataArrayGridCellPainter<TextTextFormattableValueCellPainter>;

    constructor(
        ditemComponentAccess: DitemFrame.ComponentAccess,
        settingsService: SettingsService,
        marketsService: MarketsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Search,
            ditemComponentAccess, settingsService, marketsService, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    override get builtinDitemTypeId() { return BuiltinDitemFrame.BuiltinTypeId.Search; }

    override finalise() {
        this._grid.destroy();
        super.finalise();
    }

    createGrid(canvasGridElement: HTMLCanvasElement, cellPainterFactoryService: CellPainterFactoryService) {
        const customGridSettings: SourcedFieldGrid.CustomGridSettings = {
            mouseColumnSelectionEnabled: false,
            mouseRowSelectionEnabled: false,
            mouseAddToggleExtendSelectionAreaEnabled: false,
            multipleSelectionAreas: false,
            sortOnDoubleClick: false,
            viewColumnWidthAdjust: true,
            fixedColumnCount: 0,
        };

        const grid = new RowDataArrayGrid(
            this.settingsService,
            canvasGridElement,
            customGridSettings,
            (index, key, heading) => this.createField(index, key, heading),
            (columnSettings) => this.customiseSettingsForNewGridColumn(columnSettings),
            (viewCell) => this.getGridHeaderCellPainter(viewCell),
            (viewCell) => this.getGridMainCellPainter(viewCell),
            this,
        );
        this._grid = grid;

        grid.rowFocusEventer = (newRowIndex) => this.handleRowFocusEvent(newRowIndex);
        grid.mainClickEventer = (fieldIndex, rowIndex) => this.handleGridClickEvent(fieldIndex, rowIndex);

        this._gridHeaderCellPainter = cellPainterFactoryService.createTextHeader(grid, grid.headerDataServer);
        this._gridMainCellPainter = cellPainterFactoryService.createTextTextFormattableValueRowDataArrayGrid(grid, grid.mainDataServer);

        this._grid.setData(demoSearchResults.slice(), false);
    }

    private handleRowFocusEvent(newRowIndex: Integer | undefined) {
        //
    }

    private handleGridClickEvent(columnIndex: Integer, rowIndex: Integer) {
        //
    }

    private createField(index: Integer, key: string, heading: string) {
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
}

interface SearchResult {
    code: string | StringTextFormattableValue;
    company: string | StringTextFormattableValue;
    product: string  | StringTextFormattableValue;
    price: string | StringTextFormattableValue;
}

const demoSearchResults: IndexSignatureHack<readonly SearchResult[]> = [
    {
        code: 'Code',
        company: 'Company',
        product: 'Product',
        price: 'Price',
    },
    {
        code: createAdvertStringTextFormattableValue('trav1.ad'),
        company: createAdvertStringTextFormattableValue('Example Travel Company 1'),
        product: createAdvertStringTextFormattableValue('See Arizona in style'),
        price: createAdvertStringTextFormattableValue('18,000'),
    },
    {
        code: createAdvertStringTextFormattableValue('spc.ad'),
        company: createAdvertStringTextFormattableValue('Spectaculix Travel'),
        product: createAdvertStringTextFormattableValue('Magical Arizona'),
        price: createAdvertStringTextFormattableValue('11,999'),
    },
    {
        code: createAdvertStringTextFormattableValue('trav2.ad'),
        company: createAdvertStringTextFormattableValue('Example Travel Company 1'),
        product: createAdvertStringTextFormattableValue('The best of Arizona'),
        price: createAdvertStringTextFormattableValue('10,500'),
    },
] as const;

function createAdvertStringTextFormattableValue(text: string) {
    const result = new StringTextFormattableValue(text);
    result.addAttribute(TextFormattableValue.advertAttribute);
    return result;
}
