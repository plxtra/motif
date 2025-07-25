import { IndexSignatureHack, Integer } from '@pbkware/js-utils';
import {
    AdaptedRevgridBehavioredColumnSettings,
    AdiService,
    CellPainterFactoryService,
    CommandRegisterService,
    DateTimeTextFormattableValue,
    GridField,
    MarketsService,
    RowDataArrayGrid,
    SettingsService,
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

export class NewsHeadlinesDitemFrame extends BuiltinDitemFrame {
    readonly initialised = true;

    private readonly _grid: RowDataArrayGrid;

    private readonly _gridHeaderCellPainter: TextHeaderCellPainter;
    private readonly _gridMainCellPainter: TextFormattableValueRowDataArrayGridCellPainter<TextTextFormattableValueCellPainter>;

    constructor(
        ditemComponentAccess: DitemFrame.ComponentAccess,
        settingsService: SettingsService,
        marketsService: MarketsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
        cellPainterFactoryService: CellPainterFactoryService,
        ditemHtmlElement: HTMLElement,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.NewsHeadlines,
            ditemComponentAccess, settingsService, marketsService, commandRegisterService, desktopAccessService, symbolsService, adiService
        );

        const grid = new RowDataArrayGrid(
            this.settingsService,
            ditemHtmlElement,
            {},
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

        this._grid.setData(demoHeadlines.slice(), false);
    }

    override get builtinDitemTypeId() { return BuiltinDitemFrame.BuiltinTypeId.NewsHeadlines; }

    override finalise() {
        this._grid.destroy();
        super.finalise();
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

interface Headline {
    code: string | StringTextFormattableValue;
    name: string | StringTextFormattableValue;
    text: string | StringTextFormattableValue;
    sensitive: string | StringTextFormattableValue;
    time: Date | string  | DateTimeTextFormattableValue;
}

const demoHeadlines: IndexSignatureHack<readonly Headline[]> = [
    {
        code: 'Code',
        name: 'Name',
        text: 'Headline',
        sensitive: 'Sensitive',
        time: 'Time',
    },
    {
        code: 'TNR.AX',
        name: 'TORIAN RESOURCES LIMITED',
        text: 'Mt Stirling Central HREE Discovery Confirmed',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 13, 10),
    },
    {
        code: 'CHR.AX',
        name: 'CHARGER METALS NL',
        text: 'Quarterly Cashflow Report',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 13, 10),
    },
    {
        code: 'CAQ.AX',
        name: 'CAQ HOLDINGS LIMITED',
        text: 'Appendix 4C',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 13, 9),
    },
    {
        code: 'CCR.AX',
        name: 'CREDIT CLEAR LIMITED',
        text: 'Results of Meeting',
        sensitive: '',
        time: new Date(2022, 1, 31, 13, 9),
    },
    {
        code: 'RBX.AX',
        name: 'RESOURCE BASE LIMITED',
        text: 'Quarterly Activities/Appendix 5B Cash Flow Report',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 13, 6),
    },
    {
        code: createAdvertStringTextFormattableValue('SPC.AD'),
        name: createAdvertStringTextFormattableValue('Spectaculix Travel'),
        text: createAdvertStringTextFormattableValue('New magical Arizona holiday now available'),
        sensitive: createAdvertStringTextFormattableValue(''),
        time: createAdvertDateTimeTextFormattableValue(new Date(2022, 1, 31, 13, 6)),
    },
    {
        code: 'SCP.AX',
        name: 'SHOPPING CENTRES AUSTRALASIA PROPERTY GROUP',
        text: 'Application for quotation of securities - SCP',
        sensitive: '',
        time: new Date(2022, 1, 31, 13, 6),
    },
    {
        code: 'BMM.AX',
        name: 'BALKAN MINING AND MINERALS LIMITED',
        text: 'Quarterly Activities/Appendix 5B Cash Flow Report',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 13, 6),
    },
    {
        code: 'SCU.AX',
        name: 'STEMCELL UNITED LIMITED',
        text: 'Chairman\'s address to the FY2021 Annual General Meeting',
        sensitive: '',
        time: new Date(2022, 1, 31, 13, 3),
    },
    {
        code: 'DUB.AX',
        name: 'DUBBER CORPORATION LIMITED',
        text: 'Quarterly Activities/Appendix 4C Cash Flow Report',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 13, 3),
    },
    {
        code: 'AGR.AX',
        name: 'AGUIA RESOURCES LIMITED',
        text: 'Quarterly Appendix 5B Cash Flow Report',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 13, 3),
    },
    {
        code: 'ADX.AX',
        name: 'ADX ENERGY LTD',
        text: 'Quarterly Cashflow Report - Dec 2021',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 13, 2),
    },
    {
        code: 'SUB.AX',
        name: 'SUNBASE CHINA LIMITED',
        text: 'Final Dividend/Distribution for period ending 31 Jan 2022',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 13, 2),
    },
    {
        code: 'GCA.AX',
        name: 'GEC ASIAN VALUE FUND',
        text: 'Final Dividend/Distribution for period ending 31 Jan 2022',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 13, 2),
    },
    {
        code: 'FLO.AX',
        name: 'FLOWCOM LIMITED',
        text: 'Final Dividend/Distribution for period ending 31 Jan 2022',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 13, 2),
    },
    {
        code: 'KGD.AX',
        name: 'KULA GOLD LIMITED',
        text: 'Quarterly Activities/Appendix 5B Cash Flow Report',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 13, 0),
    },
    {
        code: 'AEV.AX',
        name: 'AVENIRA LIMITED',
        text: 'Quarterly Activities/Appendix 5B Cash Flow Report',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 12, 58),
    },
    {
        code: 'TPO.AX',
        name: 'TIAN POH RESOURCES LIMITED',
        text: 'Nuurst Coal Resource Estimate Restated',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 12, 57),
    },
    {
        code: 'RMT.AX',
        name: 'RMA ENERGY LIMITED',
        text: 'Quarterly Activities and Cashflow Report',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 12, 57),
    },
    {
        code: 'GFL.AX',
        name: 'GLOBAL MASTERS FUND LIMITED',
        text: 'GFL Notes - Quarterly Report December 2021',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 12, 56),
    },
] as const;

function createAdvertStringTextFormattableValue(text: string) {
    const result = new StringTextFormattableValue(text);
    result.addAttribute(TextFormattableValue.advertAttribute);
    return result;
}

// function createAdvertIntegerTextFormattableValue(value: Integer) {
//     const result = new IntegerTextFormattableValue(value);
//     result.addAttribute(TextFormattableValue.advertAttribute);
//     return result;
// }

function createAdvertDateTimeTextFormattableValue(value: Date) {
    const result = new DateTimeTextFormattableValue(value);
    result.addAttribute(TextFormattableValue.advertAttribute);
    return result;
}
