import { AssertInternalError, Integer, LockOpenListItem } from '@pbkware/js-utils';
import {
    AdaptedRevgridBehavioredColumnSettings,
    DataSourceDefinition,
    DataSourceOrReferenceDefinition,
    Feed,
    FeedTableRecordSource,
    GridField,
    KeyedCorrectnessList,
    StringId,
    Strings,
    TextFormattableValueRecordGridCellPainter,
    TextHeaderCellPainter,
    TextTextFormattableValueCellPainter
} from '@plxtra/motif-core';
import { RevColumnLayoutOrReferenceDefinition, RevViewCell } from 'revgrid';
import { DelayedBadnessGridSourceFrame } from '../../delayed-badness-grid-source/internal-api';

export class FeedsGridFrame extends DelayedBadnessGridSourceFrame {
    private _recordSource: FeedTableRecordSource;
    private _recordList: KeyedCorrectnessList<Feed>;

    private _gridHeaderCellPainter: TextHeaderCellPainter;
    private _gridMainCellPainter: TextFormattableValueRecordGridCellPainter<TextTextFormattableValueCellPainter>;

    get recordList() { return this._recordList; }

    override initialise(opener: LockOpenListItem.Opener, previousLayoutDefinition: RevColumnLayoutOrReferenceDefinition | undefined, keepPreviousLayoutIfPossible: boolean): void {
        super.initialise(opener, previousLayoutDefinition, keepPreviousLayoutIfPossible);
        const openPromise = this.tryOpenDefault(false);
        openPromise.then(
            (result) => {
                if (result.isErr()) {
                    this._toastService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.Feeds]}: ${result.error}`);
                }
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'FGFI50139') }
        );
    }

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

    createDefaultLayoutGridSourceOrReferenceDefinition() {
        const tableRecordSourceDefinition = this._legacyTableRecordSourceDefinitionFactoryService.createFeed();
        const dataSourceDefinition = new DataSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
        return new DataSourceOrReferenceDefinition(dataSourceDefinition);
    }

    protected override getDefaultGridSourceOrReferenceDefinition() {
        return this.createDefaultLayoutGridSourceOrReferenceDefinition();
    }

    protected override processGridSourceOpenedEvent() {
        this._recordSource = this.grid.openedRecordSource as FeedTableRecordSource;
        this._recordList = this._recordSource.recordList;
    }

    protected override processRecordFocusedEvent(newRecordIndex: Integer | undefined, _oldRecordIndex: Integer | undefined) {
        if (newRecordIndex !== undefined) {
            const feed = this._recordList.getAt(newRecordIndex);
            this.processFeedFocusChange(feed);
        }
    }

    private processFeedFocusChange(newFocusedFeed: Feed) {
        // not yet used
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
