import { AssertInternalError, Integer, JsonElement, Result } from '@pbkware/js-utils';
import {
    AdiService,
    CommandRegisterService,
    DataIvemId,
    DataSourceOrReference,
    DataSourceOrReferenceDefinition,
    MarketsService,
    RankedDataIvemIdList,
    SettingsService,
    StringId,
    Strings,
    SymbolsService,
    TextFormatterService
} from '@plxtra/motif-core';
import { ToastService } from 'component-services-internal-api';
import {
    GridSourceFrame,
    WatchlistFrame
} from 'content-internal-api';
import { RevColumnLayout, RevColumnLayoutOrReferenceDefinition, RevDataSourceOrReferenceDefinition, RevFavouriteReferenceableColumnLayoutDefinitionsStore } from 'revgrid';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class WatchlistDitemFrame extends BuiltinDitemFrame {
    defaultDataIvemIds: readonly DataIvemId[] | undefined;

    private _watchlistFrame: WatchlistFrame | undefined;

    private _dataIvemIdApplying = false;
    private _currentFocusedDataIvemIdSetting = false;

    constructor(
        componentAccess: DitemFrame.ComponentAccess,
        settingsService: SettingsService,
        marketsService: MarketsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
        private readonly _textFormatterService: TextFormatterService,
        private readonly _favouriteNamedColumnLayoutDefinitionReferencesService: RevFavouriteReferenceableColumnLayoutDefinitionsStore,
        private readonly _toastService: ToastService,
        private readonly _gridSourceOpenedEventer: WatchlistDitemFrame.GridSourceOpenedEventer,
        private readonly _recordFocusedEventer: WatchlistDitemFrame.RecordFocusedEventer,
        private readonly _columnLayoutSetEventer: WatchlistDitemFrame.ColumnLayoutSetEventer,
        private readonly _dataIvemIdAcceptedEventer: WatchlistDitemFrame.DataIvemIdAcceptedEventer,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Watchlist, componentAccess,
            settingsService, marketsService, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    get initialised() { return this._watchlistFrame !== undefined; }
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    get recordFocused() { return this._watchlistFrame !== undefined && this._watchlistFrame.recordFocused; }

    initialise(
        ditemFrameElement: JsonElement | undefined,
        watchlistFrame: WatchlistFrame,
    ): void {
        this._watchlistFrame = watchlistFrame;
        watchlistFrame.gridSourceOpenedEventer = this._gridSourceOpenedEventer;
        watchlistFrame.columnLayoutSetEventer = this._columnLayoutSetEventer;
        watchlistFrame.gridSourceOpenedEventer = (rankedDataIvemIdList, rankedDataIvemIdListName) =>
            this.handleGridSourceOpenedEvent(rankedDataIvemIdList, rankedDataIvemIdListName);
        watchlistFrame.recordFocusedEventer = (newRecordIndex) => this.handleRecordFocusedEvent(newRecordIndex);
        watchlistFrame.saveRequiredEventer = () => this.flagSaveRequired();

        watchlistFrame.initialise(this.opener, undefined, false);

        let watchlistFrameElement: JsonElement | undefined;
        if (ditemFrameElement !== undefined) {
            const getElementResult = ditemFrameElement.tryGetElement(WatchlistDitemFrame.JsonName.watchlistFrame);
            if (getElementResult.isOk()) {
                watchlistFrameElement = getElementResult.value;
            }
        }

        // const openPromise = watchlistFrame.tryOpenJsonOrDefault(watchlistFrameElement, true)
        // openPromise.then(
        //     (openResult) => {
        //         if (openResult.isErr()) {
        //             this._toastService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.Watchlist]}: ${openResult.error}`);
        //         } else {
        //             this.applyLinked();
        //         }
        //     },
        //     (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'SDFIPR50135') }
        // );

        let dataSourceOrReferenceDefinition: DataSourceOrReferenceDefinition | undefined;
        if (ditemFrameElement !== undefined) {
            const watchlistFrameElementResult = ditemFrameElement.tryGetElement(WatchlistDitemFrame.JsonName.watchlistFrame);
            if (watchlistFrameElementResult.isOk()) {
                watchlistFrameElement = watchlistFrameElementResult.value;
                const definitionWithLayoutErrornCreateResult = watchlistFrame.tryCreateDefinitionFromJson(watchlistFrameElement);
                if (definitionWithLayoutErrornCreateResult.isErr()) {
                    this._toastService.popup(`${Strings[StringId.ErrorOpeningSaved]} ${Strings[StringId.Watchlist]}: ${definitionWithLayoutErrornCreateResult.error}`);
                } else {
                    const definitionWithLayoutError = definitionWithLayoutErrornCreateResult.value;
                    if (definitionWithLayoutError !== undefined) {
                        const layoutErrorCode = definitionWithLayoutError.layoutErrorCode;
                        if (layoutErrorCode !== undefined) {
                            this._toastService.popup(`${Strings[StringId.ErrorLoadingColumnLayout]} ${Strings[StringId.Watchlist]}: ${layoutErrorCode}`);
                        }
                        dataSourceOrReferenceDefinition = definitionWithLayoutError.definition;
                    }
                }
            }
        }

        let openPromise: Promise<Result<DataSourceOrReference | undefined>>;
        if (dataSourceOrReferenceDefinition === undefined) {
            openPromise = watchlistFrame.tryOpenDataIvemIdArray(this.defaultDataIvemIds ?? [], false);
        } else {
            openPromise = watchlistFrame.tryOpenGridSource(dataSourceOrReferenceDefinition, false)
        }

        openPromise.then(
            (openResult) => {
                if (openResult.isErr()) {
                    this._toastService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.Watchlist]}: ${openResult.error}`);
                } else {
                    const gridSourceOrReference = openResult.value;
                    if (gridSourceOrReference === undefined) {
                        throw new AssertInternalError('WDFIPU50134');
                    } else {
                        this.applyLinked();
                    }
                }
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'WDFIPR50134') }
        );
    }

    override finalise() {
        if (this._watchlistFrame !== undefined) {
            this._watchlistFrame.finalise();
        }
        super.finalise();
    }

    override save(ditemFrameElement: JsonElement) {
        super.save(ditemFrameElement);

        if (this._watchlistFrame === undefined) {
            throw new AssertInternalError('WDFS10174');
        } else {
            const watchlistFrameElement = ditemFrameElement.newElement(WatchlistDitemFrame.JsonName.watchlistFrame);
            this._watchlistFrame.save(watchlistFrameElement);
        }
    }

    tryOpenGridSource(definition: DataSourceOrReferenceDefinition, keepView: boolean) {
        if (this._watchlistFrame === undefined) {
            throw new AssertInternalError('WDFTOGS10174');
        } else {
            const openPromise = this._watchlistFrame.tryOpenGridSource(definition, keepView);
            openPromise.then(
                (openResult) => {
                    if (openResult.isErr()) {
                        this._toastService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.Watchlist]}: ${openResult.error}`);
                    }
                },
                (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'WDFTOGS33391', definition.referenceId ?? '') }
            );
        }
    }

    saveGridSourceAs(as: RevDataSourceOrReferenceDefinition.SaveAsDefinition) {
        if (this._watchlistFrame === undefined) {
            throw new AssertInternalError('WDFSGSAU10174');
        } else {
            const promise = this._watchlistFrame.saveGridSourceAs(as);
            AssertInternalError.throwErrorIfPromiseRejected(promise, 'WDFSGSAS10174', this._watchlistFrame.opener.lockerName);
        }
    }

    tryOpenColumnLayoutOrReferenceDefinition(columnLayoutOrReferenceDefinition: RevColumnLayoutOrReferenceDefinition) {
        if (this._watchlistFrame === undefined) {
            throw new AssertInternalError('WDFOGLONRD10174');
        } else {
            return this._watchlistFrame.tryOpenColumnLayoutOrReferenceDefinition(columnLayoutOrReferenceDefinition);
        }
    }

    createAllowedSourcedFieldsColumnLayoutDefinition() {
        if (this._watchlistFrame === undefined) {
            throw new AssertInternalError('WDFCAFALD10174');
        } else {
            return this._watchlistFrame.createAllowedSourcedFieldsColumnLayoutDefinition();
        }
    }

    newEmpty(keepView: boolean) {
        if (this._watchlistFrame === undefined) {
            throw new AssertInternalError('WDFNE10174');
        } else {
            return this._watchlistFrame.tryOpenDataIvemIdArray([], keepView);
        }
    }

    newScan(scanId: string, keepView: boolean) {
        if (this._watchlistFrame === undefined) {
            throw new AssertInternalError('WDFNS10174');
        } else {
            return this._watchlistFrame.tryOpenScan(scanId, keepView);
        }
    }

    // saveAsPrivate() {
    //     const oldDataIvemIdList = this._dataIvemIdList;
    //     const count = oldDataIvemIdList.count;
    //     const rankedDataIvemIds = new Array<RankedDataIvemId>(count);
    //     for (let i = 0; i < count; i++) {
    //         rankedDataIvemIds[i] = oldDataIvemIdList.getAt(i);
    //     }

    //     rankedDataIvemIds.sort((left, right) => compareInteger(left.rank, right.rank));
    //     const newDataIvemIds = rankedDataIvemIds.map((rankedDataIvemId) => rankedDataIvemId.dataIvemId);

    //     const definition = this.createGridSourceOrReferenceDefinitionFromList(
    //         jsonRankedDataIvemIdListDefinition,
    //         this._gridSourceFrame.createLayoutOrReferenceDefinition(),
    //         this._gridSourceFrame.createRowOrderDefinition(),
    //     );

    //     this.tryOpenGridSource(definition, true);
    //     this.flagSaveRequired();
    // }

    // saveAsDataIvemIdList(listDefinition: DataIvemIdListDefinition) {
    //     const recordSourceDefinition = new DataIvemIdFromListTableRecordSourceDefinition(listDefinition);
    //     this._gridSourceFrame.saveAsRecordSourceDefinition(recordSourceDefinition);
    // }

    // saveAsGridSource(definition: DataSourceDefinition) {
    //     this._gridSourceFrame.saveAsGridSource(definition);
    // }

    autoSizeAllColumnWidths(widenOnly: boolean) {
        if (this._watchlistFrame === undefined) {
            throw new AssertInternalError('WDFASACW10174');
        } else {
            this._watchlistFrame.autoSizeAllColumnWidths(widenOnly);
        }
    }

    tryIncludeDataIvemIds(dataIvemIds: DataIvemId[], focusFirst: boolean) {
        if (dataIvemIds.length === 0) {
            return true;
        } else {
            if (this._currentFocusedDataIvemIdSetting) {
                return false;
            } else {
                this._dataIvemIdApplying = true;
                try {
                    if (this._watchlistFrame === undefined) {
                        throw new AssertInternalError('WDFTILII10174');
                    } else {
                        return this._watchlistFrame.addDataIvemIds(dataIvemIds, focusFirst);
                    }
                } finally {
                    this._dataIvemIdApplying = false;
                }
            }
        }
    }

    canDeleteRecord() {
        if (this._watchlistFrame === undefined) {
            throw new AssertInternalError('WDFCDR10174');
        } else {
            return this._watchlistFrame.userCanRemove;
        }
    }

    deleteFocusedRecord() {
        if (this._watchlistFrame === undefined) {
            throw new AssertInternalError('WDFDFR10174');
        } else {
            this._watchlistFrame.deleteFocusedRecord();
        }
    }


    protected override applyDataIvemId(dataIvemId: DataIvemId | undefined, selfInitiated: boolean): boolean { // override
        if (this._currentFocusedDataIvemIdSetting || dataIvemId === undefined) {
            return false;
        } else {
            let result: boolean;
            this._dataIvemIdApplying = true;
            try {
                if (this._watchlistFrame === undefined) {
                    throw new AssertInternalError('WDFALI10174');
                } else {
                    const focused = this._watchlistFrame.tryFocus(dataIvemId, selfInitiated);

                    if (focused) {
                        result = super.applyDataIvemId(dataIvemId, selfInitiated);
                    } else {
                        result = false;
                    }

                    if (result && selfInitiated) {
                        this.notifyDataIvemIdAccepted(dataIvemId);
                    }
                }
            } finally {
                this._dataIvemIdApplying = false;
            }

            return result;
        }
    }

    private handleGridSourceOpenedEvent(rankedDataIvemIdList: RankedDataIvemIdList, rankedDataIvemIdListName: string | undefined) {
        this.updateLockerName(rankedDataIvemIdListName ?? '');
        this._gridSourceOpenedEventer(rankedDataIvemIdList, rankedDataIvemIdListName);
    }

    private handleRecordFocusedEvent(newRecordIndex: Integer | undefined) {
        if (newRecordIndex !== undefined) {
            if (this._watchlistFrame === undefined) {
                throw new AssertInternalError('WDFHRFE10174');
            } else {
                const dataIvemId = this._watchlistFrame.getAt(newRecordIndex).dataIvemId;
                this.processDataIvemIdFocusChange(dataIvemId);
            }
        }
        this._recordFocusedEventer(newRecordIndex);
    }

    // private handleTableOpenEvent(recordDefinitionList: TableRecordDefinitionList) {
    //     this._recordDefinitionList = recordDefinitionList as PortfolioTableRecordDefinitionList;
    // }

    // private notifyNewTable(description: WatchlistDitemFrame.TableDescription) {
    //     this.loadGridSourceEvent(description);
    // }

    private notifyDataIvemIdAccepted(dataIvemId: DataIvemId) {
        this._dataIvemIdAcceptedEventer(dataIvemId);
    }

    private processDataIvemIdFocusChange(newFocusedDataIvemId: DataIvemId) {
        if (!this._dataIvemIdApplying) {
            this._currentFocusedDataIvemIdSetting = true;
            try {
                this.applyDitemDataIvemIdFocus(newFocusedDataIvemId, true);
            } finally {
                this._currentFocusedDataIvemIdSetting = false;
            }
        }
    }

    // private checkConfirmPrivateWatchListCanBeDiscarded(): boolean {
    //     if (this._watchlistFrame.isNamed || this._watchlistFrame.recordCount === 0) {
    //         return true;
    //     } else {
    //         return true;
    //         // todo
    //     }
    // }

    // private openRecordDefinitionList(listId: Guid, keepCurrentLayout: boolean) {
    //     const portfolioTableDefinition = this._tablesService.definitionFactory.createPortfolioFromId(listId);
    //     this._gridSourceFrame.newPrivateTable(portfolioTableDefinition, keepCurrentLayout);
    //     this.updateWatchlistDescription();
    // }
}

export namespace WatchlistDitemFrame {
    export type TableDescription = GridSourceFrame.Description;

    export namespace JsonName {
        export const watchlistFrame = 'watchlistFrame';
    }

    export type NotifySaveLayoutConfigEventHandler = (this: void) => void;
    export type GridSourceOpenedEventer = (
        this: void,
        rankedDataIvemIdList: RankedDataIvemIdList,
        rankedDataIvemIdListName: string | undefined
    ) => void;
    export type DataIvemIdAcceptedEventer = (this: void, dataIvemId: DataIvemId) => void;
    export type ColumnLayoutSetEventer = (this: void, layout: RevColumnLayout) => void;
    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;
}
