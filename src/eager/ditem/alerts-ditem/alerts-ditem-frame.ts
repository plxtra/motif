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
    StringTextFormattableValue,
    SymbolsService,
    TextFormattableValue,
    TextFormattableValueRowDataArrayGridCellPainter,
    TextHeaderCellPainter,
    TextTextFormattableValueCellPainter,
    TimeTextFormattableValue
} from '@plxtra/motif-core';
import { RevHorizontalAlignId, RevViewCell } from 'revgrid';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class AlertsDitemFrame extends BuiltinDitemFrame {
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
        super(BuiltinDitemFrame.BuiltinTypeId.Alerts,
            ditemComponentAccess, settingsService, marketsService, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    override get builtinDitemTypeId() { return BuiltinDitemFrame.BuiltinTypeId.Alerts; }

    override finalise() {
        this._grid.destroy();
        super.finalise();
    }

    createGrid(canvasGridElement: HTMLCanvasElement, cellPainterFactoryService: CellPainterFactoryService) {
        const grid = new RowDataArrayGrid(
            this.settingsService,
            canvasGridElement,
            {},
            (index, key, heading) => this.createField(key, heading),
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

        this._grid.setData(demoAlerts.slice(), false);
    }

    private handleRowFocusEvent(newRowIndex: Integer | undefined) {
        //
    }

    private handleGridClickEvent(columnIndex: Integer, rowIndex: Integer) {
        //
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
}

interface Alert {
    code: string | StringTextFormattableValue;
    time: Date | string  | TimeTextFormattableValue;
    eventText: string | StringTextFormattableValue;
}

const demoAlerts: IndexSignatureHack<readonly Alert[]> = [
    {
        code: 'Code',
        time: 'Time',
        eventText: 'Event',
    },
    {
        code: 'BHP.AX',
        time: new TimeTextFormattableValue(new Date(2022, 1, 31, 12, 43)),
        eventText: 'BHP.AX last price dropped below 45',
    },
    {
        code: createAdvertStringTextFormattableValue('SPC.AD'),
        time: createAdvertTimeTextFormattableValue(new Date(2022, 1, 31, 11, 48)),
        eventText: createAdvertStringTextFormattableValue('New Arizona holiday package under $12000 announced'),
    },
    {
        code: 'CBA.AX',
        time: new TimeTextFormattableValue(new Date(2022, 1, 31, 11, 10)),
        eventText: 'CBA.AX moving average crossing',
    },
] as const;

function createAdvertStringTextFormattableValue(text: string) {
    const result = new StringTextFormattableValue(text);
    result.addAttribute(TextFormattableValue.advertAttribute);
    return result;
}

function createAdvertTimeTextFormattableValue(value: Date) {
    const result = new TimeTextFormattableValue(value);
    result.addAttribute(TextFormattableValue.advertAttribute);
    return result;
}
