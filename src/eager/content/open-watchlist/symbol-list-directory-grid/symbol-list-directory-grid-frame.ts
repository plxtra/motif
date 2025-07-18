import { AssertInternalError, Integer, LockOpenListItem } from '@pbkware/js-utils';
import {
    AdaptedRevgridBehavioredColumnSettings,
    Badness,
    CellPainterFactoryService,
    DataSourceDefinition,
    DataSourceOrReferenceDefinition,
    GridField,
    RankedDataIvemIdListDirectory,
    RankedDataIvemIdListDirectoryItemTableRecordSource,
    ReferenceableColumnLayoutsService,
    ReferenceableDataSourcesService,
    ScansService,
    SettingsService,
    StringId,
    Strings,
    TableFieldSourceDefinitionCachingFactory,
    TableRecordSourceFactory,
    TextFormattableValueRecordGridCellPainter,
    TextHeaderCellPainter,
    TextTextFormattableValueCellPainter
} from '@plxtra/motif-core';
import { ToastService } from 'component-services-internal-api';
import { RevColumnLayoutOrReferenceDefinition, RevViewCell } from 'revgrid';
import { GridSourceFrame } from '../../grid-source/internal-api';
import { LegacyTableRecordSourceDefinitionFactoryService } from '../../legacy-table-record-source-definition-factory-service';

export class SymbolListDirectoryGridFrame extends GridSourceFrame {
    listFocusedEventer: SymbolListDirectoryGridFrame.listFocusedEventer | undefined;

    private _listDirectory: RankedDataIvemIdListDirectory;

    private _gridHeaderCellPainter: TextHeaderCellPainter;
    private _gridMainCellPainter: TextFormattableValueRecordGridCellPainter<TextTextFormattableValueCellPainter>;

    constructor(
        settingsService: SettingsService,
        private readonly _scansService: ScansService,
        referenceableColumnLayoutsService: ReferenceableColumnLayoutsService,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        tableRecordSourceDefinitionFactoryService: LegacyTableRecordSourceDefinitionFactoryService,
        tableRecordSourceFactory: TableRecordSourceFactory,
        referenceableGridSourcesService: ReferenceableDataSourcesService,
        cellPainterFactoryService: CellPainterFactoryService,
        toastService: ToastService,
        private readonly _frameOpener: LockOpenListItem.Opener,
    ) {
        super(
            settingsService,
            referenceableColumnLayoutsService,
            tableFieldSourceDefinitionCachingFactory,
            tableRecordSourceDefinitionFactoryService,
            tableRecordSourceFactory,
            referenceableGridSourcesService,
            cellPainterFactoryService,
            toastService,
        );
    }

    override initialise(opener: LockOpenListItem.Opener, previousLayoutDefinition: RevColumnLayoutOrReferenceDefinition | undefined, keepPreviousLayoutIfPossible: boolean): void {
        super.initialise(opener, previousLayoutDefinition, keepPreviousLayoutIfPossible);

        const openPromise = this.tryOpenDefault(true);
        openPromise.then(
            (openResult) => {
                if (openResult.isErr()) {
                    this._toastService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.NotificationChannelsGrid]}: ${openResult.error}`);
                }
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'SLDGFI44332'); }
        );
    }

    focusList(idOrName: string) {
        const upperName = idOrName.toUpperCase();
        const directory = this._listDirectory;
        const count = directory.count;
        for (let i = 0; i < count; i++) {
            const list = directory.getAt(i);
            const listName = list.name;
            if (listName.toUpperCase() === upperName) {
                this.grid.tryFocusYAndEnsureInView(i);
                return listName;
            }
        }
        for (let i = 0; i < count; i++) {
            const list = directory.getAt(i);
            if (list.id === idOrName) {
                this.grid.tryFocusYAndEnsureInView(i);
                return list.name;
            }
        }
        this.grid.focus.clear();
        return undefined;
    }

    override createGridAndCellPainters(gridHostElement: HTMLElement) {
        const grid = this.createGrid(
            gridHostElement,
            {
                fixedColumnCount: 1,
                mouseColumnSelectionEnabled: false,
                switchNewRectangleSelectionToRowOrColumn: 'row',
            },
            (columnSettings) => this.customiseSettingsForNewGridColumn(columnSettings),
            (viewCell) => this.getGridMainCellPainter(viewCell),
            (viewCell) => this.getGridHeaderCellPainter(viewCell),
        );

        this._gridHeaderCellPainter = this._cellPainterFactoryService.createTextHeader(grid, grid.headerDataServer);
        this._gridMainCellPainter = this._cellPainterFactoryService.createTextTextFormattableValueRecordGrid(grid, grid.mainDataServer);
        return grid;
    }

    protected override getDefaultGridSourceOrReferenceDefinition() {
        return this.createListGridSourceOrReferenceDefinition(undefined);
    }

    protected override processGridSourceOpenedEvent() {
        const recordSource = this.grid.openedRecordSource as RankedDataIvemIdListDirectoryItemTableRecordSource;
        this._listDirectory = recordSource.recordList;
    }

    protected override setBadness(value: Badness) {
        if (!Badness.isUsable(value)) {
            throw new AssertInternalError('GLECFSB42112', Badness.generateText(value));
        }
    }

    protected override hideBadnessWithVisibleDelay(_badness: Badness) {
        // always hidden as never bad
    }

    protected override processRecordFocusedEvent(newRecordIndex: Integer | undefined, _oldRecordIndex: Integer | undefined) {
        if (this.listFocusedEventer !== undefined) {
            if (newRecordIndex === undefined) {
                this.listFocusedEventer(undefined, undefined);
            } else {
                const list = this._listDirectory.getAt(newRecordIndex);
                this.listFocusedEventer(list.id, list.name);
            }
        }
    }

    private createListGridSourceOrReferenceDefinition(layoutDefinition: RevColumnLayoutOrReferenceDefinition | undefined) {
        const namedSourceList: RankedDataIvemIdListDirectory.NamedSourceList = {
            name: Strings[StringId.Scan],
            list: this._scansService.scanList,
        }
        const listDirectory = new RankedDataIvemIdListDirectory([namedSourceList], this._frameOpener);
        const tableRecordSourceDefinition = this._legacyTableRecordSourceDefinitionFactoryService.createRankedDataIvemIdListDirectoryItem(listDirectory);
        const dataSourceDefinition = new DataSourceDefinition(tableRecordSourceDefinition, layoutDefinition, undefined);
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

export namespace SymbolListDirectoryGridFrame {
    export type listFocusedEventer = (this: void, id: string | undefined, name: string | undefined) => void;
}
