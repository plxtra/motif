import {
    AssertInternalError,
    Err,
    Integer,
    JsonElement,
    LockOpenListItem,
    MultiEvent,
    Ok,
    Result,
} from '@pbkware/js-utils';
import {
    AdaptedRevgridBehavioredColumnSettings,
    Badness,
    CellPainterFactoryService,
    ColumnLayoutOrReferenceDefinition,
    DataSourceOrReference,
    DataSourceOrReferenceDefinition,
    ErrorCode,
    GridField,
    JsonElementErr,
    ReferenceableColumnLayoutsService,
    ReferenceableDataSourcesService,
    SettingsService,
    SourcedFieldGrid,
    StringId,
    Strings,
    TableFieldSourceDefinitionCachingFactory,
    TableGrid,
    TableRecordSourceDefinition,
    TableRecordSourceFactory
} from '@plxtra/motif-core';
import { RevColumnLayout, RevColumnLayoutOrReferenceDefinition, RevRecordDataServer, RevSubgrid } from 'revgrid';
import { ToastService } from '../../component-services/toast-service';
import { ContentFrame } from '../content-frame';
import { LegacyTableRecordSourceDefinitionFactoryService } from '../legacy-table-record-source-definition-factory-service';

export abstract class GridSourceFrame extends ContentFrame {
    dragDropAllowed: boolean;
    keepPreviousLayoutIfPossible = false;
    keptColumnLayoutOrReferenceDefinition: RevColumnLayoutOrReferenceDefinition | undefined;

    columnLayoutSetEventer: GridSourceFrame.ColumnLayoutSetEventer | undefined;

    private _componentAccess: GridSourceFrame.ComponentAccess;
    private _grid: TableGrid;

    private _privateNameSuffixId: GridSourceFrame.PrivateNameSuffixId | undefined;

    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _openedTableBadnessChangeSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        protected readonly _settingsService: SettingsService,
        private readonly _referenceableColumnLayoutsService: ReferenceableColumnLayoutsService,
        protected readonly _tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        protected readonly _legacyTableRecordSourceDefinitionFactoryService: LegacyTableRecordSourceDefinitionFactoryService,
        private readonly _tableRecordSourceFactory: TableRecordSourceFactory,
        private readonly _referenceableGridSourcesService: ReferenceableDataSourcesService,
        protected readonly _cellPainterFactoryService: CellPainterFactoryService,
        protected readonly _toastService: ToastService,
    ) {
        super();
    }

    get opener() { return this._grid.opener; }
    get grid() { return this._grid; }

    get visibleRowCount() { return this._grid.viewLayout.rowCount; }
    get mainRowCount() { return this._grid.mainRowCount; }
    get headerRowCount() { return this._grid.headerRowCount; }
    get filterActive() { return this._grid.isFiltered; }
    get recordCount(): Integer { return this._grid.recordCount; }
    get opened(): boolean { return this._grid.opened; }
    get openedTable() { return this._grid.openedTable; }
    get gridRowHeight() { return this._grid.rowHeight; }
    get gridHorizontalScrollbarInsideOverlap() { return this._grid.horizontalScroller.insideOverlap; }
    get emWidth() { return this._grid.emWidth; }

    get isFiltered(): boolean { return this._grid.isFiltered; }
    get recordFocused() {return this._grid.recordFocused; }

    setComponentAccess(componentAccess: GridSourceFrame.ComponentAccess) {
        this._componentAccess = componentAccess;
    }

    initialise(
        opener: LockOpenListItem.Opener,
        previousLayoutDefinition: RevColumnLayoutOrReferenceDefinition | undefined,
        keepPreviousLayoutIfPossible: boolean,
    ) {
        const gridHost = this._componentAccess.gridHost;
        this._grid = this.createGridAndCellPainters(gridHost);
        this.applySettings();
        this._grid.activate();
        this._grid.opener = opener;
        this._grid.keepPreviousLayoutIfPossible = keepPreviousLayoutIfPossible;
        this._grid.keptColumnLayoutOrReferenceDefinition = previousLayoutDefinition;
    }

    override finalise() {
        if (!this.finalised) {
            this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
            this.closeGridSource(false);
            this._grid.destroy();
            super.finalise();
        }
    }

    /** @deprecated will be removed when no longer used */
    setOpener(value: LockOpenListItem.Opener) {
        this._grid.opener = value;
    }

    calculateHeaderPlusFixedRowsHeight() {
        return this._grid.calculateHeaderPlusFixedRowsHeight();
    }

    tryCreateDefinitionFromJson(frameElement: JsonElement): Result<DataSourceOrReferenceDefinition.WithLayoutError | undefined> {
        const getElementResult = frameElement.tryGetElement(GridSourceFrame.JsonName.definition);
        if (getElementResult.isErr()) {
            const errorId = getElementResult.error;
            if (errorId === JsonElement.ErrorId.ElementIsNotDefined) {
                return new Ok(undefined); // The was no definition saved
            } else {
                return JsonElementErr.create(getElementResult.error);
            }
        } else {
            const jsonElement = getElementResult.value;
            const createResult = DataSourceOrReferenceDefinition.tryCodedCreateFromJson(
                this._legacyTableRecordSourceDefinitionFactoryService,
                jsonElement,
            );

            if (createResult.isErr()) {
                return createResult.createOuter(ErrorCode.DataSourceFrame_JsonDefinitionIsInvalid)
            } else {
                return createResult;
            }
        }
    }

    tryCreateLayoutDefinitionFromJson(frameElement: JsonElement | undefined): Result<RevColumnLayoutOrReferenceDefinition | undefined> {
        if (frameElement === undefined) {
            return new Ok(undefined); // missing
        } else {
            const layoutElementResult = frameElement.tryGetElement(GridSourceFrame.JsonName.layout);
            if (layoutElementResult.isErr()) {
                return new Ok(undefined); // most likely missing
            } else {
                return ColumnLayoutOrReferenceDefinition.tryCreateFromJson(layoutElementResult.value);
            }
        }
    }

    save(frameElement: JsonElement) {
        const definitionElement = frameElement.newElement(GridSourceFrame.JsonName.definition);
        const definition = this.createGridSourceOrReferenceDefinition();
        definition.saveToJson(definitionElement);
    }

    saveLayout(element: JsonElement) {
        const keptLayoutElement = element.newElement(GridSourceFrame.JsonName.layout);
        const layoutDefinition = this.createColumnLayoutOrReferenceDefinition();
        layoutDefinition.saveToJson(keptLayoutElement);
    }

    areRowsSelected(includeAllAuto: boolean) {
        return this.grid.areRowsSelected(includeAllAuto);
    }

    areColumnsSelected(includeAllAuto: boolean) {
        this.grid.areColumnsSelected(includeAllAuto);
    }

    async tryOpenJsonOrDefault(frameElement: JsonElement | undefined, keepView: boolean): Promise<Result<DataSourceOrReference>> {
        if (frameElement === undefined) {
            return this.tryOpenDefault(keepView);
        } else {
            const tryOpenJsonResult = await this.tryOpenJson(frameElement, keepView);
            if (tryOpenJsonResult.isErr()) {
                this._toastService.popup(`${Strings[StringId.ErrorOpeningSaved]}: ${tryOpenJsonResult.error}`);
                return this.tryOpenDefault(keepView);
            } else {
                const gridSourceOrReference = tryOpenJsonResult.value;
                if (gridSourceOrReference === undefined) {
                    // no definition was saved
                    return this.tryOpenDefault(keepView);
                } else {
                    return new Ok(gridSourceOrReference);
                }
            }
        }
    }

    tryOpenDefault(keepView: boolean): Promise<Result<DataSourceOrReference>> {
        const definition = this.getDefaultGridSourceOrReferenceDefinition();
        return this.tryOpenGridSource(definition, keepView);
    }

    tryOpenGridSource(definition: DataSourceOrReferenceDefinition, keepView: boolean): Promise<Result<DataSourceOrReference>> {
        // Replace with Promise.withResolvers when available in TypeScript (ES2023)
        let resolve: (value: Result<DataSourceOrReference>) => void;
        const resultPromise = new Promise<Result<DataSourceOrReference>>((res) => {
            resolve = res;
        });

        const openPromise = this._grid.tryOpenDataSource(definition, keepView);
        openPromise.then(
            (openResult) => {
                if (openResult.isErr()) {
                    const error = DataSourceOrReference.formatError(openResult.error);
                    const badness: Badness = {
                        reasonId: Badness.ReasonId.LockError,
                        reasonExtra: error,
                    };

                    this.setBadness(badness);
                    resolve(new Err(error));
                } else {
                    this._openedTableBadnessChangeSubscriptionId = this._grid.subscribeBadnessChangedEvent(
                        () => this.handleGridBadnessChangeEvent()
                    );
                    this.hideBadnessWithVisibleDelay(Badness.notBad);

                    resolve(new Ok(openResult.value));
                }
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'GSFTOGS41444'); }
        );

        return resultPromise;
    }

    closeGridSource(keepView: boolean) {
        if (this._openedTableBadnessChangeSubscriptionId !== undefined) {
            this._grid.unsubscribeBadnessChangedEvent(this._openedTableBadnessChangeSubscriptionId);
            this._openedTableBadnessChangeSubscriptionId = undefined;
        }
        this._grid.closeDataSource(keepView);
    }

    createGridSourceOrReferenceDefinition(): DataSourceOrReferenceDefinition {
        return this._grid.createDataSourceOrReferenceDefinition();
    }

    createColumnLayoutOrReferenceDefinition() {
        return this._grid.createColumnLayoutOrReferenceDefinition();
    }

    createTableRecordSourceDefinition(): TableRecordSourceDefinition {
        return this._grid.createTableRecordSourceDefinition();
    }

    createRowOrderDefinition() {
        return this._grid.getRowOrderDefinition();
    }

    tryOpenColumnLayoutOrReferenceDefinition(columnLayoutOrReferenceDefinition: RevColumnLayoutOrReferenceDefinition) {
        return this._grid.tryOpenColumnLayoutOrReferenceDefinition(columnLayoutOrReferenceDefinition);
    }

    applyColumnLayoutOrReferenceDefinition(definition: RevColumnLayoutOrReferenceDefinition) {
        this._grid.applyColumnLayoutOrReferenceDefinition(definition);
    }


    // loadLayoutConfig(element: JsonElement | undefined) {

    //     this._recordStore.beginChange();
    //     try {

    //         this.closeTable(false);

    //         if (element === undefined) {
    //             this.tryNewDefaultPrivateTable();
    //         } else {
    //             const tableElementResult = element.tryGetElement(GridSourceFrame.JsonName.table);
    //             if (tableElement === undefined) {
    //                 this.tryNewDefaultPrivateTable();
    //             } else {
    //                 const definition = TableDefinition.createFr
    //             }

    //             const privateElementResult = element.tryGetElement(GridSourceFrame.JsonName.privateTable);
    //             if (privateElement !== undefined) {
    //                 const id = nanoid(); // not sure if needed
    //                 this._table = this._tablesService.newTable(id, undefined, );
    //                 this.createPrivateTable();
    //                 if (this._table !== undefined) {
    //                     const success = this._table.loadFromJson(privateElement);
    //                     if (!success) {
    //                         this.closeTable(false);
    //                         this.tryNewDefaultPrivateTable();
    //                     } else {
    //                         this._privateNameSuffixId = privateElement.tryGetIntegerType(GridSourceFrame.JsonName.privateNameSuffixId);
    //                         if (this._privateNameSuffixId !== undefined) {
    //                             GridSourceFrame.addlayoutConfigLoadedNewPrivateNameSuffixId(this._privateNameSuffixId);
    //                         }
    //                         this.activate(-1);
    //                     }
    //                 }
    //             } else {
    //                 const loadedTableIdResult = element.tryGetGuid(
    //                     GridSourceFrame.JsonName.tableId,
    //                     'TableFrame.loadLayoutConfigId'
    //                 );
    //                 if (loadedTableId === undefined) {
    //                     this.tryNewDefaultPrivateTable();
    //                 } else {
    //                     const tableDirIdx = this._tablesService.indexOfId(loadedTableId);
    //                     if (tableDirIdx < 0) {
    //                         this.tryNewDefaultPrivateTable();
    //                     } else {
    //                         this._table = this._tablesService.lock(tableDirIdx, this);
    //                         this.activate(-1);
    //                     }
    //                 }
    //             }
    //         }

    //     } finally {
    //         this._recordStore.endChange();
    //     }
    // }

    // saveLayoutConfig(element: JsonElement) {
    //     if (this._table !== undefined) {
    //         if (!this.isPrivate()) {
    //             element.setGuid(GridSourceFrame.JsonName.tableId, this._table.id);
    //         } else {
    //             const layout = this._grid.saveLayout();
    //             this._table.layout = layout;
    //             const privateTableElement = element.newElement(GridSourceFrame.JsonName.privateTable);
    //             this._table.saveToJson(privateTableElement);
    //             element.setInteger(GridSourceFrame.JsonName.privateNameSuffixId, this._privateNameSuffixId);
    //         }
    //     }
    // }

    createRecordDefinition(index: Integer) {
        this._grid.createRecordDefinition(index);
    }

    // notifyTableOpen(recordDefinitionList: TableRecordDefinitionList) {
    //     if (this._table === undefined) {
    //         throw new AssertInternalError('TFNTO533955482');
    //     } else {
    //         this.hideBadnessWithVisibleDelay(this._table.badness);
    //     }
    //     if (this.tableOpenEvent !== undefined) {
    //         this.tableOpenEvent(recordDefinitionList);
    //     }
    // }

    // notifyTableOpenChange(opened: boolean) {
    // //     if (this.tableOpenChangeEvent !== undefined) {
    // //         this.tableOpenChangeEvent(opened);
    // //     }
    // }

    // notifyTableRecordsLoaded() {
    //     this._tableGridRecordStore.recordsLoaded();
    // }

    // notifyTableRecordsInserted(index: Integer, count: Integer) {
    //     this._tableGridRecordStore.recordsInserted(index, count);
    // }

    // notifyTableRecordsDeleted(index: Integer, count: Integer) {
    //     this._tableGridRecordStore.recordsDeleted(index, count);
    // }

    // notifyTableAllRecordsDeleted() {
    //     this._tableGridRecordStore.allRecordsDeleted();
    // }

    // notifyTableRecordListChange(listChangeTypeId: UsableListChangeTypeId, itemIdx: Integer, changeCount: Integer) {
    //     switch (listChangeTypeId) {
    //         case UsableListChangeTypeId.Unusable:
    //             // handled through badness change
    //             break;
    //         case UsableListChangeTypeId.PreUsableClear:
    //             this._tableGridRecordStore.allRecordsDeleted();
    //             break;
    //         case UsableListChangeTypeId.PreUsableAdd:
    //             if (this._table === undefined) {
    //                 throw new AssertInternalError('TFNTRLCA388590');
    //             } else {
    //                 // if (this._table.changeRecordDefinitionOrderAllowed) {
    //                     this._tableGridRecordStore.recordsInserted(itemIdx, changeCount);
    //                 // } else {
    //                 //     this._componentAccess.gridInsertRecordsInSameRowPosition(itemIdx, changeCount); // probably not required
    //                 // }
    //             }
    //             break;
    //         case UsableListChangeTypeId.Usable:
    //             // handled through badness change
    //             break;
    //         case UsableListChangeTypeId.Insert:
    //             if (this._table === undefined) {
    //                 throw new AssertInternalError('TFNTRLCI388590');
    //             } else {
    //                 // if (this._table.changeRecordDefinitionOrderAllowed) {
    //                     this._tableGridRecordStore.recordsInserted(itemIdx, changeCount);
    //                 // } else {
    //                 //     this._componentAccess.gridInsertRecordsInSameRowPosition(itemIdx, changeCount); // probably not required
    //                 // }
    //             }
    //             break;
    //         case UsableListChangeTypeId.Remove:
    //             this._tableGridRecordStore.recordsDeleted(itemIdx, changeCount);
    //             break;
    //         case UsableListChangeTypeId.Clear:
    //             this._tableGridRecordStore.allRecordsDeleted();
    //             break;
    //         default:
    //             throw new UnreachableCaseError('TFNTRLC2323597', listChangeTypeId);
    //     }
    // }

    // notifyTableRecordValuesChanged(recordIdx: Integer, invalidatedValues: RevRecordInvalidatedValue[]) {
    //     // TODO:MED There is a possible bug somewhere. This method is being called with a fieldIdx value greater
    //     // then the number of fields. The problem manifests when the table-frame is used via the PariDepth component.
    //     const fieldCount = this._table !== undefined ? this._grid.fieldCount : -1;
    //     if (recordIdx < this.recordCount) {
    //         this._recordStore.invalidateRecordValues(recordIdx, invalidatedValues);
    //     } else {
    //         throw new AssertInternalError('TFTFNTVC22944',
    //             `Record: "${recordIdx}", FieldCount: ${fieldCount}, RecordCount: ${this.recordCount}`);
    //     }
    // }

    // notifyTableRecordSequentialFieldValuesChanged(recordIdx: Integer, fieldIndex: number, fieldCount: number) {
    //     // TODO:MED There is a possible bug somewhere. This method is being called with a fieldIdx value greater
    //     // then the number of fields. The problem manifests when the table-frame is used via the PariDepth component.
    //     const tableFieldCount = this._table !== undefined ? this._table.fieldList.fieldCount : -1;
    //     if (fieldIndex + fieldCount <= tableFieldCount && recordIdx < this.recordCount) {
    //         this._recordStore.invalidateRecordFields(recordIdx, fieldIndex, fieldCount);
    //     } else {
    //         throw new AssertInternalError('TFTFNTVC22944',
    //             `Field: ${fieldIndex}, Record: "${recordIdx}", FieldCount: ${fieldCount}, RecordCount: ${this.recordCount}`);
    //     }
    // }

    // notifyTableRecordChanged(recordIdx: Integer) {
    //     // TODO:MED There is a possible bug somewhere. This method is being called with a fieldIdx value greater
    //     // then the number of fields. The problem manifests when the table-frame is used via the PariDepth component.
    //     const fieldCount = this._table !== undefined ? this._table.fieldList.fieldCount : -1;
    //     if (recordIdx < this.recordCount) {
    //         this._recordStore.invalidateRecord(recordIdx);
    //     } else {
    //         throw new AssertInternalError('TFTFNTRC4422944',
    //             `Record: "${recordIdx}", FieldCount: ${fieldCount}, RecordCount: ${this.recordCount}`);
    //     }
    // }

    // notifyTableLayoutUpdated() {
    //     if (this._table === undefined) {
    //         throw new AssertInternalError('TFTFNTLU48571');
    //     } else {
    //         this._grid.loadLayout(this._table.layout);
    //     }
    // }

    // notifyTableRecordDisplayOrderChanged(itemIndices: Integer[]) {
    //     this._grid.reorderRecRows(itemIndices);
    // }

    // notifyTableFirstPreUsable() {
    //     // this is not fully implemented
    //     if (this._autoSizeAllColumnWidthsOnFirstUsable) {
    //         this.checkAutoSizeAllColumnWidthsOnFirstUsable();
    //     }
    // }

    getFocusedRecordIndex() {
        return this._grid.focusedRecordIndex;
    }

    getOrderedGridRecIndices(): Integer[] {
        return this._grid.rowRecIndices;
    }

    // end IOpener members

    // getGridFields(): TableGridField[] {
    //     if (this._table === undefined) {
    //         throw new PulseError('WatchlistFrame.getGridFields: undefined watchlist');
    //     } else {
    //         return this._table.getGridFieldsAndInitialStates();
    //     }
    // }

    focusItem(itemIdx: Integer | undefined) {
        this._grid.focusedRecordIndex = itemIdx;
    }

    // clearRecordDefinitions() {
    //     if (this._table === undefined) {
    //         throw new AssertInternalError('TFCRD599995877');
    //     } else {
    //         if (this._table.addDeleteRecordDefinitionsAllowed) {
    //             this._table.clearRecordDefinitions();
    //         }
    //     }
    // }

    // canAddRecordDefinition(definition: TableRecordDefinition): boolean {
    //     if (this._table === undefined) {
    //         return false;
    //     } else {
    //         return this._table.canAddRecordDefinition(definition);
    //     }
    // }

    // addRecordDefinition(definition: TableRecordDefinition) {
    //     if (this._table === undefined) {
    //         Logger.assertError('addItemDefinition undefined');
    //     } else {
    //         if (this._table.addDeleteRecordDefinitionsAllowed) {
    //             this._table.addRecordDefinition(definition);
    //         }
    //     }
    // }

    // setRecordDefinition(idx: Integer, value: TableRecordDefinition) {
    //     if (this._table === undefined) {
    //         Logger.assertError('setRecordDefinition undefined');
    //     } else {
    //         if (this._table.addDeleteRecordDefinitionsAllowed) {
    //             this._table.setRecordDefinition(idx, value);
    //         }
    //     }
    // }

    // deleteFocusedRecord() {
    //     const itemIdx = this._grid.focusedRecordIndex;
    //     if (itemIdx !== undefined && itemIdx >= 0 && this._table !== undefined) {
    //         this._recordStore.beginChange();
    //         try {
    //             this._table.userRemoveAt(itemIdx, 1);
    //         } finally {
    //             this._recordStore.endChange();
    //         }
    //     }
    // }

    // canDeleteFocusedRecord() {
    //     return this._table !== undefined &&
    //         this._table.addDeleteRecordDefinitionsAllowed &&
    //         this._grid.focusedRecordIndex !== undefined;
    // }

    // newPrivateTable(tableDefinition: TableDefinition, keepCurrentLayout: boolean) {

    //     this._recordStore.beginChange();
    //     try {
    //         if (this.table !== undefined) {
    //             this.closeTable(keepCurrentLayout);
    //         }

    //         this.createPrivateTable();

    //         if (this.table !== undefined) {
    //             this.table.setDefinition(tableDefinition);
    //             const { name, suffixId } = this.calculateNewPrivateName();
    //             this.table.setName(name);
    //             this._privateNameSuffixId = suffixId;

    //             if (this._keptLayout !== undefined) {
    //                 this.table.layout = this._keptLayout;
    //             } else {
    //                 this.table.layout = this.table.createDefaultLayout();
    //             }

    //             // this.table.newPrivateRecordDefinitionList();
    //             this.activate(-1);

    //             if (!keepCurrentLayout) {
    //                 this.checkAutoSizeAllColumnWidthsOnFirstUsable();
    //             }
    //         }
    //     } finally {
    //         this._recordStore.endChange();
    //     }
    // }

    // openTableById(id: Guid): boolean {
    //     const idx = this._tablesService.indexOfId(id);

    //     if (idx < 0) {
    //         return false;
    //     } else {
    //         this.openTable(idx);
    //         return true;
    //     }
    // }

    // openTable(recordSourceDefinition: TableRecordSourceDefinition) {
    //     this._recordStore.beginChange();
    //     try {
    //         // this.closeTable(false);
    //         this.closeTable();
    //         const recordSource = this._tableRecordSourceFactoryService.createFromDefinition(recordSourceDefinition);
    //         const table = new Table(recordSource);
    //         this._recordStore.setTable(table);
    //         table.open(this._opener);
    //         //     this._table = this._tablesService.lock(idx, this);
    //         // this.activate(idx);
    //     } finally {
    //         this._recordStore.endChange();
    //     }
    // }

    // openRecordDefinitionList(id: Guid, keepCurrentLayout: boolean) {
    //     let layout: RevColumnLayout | undefined;
    //     if (!keepCurrentLayout) {
    //         layout = undefined;
    //     } else {
    //         layout = this.getColumnLayout();
    //     }

    //     this.openRecordDefinitionListWithLayout(id, layout, !keepCurrentLayout);
    // }

    // openRecordDefinitionListWithLayout(id: Guid, layout: RevColumnLayout | undefined,
    //     autoSizeAllColumnWidthsRequired: boolean) {
    //     if (this._table === undefined) {
    //         throw new UnexpectedUndefinedError('TFORDLWL031195');
    //     } else {
    //         this._recordStore.beginChange();
    //         try {
    //             this.closeTable(false);

    //             this.createPrivateTable();
    //             const tableDefinition = this._tablesService.definitionFactory.createFromTableRecordDefinitionListDirectoryId(
    //                 id, this._table
    //             );
    //             this._table.setDefinition(tableDefinition);

    //             if (layout !== undefined) {
    //                 this._table.layout = layout; // .createCopy();`
    //                 // todo
    //             } else {
    //                 this._table.layout = this._table.createDefaultLayout();
    //                 autoSizeAllColumnWidthsRequired = true;
    //             }

    //             // this._table.lockRecordDefinitionListById(id);
    //             this._table.setNameFromRecordDefinitionList();
    //             this.activate(-1);
    //             if (autoSizeAllColumnWidthsRequired) {
    //                 this.checkAutoSizeAllColumnWidthsOnFirstUsable();
    //             }

    //         } finally {
    //             this._recordStore.endChange();
    //         }
    //     }
    // }

    // openNullItemDefinitionList(keepCurrentLayout: boolean) {
    //     const id = this._tableRecordDefinitionListsService.nullListId;
    //     this.openRecordDefinitionList(id, keepCurrentLayout);
    // }

    /*saveAsTable(saveAsExistingIdx: Integer | undefined, saveAsName: string | undefined, openSaved: boolean): Integer {
        if (this._table === undefined) {
            throw new PulseError('WatchlistFrame.saveAsWatchlist: watchlist undefined');
        } else {
            let result: Integer;
            let targetTable: Table;

            if (saveAsExistingIdx !== undefined && saveAsExistingIdx >= 0) {
                result = saveAsExistingIdx;
                targetTable = this._tablesService.getTable(result);
            } else {
                if (saveAsName !== undefined && saveAsName !== '') {
                    result = this._tablesService.add();
                    targetTable = this._tablesService.getTable(result);
                    targetTable.loadFromDefault(this._standardFieldListId);
                    targetTable.name = saveAsName;
                } else {
                    throw new PulseError('WatchlistFrame.saveAsWatchlist: Index or name not specified');
                }
            }

            if (targetTable !== this._table) {
                this.saveLayout(this._table.layout);
                targetTable.assign(this._table);
            }

            if (openSaved) {
                this.openTable(result);
            }

            return result;
        }
    }*/

    /*saveAsPortfolioWatchItemDefinitionList(saveAsExistingIdx: Integer | undefined, saveAsName: string | undefined): Integer {
        if (this._table === undefined) {
            throw new PulseError('WatchlistFrame.saveAsPortfolioWatchItemDefinitionList: watchlist undefined');
        } else {
            let result: Integer;

            if (saveAsExistingIdx !== undefined && saveAsExistingIdx >= 0) {
                result = saveAsExistingIdx;
            } else {
                if (saveAsName === undefined || saveAsName === '') {
                    throw new PulseError('WatchlistFrame.saveAsPortfolioWatchItemDefinitionList: Index or name not specified');
                } else {
                    result = this._tableRecordDefinitionListsService.addNoIdUserList(
                        saveAsName, TableRecordDefinitionList.ListTypeId.Portfolio
                    );
                    if (result < 0) {
                        throw new PulseError('WatchlistFrame.saveAsPortfolioWatchItemDefinitionList: User list not created');
                    }
                }
            }

            if (result >= 0) {
                const userDefinitions = PortfolioTableRecordDefinitionList.createFromRecordDefinitionList(this._table.recordDefinitionList);
                const targetSymbolList = this._tableRecordDefinitionListsService.getList(result) as PortfolioTableRecordDefinitionList;
                targetSymbolList.clear();
                targetSymbolList.addArray(userDefinitions.AsArray);
                targetSymbolList.missing = true;

                this.openItemDefinitionList(result, true);
            }

            return result;
        }
    }

    saveAsGroupWatchItemDefinitionList(saveAsExistingIdx: Integer | undefined, saveAsName: string | undefined): Integer {
        if (this._table === undefined) {
            throw new PulseError('WatchlistFrame.saveAsGroupWatchItemDefinitionList: watchlist undefined');
        } else {
            let result: Integer;

            if (saveAsExistingIdx !== undefined && saveAsExistingIdx >= 0) {
                result = saveAsExistingIdx;
            } else {
                if (saveAsName === undefined || saveAsName === '') {
                    throw new PulseError('WatchlistFrame.saveAsGroupWatchItemDefinitionList: Index or name not specified');
                } else {
                    result = this._tableRecordDefinitionListsService.addNoIdUserList(
                        saveAsName, TableRecordDefinitionList.ListTypeId.Group
                    );
                    if (result < 0) {
                        throw new PulseError('WatchlistFrame.saveAsGroupWatchItemDefinitionList: User list not created');
                    }
                }
            }

            if (result >= 0) {
                const userDefinitions = GroupTableRecordDefinitionList.createFromRecordDefinitionList(this._table.recordDefinitionList);
                const targetSymbolList = this._tableRecordDefinitionListsService.getList(result) as GroupTableRecordDefinitionList;
                targetSymbolList.clear();
                targetSymbolList.addArray(userDefinitions.AsArray);
                targetSymbolList.missing = true;

                this.openItemDefinitionList(result, true);
            }

            return result;
        }
    }

    saveAsPrivate(name: string, convertItemDefinitionListToPrivateUser: boolean) {
        if (this._table === undefined) {
            throw new PulseError('WatchlistFrame.saveAsPrivate: watchlist undefined');
        } else if (this.componentAccess) {
            this.componentAccess.gridBeginChange();
            try {
                if (convertItemDefinitionListToPrivateUser
                    &&
                    (!this._table.hasPortfolioRecordDefinitionList() || !this._table.hasPrivateRecordDefinitionList())) {
                    this._table.convertToPrivateUserRecordDefinitionList();
                }

                if (!this.isPrivate()) {
                    assert(this.privateTable === undefined && this.table !== undefined);
                    const newList = new OpenedTable(this.settings, this.adi, this);
                    newList.loadFromDefault(this._standardFieldListId);
                    newList.assign(this._table);

                    this.closeTable();

                    this.privateTable = newList;
                    this._table = newList;
                }

                this._table.name = name;

                this.activate(-1);
            } finally {
                this.componentAccess.gridEndChange();
            }
            this.notifyListChanged();
        }
    }*/

    autoSizeAllColumnWidths(widenOnly: boolean) {
        this._grid.autoSizeActiveColumnWidths(widenOnly);
    }

    // loadDefaultLayout() {
    //     if (this._table !== undefined) {
    //         this.setColumnLayout(this._table.createDefaultLayout());
    //     }
    // }

    canCreateAllowedSourcedFieldsColumnLayoutDefinition() {
        return this._grid.canCreateAllowedSourcedFieldsColumnLayoutDefinition();
    }

    createAllowedSourcedFieldsColumnLayoutDefinition() {
        return this._grid.createAllowedSourcedFieldsColumnLayoutDefinition();
    }

    // getColumnLayout(): RevColumnLayout {
    //     return this._grid.saveLayout();
    // }

    // getColumnLayoutWithHeadersMap(): ColumnLayoutRecordStore.LayoutWithHeadersMap {
    //     return this._grid.getLayoutWithHeadersMap();
    // }

    // gridLoadLayout(layout: RevColumnLayout) {
    //     this._grid.loadLayout(layout);
    // }

    // isPrivate(): boolean {
    //     return this._privateTable !== undefined;
    // }

    // hasPrivateRecordDefinitionList(): boolean {
    //     return this._table !== undefined && this._table.hasPrivateRecordDefinitionList();
    // }

    clearFilter(): void {
        this._grid.applyFilter(undefined);
    }

    applyFilter(filter?: RevRecordDataServer.RecordFilterCallback): void {
        this._grid.applyFilter(filter);
    }

    selectAllRows() {
        this._grid.selectAllRows();
    }

    getSelectedRecordIndices() {
        const selection = this.grid.selection
        const rowIndices = selection.getRowIndices(true);
        const count = rowIndices.length;
        const recordIndices = new Array<Integer>(count);
        for (let i = 0; i < count; i++) {
            const rowIndex = rowIndices[i];
            recordIndices[i] = this.grid.rowToRecordIndex(rowIndex);
        }
        return recordIndices;
    }

    protected createGrid(
        hostElement: HTMLElement,
        customGridSettings: SourcedFieldGrid.CustomGridSettings,
        customiseSettingsForNewColumnEventer: SourcedFieldGrid.CustomiseSettingsForNewColumnEventer,
        getMainCellPainterEventer: RevSubgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
        getHeaderCellPainterEventer: RevSubgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
    ) {
        const grid = new TableGrid(
            this._referenceableColumnLayoutsService,
            this._tableFieldSourceDefinitionCachingFactory,
            this._legacyTableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactory,
            this._referenceableGridSourcesService,
            this._settingsService,
            hostElement,
            customGridSettings,
            customiseSettingsForNewColumnEventer,
            getMainCellPainterEventer,
            getHeaderCellPainterEventer,
            this,
        );
        this._grid = grid;

        grid.openedEventer = () => this.processGridSourceOpenedEvent();
        grid.columnLayoutSetEventer = (layout) => {
            if (this.columnLayoutSetEventer !== undefined) {
                this.columnLayoutSetEventer(layout);
            }
        }
        grid.recordFocusedEventer = (newRecordIndex, oldRecordIndex) => this.processRecordFocusedEvent(newRecordIndex, oldRecordIndex);
        grid.mainClickEventer = (fieldIndex, recordIndex) => this.processGridClickEvent(fieldIndex, recordIndex);
        grid.mainDblClickEventer = (fieldIndex, recordIndex) => this.processGridDblClickEvent(fieldIndex, recordIndex);

        this._settingsChangedSubscriptionId =
            this._settingsService.subscribeSettingsChangedEvent(() => this.applySettings());

        return grid;
    }

    protected processGridSourceOpenedEvent() {
        // can be overridden by descendants
    }

    protected processRecordFocusedEvent(newRecordIndex: Integer | undefined, oldRecordIndex: Integer | undefined) {
        // can be overridden by descendants
    }

    protected processGridClickEvent(fieldIndex: Integer, recordIndex: Integer) {
        // can be overridden by descendants
    }

    protected processGridDblClickEvent(fieldIndex: Integer, recordIndex: Integer) {
        // can be overridden by descendants
    }

    protected applySettings() {
        this._grid.clearRendering();
    }

    private handleGridBadnessChangeEvent() {
        const badness = this._grid.badness;
        this.setBadness(badness);
    }

    private tryOpenJson(frameElement: JsonElement, keepView: boolean): Promise<Result<DataSourceOrReference | undefined>> {
        const definitionResult = this.tryCreateDefinitionFromJson(frameElement);
        if (definitionResult.isErr()) {
            return Promise.resolve(definitionResult.createType());
        } else {
            const definitionWithLayoutError = definitionResult.value;
            if (definitionWithLayoutError === undefined) {
                return Promise.resolve(new Ok(undefined)); // no definition saved
            } else {
                const layoutErrorCode = definitionWithLayoutError.layoutErrorCode;
                if (layoutErrorCode !== undefined) {
                    this._toastService.popup(`${Strings[StringId.ErrorLoadingColumnLayout]}: ${layoutErrorCode}`);
                }
                return this.tryOpenGridSource(definitionWithLayoutError.definition, keepView);
            }
        }
    }

    // private closeTable() {
    //     if (this._table !== undefined) {
    //         if (keepCurrentLayout) {
    //             this._keptLayout = this.getColumnLayout();
    //         } else {
    //             this._keptLayout = undefined;
    //         }

    //         this._tablesService.closeItem(this._table, this);

    //         this._privateNameSuffixId = undefined;
    //         this._table = undefined;
    //     }
    // }

    // private createTable() {

    // }

    // private processFirstUsable() {
    //     this._grid.setValuesBeenUsable(true);
    //     if (this._table !== undefined) {
    //         if (!this._table.beenUsable) {
    //             this._autoSizeAllColumnWidthsOnFirstUsable = true;
    //         } else {
    //             this._autoSizeAllColumnWidthsOnFirstUsable = false;
    //             // FGridDrawer.ApplyAppOptions;  // need to have font set to correctly calculate widths // todo
    //             this.autoSizeAllColumnWidths();
    //         }
    //     }
    // }

    // private createPrivateTable() {
    //     assert(this._privateTable === undefined && this.table === undefined);
    //     this._privateTable = new OpenedTable(this._tablesService.definitionFactory, this);
    //     this._table = this._privateTable;
    // }

    // private calculateNewPrivateName(): GridSourceFrame.NewPrivateName {
    //     const suffixId = GridSourceFrame.getNextNewPrivateNameSuffixId();
    //     const name = Strings[StringId.New] + suffixId.toString(10);
    //     return {
    //         name,
    //         suffixId,
    //     };
    // }

    // private prepareGrid() {
    //     if (this._table === undefined) {
    //         throw new UnexpectedUndefinedError('TFPG448443');
    //     } else {
    //         if (this._gridPrepared) {
    //             this._grid.reset();
    //         }

    //         const fieldsAndInitialStates = this._table.getGridFieldsAndInitialStates();
    //         this._recordStore.addFields(fieldsAndInitialStates.fields);

    //         const states = fieldsAndInitialStates.states;
    //         const fieldCount = states.length; // one state for each field
    //         for (let i = 0; i < fieldCount; i++) {
    //             this._grid.setFieldState(fieldsAndInitialStates.fields[i], states[i]);
    //         }
    //         this._grid.loadLayout(this._table.layout);
    //         this.updateGridSettingsFromTable();
    //         this._recordStore.recordsLoaded();

    //         this._gridPrepared = true;
    //     }
    // }

    // private activate(tableDirIdx: Integer) {
    //     if (this._table === undefined) {
    //         throw new UnexpectedUndefinedError('TFA5592245');
    //     } else {
    //         this._recordStore.beginChange();
    //         try {
    //             this.prepareGrid();
    //             if (this.isPrivate()) {
    //                 this._table.open();
    //             } else {
    //                 assert(tableDirIdx >= 0);
    //                 this._tablesService.open(tableDirIdx, this);
    //             }

    //             // this.prepareDeleteListAction();

    //         } finally {
    //             this._recordStore.endChange();
    //         }
    //     }
    // }

    // private updateGridSettingsFromTable() {
    //     if (this._table === undefined || !this._table.changeRecordDefinitionOrderAllowed) {
    //         // Grid.ClickSort = false;
    //     } else {
    //         // Grid.ClickSort = true;
    //     }
    // }

    // private prepareDeleteListAction() {
    //     const canDeleteListResult = this.canDeleteList();
    //     this.notifyDeleteListActionPrepared(canDeleteListResult.deletable, canDeleteListResult.actionHint);
    // }

    // private canDeleteList(): GridSourceFrame.CanDeleteListResult {
    //     if (this._table === undefined) {
    //         return {
    //             deletable: false,
    //             isRecordDefinitionList: false,
    //             listName: '',
    //             actionHint: Strings[StringId.NoTable]
    //         };
    //     } else {
    //         if (!this.isPrivate()) {
    //             const listName = this._table.name;
    //             const deletable = this._tablesService.isTableLocked(this._table, this);
    //             let actionHint: string;
    //             if (deletable) {
    //                 actionHint = Strings[StringId.DeleteWatchlist] + ' "' + listName + '"';
    //             } else {
    //                 actionHint = Strings[StringId.CannotDeleteWatchlist] + ' "' + listName + '"';
    //             }
    //             return {
    //                 deletable,
    //                 isRecordDefinitionList: false,
    //                 listName,
    //                 actionHint
    //             };
    //         } else {
    //             if (this._table.hasPrivateRecordDefinitionList()) {
    //                 return {
    //                     deletable: false,
    //                     isRecordDefinitionList: false,
    //                     listName: '',
    //                     actionHint: Strings[StringId.CannotDeletePrivateList]
    //                 };
    //             } else {
    //                 const recordDefinitionList = this._table.recordDefinitionList;
    //                 const listName = recordDefinitionList.name;
    //                 let actionHint: string;
    //                 let deletable: boolean;
    //                 if (recordDefinitionList.builtIn) {
    //                     deletable = false;
    //                     actionHint = Strings[StringId.CannotDeleteBuiltinList];
    //                 } else {
    //                     deletable = !this._tableRecordDefinitionListsService.isItemLocked(recordDefinitionList, this._table);
    //                     if (deletable) {
    //                         actionHint = Strings[StringId.DeleteList] + ' :' + listName;
    //                     } else {
    //                         actionHint = Strings[StringId.CannotDeleteList] + ' :' + listName;
    //                     }
    //                 }

    //                 return {
    //                     deletable,
    //                     isRecordDefinitionList: true,
    //                     listName,
    //                     actionHint
    //                 };
    //             }
    //         }
    //     }
    // }

    // private deleteList() {
    //     if (this._table !== undefined) {
    //         const canDeleteListResult = this.canDeleteList();
    //         if (canDeleteListResult.deletable) {
    //             if (!canDeleteListResult.isRecordDefinitionList) {
    //                 const idx = this._table.index;
    //                 if (idx < 0) {
    //                     throw new AssertInternalError('TFDLNID259', `${this._table.name}`);
    //                 } else {
    //                     this.closeTable(false);
    //                     if (this._tablesService.isItemAtIndexLocked(idx, undefined)) {
    //                         throw new AssertInternalError('TFDLDIS288', `${idx}`);
    //                     } else {
    //                         this._tablesService.delete(idx);
    //                     }
    //                 }
    //             } else {
    //                 const idx = this._table.recordDefinitionList.index;
    //                 if (idx < 0) {
    //                     throw new AssertInternalError('TFDLRNID897', `${this._table.recordDefinitionList.name}`);
    //                 } else {
    //                     this.closeTable(false);
    //                     if (this._tableRecordDefinitionListsService.isItemAtIndexLocked(idx, undefined)) {
    //                         throw new AssertInternalError('TFDLDISR211', `${idx}`);
    //                     } else {
    //                         this._tableRecordDefinitionListsService.deleteItemAtIndex(idx);
    //                     }
    //                 }
    //             }

    //             // this.newPrivatePortfolioItemDefinitionList(false); // this should be done elsewhere
    //         }
    //     }
    // }

    // private tryNewDefaultPrivateTable() {
    //     if (this.requireDefaultTableDefinitionEvent === undefined) {
    //         // do nothing - will remain closed
    //     } else {
    //         const tableDefinition = this.requireDefaultTableDefinitionEvent();
    //         if (tableDefinition !== undefined) {

    //             this.newPrivateTable( tableDefinition, false);
    //         }
    //     }
    // }

    protected abstract createGridAndCellPainters(gridHost: HTMLElement): TableGrid;
    protected abstract getDefaultGridSourceOrReferenceDefinition(): DataSourceOrReferenceDefinition;

    protected abstract setBadness(value: Badness): void;
    protected abstract hideBadnessWithVisibleDelay(badness: Badness): void;
}

export namespace GridSourceFrame {
    export type SettingsApplyEventer = (this: void) => void;
    export type GetDefaultGridSourceOrReferenceDefinitionEventer = (this: void) => DataSourceOrReferenceDefinition;
    export type ColumnLayoutSetEventer = (this: void, layout: RevColumnLayout) => void;
    // export type RequireDefaultTableDefinitionEvent = (this: void) => TableDefinition | undefined;
    // export type TableOpenEvent = (this: void, recordDefinitionList: TableRecordDefinitionList) => void;
    // export type TableOpenChangeEvent = (this: void, opened: boolean) => void;

    export type ListChangedEvent = (this: void) => void;
    export type LayoutChangedEvent = (this: void) => void;
    export type FocusedCellChangeEvent = (this: void, newFieldIdx: Integer, oldFieldIdx: Integer,
        newRecIdx: Integer, oldRecIdx: Integer, uiEvent: boolean) => void;
    export type GridKeyUpDownMessageEvent = (this: void) => void; // todo
    export type GridEnterEvent = (this: void) => void;
    export type GridExitEvent = (this: void) => void;
    export type DeleteListActionPreparedEvent = (this: void, deletable: boolean, actionHint: string) => void;

    export type FirstUsableEventer = (this: void) => void;

    export namespace JsonName {
        export const definition = 'definition';
        export const layout = 'layout';
        export const table = 'table';
        export const tableId = 'tableId';
        export const privateTable = 'privateTable';
        export const privateNameSuffixId = 'privateNameSuffixId';
    }

    export interface ComponentAccess {
        readonly gridHost: HTMLElement;
    }

    export interface Description {
        name: string;
        abbreviate: string;
        full: string;
    }

    export interface CanDeleteListResult {
        deletable: boolean;
        isRecordDefinitionList: boolean;
        listName: string;
        actionHint: string;
    }

    export type PrivateNameSuffixId = Integer;
    export interface NewPrivateName {
        name: string;
        suffixId: PrivateNameSuffixId;
    }

    let nextNewPrivateNameSuffixId: PrivateNameSuffixId = 0;
    const layoutConfigLoadedNewPrivateNameSuffixIds: PrivateNameSuffixId[] = [];
    export function addlayoutConfigLoadedNewPrivateNameSuffixId(value: PrivateNameSuffixId) {
        layoutConfigLoadedNewPrivateNameSuffixIds.push(value);
    }
    export function getNextNewPrivateNameSuffixId() {
        let existsInLayoutConfigLoaded: boolean;
        do {
            nextNewPrivateNameSuffixId++;
            existsInLayoutConfigLoaded = layoutConfigLoadedNewPrivateNameSuffixIds.includes(nextNewPrivateNameSuffixId);
        } while (existsInLayoutConfigLoaded);
        return nextNewPrivateNameSuffixId;
    }
}
