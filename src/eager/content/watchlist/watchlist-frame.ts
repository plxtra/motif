import { AssertInternalError, Integer, compareInteger } from '@pbkware/js-utils';
import {
    AdaptedRevgridBehavioredColumnSettings,
    DataIvemId,
    DataIvemIdArrayRankedDataIvemIdListDefinition,
    DataSourceDefinition,
    DataSourceOrReferenceDefinition,
    GridField,
    RankedDataIvemId,
    RankedDataIvemIdList,
    RankedDataIvemIdListDefinition,
    RankedDataIvemIdListTableRecordSource,
    ScanIdRankedDataIvemIdListDefinition,
    TextFormattableValueRecordGridCellPainter,
    TextHeaderCellPainter,
    TextTextFormattableValueCellPainter
} from '@plxtra/motif-core';
import { RevColumnLayoutOrReferenceDefinition, RevDataSourceOrReferenceDefinition, RevRecordRowOrderDefinition, RevViewCell } from 'revgrid';
import { DelayedBadnessGridSourceFrame } from '../delayed-badness-grid-source/internal-api';

export class WatchlistFrame extends DelayedBadnessGridSourceFrame {
    gridSourceOpenedEventer: WatchlistFrame.GridSourceOpenedEventer | undefined;
    recordFocusedEventer: WatchlistFrame.RecordFocusedEventer | undefined
    saveRequiredEventer: WatchlistFrame.SaveRequiredEventer | undefined;
    setGridHostFlexBasisEventer: WatchlistFrame.SetGridHostFlexBasisEventer;

    private _dataIvemIdList: RankedDataIvemIdList;
    private _recordSource: RankedDataIvemIdListTableRecordSource;
    private _fixedRowCount: Integer | undefined;

    private _gridHeaderCellPainter: TextHeaderCellPainter;
    private _gridMainCellPainter: TextFormattableValueRecordGridCellPainter<TextTextFormattableValueCellPainter>;

    get userCanAdd() { return this._dataIvemIdList.userCanAdd; }
    get userCanReplace() { return this._dataIvemIdList.userCanReplace; }
    get userCanRemove() { return this._dataIvemIdList.userCanRemove; }
    get lockedRankedDataIvemIdList() { return this._recordSource.lockedRankedDataIvemIdList; }
    get fixedRowCount() { return this._fixedRowCount; }
    set fixedRowCount(value: Integer | undefined) {
        if (value !== this._fixedRowCount) {
            this._fixedRowCount = value;
            this.updateFlexBasis();
        }
    }
    get focusedRowColoredAllowed() { return this._gridMainCellPainter.focusedRowColoredAllowed; }
    set focusedRowColoredAllowed(value: boolean) {
        this._gridMainCellPainter.focusedRowColoredAllowed = value;
    }

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

    tryOpenDataIvemIdArray(dataIvemIds: readonly DataIvemId[], keepView: boolean) {
        const definition = this.createGridSourceOrReferenceDefinitionFromDataIvemIds(dataIvemIds);
        return this.tryOpenGridSource(definition, keepView);
    }

    tryOpenScan(scanId: string, keepView: boolean) {
        const definition = this.createGridSourceOrReferenceDefinitionFromScanId(scanId);
        return this.tryOpenGridSource(definition, keepView);
    }

    createGridSourceOrReferenceDefinitionFromList(
        listDefinition: RankedDataIvemIdListDefinition,
        columnLayoutOrReferenceDefinition: RevColumnLayoutOrReferenceDefinition | undefined,
        rowOrderDefinition: RevRecordRowOrderDefinition | undefined,
    ) {
        const tableRecordSourceDefinition = this._legacyTableRecordSourceDefinitionFactoryService.createRankedDataIvemIdList(
            listDefinition
        );
        const dataSourceDefinition = new DataSourceDefinition(
            tableRecordSourceDefinition,
            columnLayoutOrReferenceDefinition,
            rowOrderDefinition,
        );
        return new DataSourceOrReferenceDefinition(dataSourceDefinition);
    }

    async saveGridSourceAs(as: RevDataSourceOrReferenceDefinition.SaveAsDefinition): Promise<void> {
        const oldDataIvemIdList = this._dataIvemIdList;
        const count = oldDataIvemIdList.count;
        const rankedDataIvemIds = new Array<RankedDataIvemId>(count);
        for (let i = 0; i < count; i++) {
            rankedDataIvemIds[i] = oldDataIvemIdList.getAt(i);
        }

        rankedDataIvemIds.sort((left, right) => compareInteger(left.rank, right.rank));
        const newDataIvemIds = rankedDataIvemIds.map((rankedDataIvemId) => rankedDataIvemId.dataIvemId);

        let columnLayoutOrReferenceDefinition: RevColumnLayoutOrReferenceDefinition | undefined;
        let rowOrderDefinition: RevRecordRowOrderDefinition | undefined;
        if (as.tableRecordSourceOnly) {
            columnLayoutOrReferenceDefinition = undefined;
            rowOrderDefinition = undefined;
        } else {
            columnLayoutOrReferenceDefinition = this.createColumnLayoutOrReferenceDefinition();
            rowOrderDefinition = this.createRowOrderDefinition();
        }

        let dataIvemIdArrayRankedDataIvemIdListDefinition: DataIvemIdArrayRankedDataIvemIdListDefinition | undefined;
        if (as.name === undefined) {
            dataIvemIdArrayRankedDataIvemIdListDefinition = new DataIvemIdArrayRankedDataIvemIdListDefinition('', '', '', newDataIvemIds);
            this.notifySaveRequired();
        } else {
            dataIvemIdArrayRankedDataIvemIdListDefinition = new DataIvemIdArrayRankedDataIvemIdListDefinition('', '', '', newDataIvemIds); // remove when implemented
            // if (as.id !== undefined) {
            //     const referentialLockResult = await this._referenceableGridSourceDefinitionsStoreService.tryLockItemByKey(as.id, this.opener);
            //     if (referentialLockResult.isOk()) {
            //         const referential = referentialLockResult.value;
            //         if (referential !== undefined) {
            //             const list = referential.lockedList;
            //             if (list instanceof JsonScoredRankedDataIvemIdList) {
            //                 list.set(newDataIvemIds);
            //                 jsonRankedDataIvemIdListDefinition = list.createDefinition();
            //             }
            //         }
            //     }
            // }

            // if (jsonRankedDataIvemIdListDefinition === undefined) {
            //     const namedJsonRankedDataIvemIdListDefinition = new JsonRankedDataIvemIdListDefinition(as.name, '', '', newDataIvemIds);
            //     this._referenceableGridSourceDefinitionsStoreService.new(namedJsonRankedDataIvemIdListDefinition);
            //     jsonRankedDataIvemIdListDefinition = namedJsonRankedDataIvemIdListDefinition;
            // }
        }

        const definition = this.createGridSourceOrReferenceDefinitionFromList(
            dataIvemIdArrayRankedDataIvemIdListDefinition,
            columnLayoutOrReferenceDefinition,
            rowOrderDefinition,
        );

        const gridSourceOrReferencePromise = this.tryOpenGridSource(definition, true);
        AssertInternalError.throwErrorIfPromiseRejected(gridSourceOrReferencePromise, 'WFSGSA49991', `${this.opener.lockerName}: ${as.name ?? ''}`);

        return Promise.resolve(undefined); // remove when fixed
    }

    getAt(index: Integer) {
        return this._dataIvemIdList.getAt(index);
    }

    addDataIvemIds(dataIvemIds: DataIvemId[], focusFirst: boolean) {
        let wantFocus = focusFirst;
        let result = false;
        const count = dataIvemIds.length;

        const canAdd = this._dataIvemIdList.userCanAdd;
        for (let i = 0; i < count; i++) {
            const dataIvemId = dataIvemIds[i];
            let existingIndexOrAddIndex = this.indexOfRecordByDataIvemId(dataIvemId);
            if (existingIndexOrAddIndex < 0) {
                if (canAdd) {
                    existingIndexOrAddIndex = this._dataIvemIdList.userAdd(dataIvemId);
                } else {
                    existingIndexOrAddIndex = -1;
                }
            }
            if (existingIndexOrAddIndex >= 0) {
                result = true;

                if (wantFocus) {
                    this.focusItem(existingIndexOrAddIndex);
                    wantFocus = false;
                }
            }
        }

        return result;
    }

    userAdd(dataIvemId: DataIvemId) {
        return this._dataIvemIdList.userAdd(dataIvemId);
    }

    userReplaceAt(index: Integer, dataIvemIds: DataIvemId[]): void {
        this._dataIvemIdList.userReplaceAt(index, dataIvemIds);
    }

    deleteFocusedRecord() {
        const index = this.getFocusedRecordIndex();
        if (index === undefined) {
            throw new AssertInternalError('WFDFS01023');
        } else {
            this._dataIvemIdList.userRemoveAt(index, 1);
        }
    }

    tryFocus(dataIvemId: DataIvemId, tryAddIfNotExist: boolean): boolean {
        const existingIndex = this.indexOfRecordByDataIvemId(dataIvemId);

        if (existingIndex >= 0) {
            this.focusItem(existingIndex);
            return true;
        } else {
            if (!tryAddIfNotExist || !this.userCanAdd) {
                return false;
            } else {
                const addIndex = this.userAdd(dataIvemId);
                this.focusItem(addIndex);
                return true;
            }
        }
    }

    protected override applySettings() {
        super.applySettings();

        this.updateFlexBasis();
    }

    protected override getDefaultGridSourceOrReferenceDefinition() {
        return this.createGridSourceOrReferenceDefinitionFromDataIvemIds([]);
    }

    protected override processGridSourceOpenedEvent() {
        this._recordSource = this.grid.openedRecordSource as RankedDataIvemIdListTableRecordSource;
        const dataIvemIdList = this._recordSource.lockedRankedDataIvemIdList;
        this._dataIvemIdList = dataIvemIdList;
        if (this.gridSourceOpenedEventer !== undefined) {
            this.gridSourceOpenedEventer(dataIvemIdList, this._recordSource.lockedRankedDataIvemIdList.name);
        }
    }

    protected override processRecordFocusedEvent(newRecordIndex: Integer | undefined, _oldRecordIndex: Integer | undefined) {
        if (this.recordFocusedEventer !== undefined) {
            this.recordFocusedEventer(newRecordIndex);
        }
    }

    private notifySaveRequired() {
        if (this.saveRequiredEventer !== undefined) {
            this.saveRequiredEventer();
        }
    }

    private createGridSourceOrReferenceDefinitionFromDataIvemIds(dataIvemIds: readonly DataIvemId[]) {
        const rankedDataIvemIdListDefinition = new DataIvemIdArrayRankedDataIvemIdListDefinition('', '', '', dataIvemIds);
        return this.createGridSourceOrReferenceDefinitionFromList(rankedDataIvemIdListDefinition, undefined, undefined);
    }

    private createGridSourceOrReferenceDefinitionFromScanId(scanId: string) {
        const rankedDataIvemIdListDefinition = new ScanIdRankedDataIvemIdListDefinition(scanId);
        return this.createGridSourceOrReferenceDefinitionFromList(rankedDataIvemIdListDefinition, undefined, undefined);
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

    private updateFlexBasis() {
        if (this._fixedRowCount !== undefined) {
            // process settings change here to ensure grid has been updated
            const rowHeight = this.gridRowHeight * this._fixedRowCount;
            const headerHeight = this.calculateHeaderPlusFixedRowsHeight();
            const gridHorizontalScrollbarMarginedHeight = this.gridHorizontalScrollbarInsideOverlap;
            const height = headerHeight + rowHeight + gridHorizontalScrollbarMarginedHeight;
            this.setGridHostFlexBasisEventer(height);
        }
    }

    private indexOfRecordByDataIvemId(dataIvemId: DataIvemId): Integer {
        const list = this._dataIvemIdList;
        const count = list.count;
        for (let i = 0; i < count; i++) {
            const rankedDataIvemId = list.getAt(i);
            if (DataIvemId.isEqual(rankedDataIvemId.dataIvemId, dataIvemId)) {
                return i;
            }
        }
        return -1;
    }
}


export namespace WatchlistFrame {
    export type GridSourceOpenedEventer = (this: void, rankedDataIvemIdList: RankedDataIvemIdList, rankedDataIvemIdListName: string | undefined) => void;
    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;
    export type SaveRequiredEventer = (this: void) => void;
    export type SetGridHostFlexBasisEventer = (this: void, value: number) => void;

    export namespace WatchlistJsonName {
        export const keptLayout = 'keptLayout';
    }
}
