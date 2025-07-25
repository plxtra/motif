import { AssertInternalError, JsonElement } from '@pbkware/js-utils';
import {
    AdiService,
    AllowedGridField,
    AllowedSourcedFieldsColumnLayoutDefinition,
    BidAskAllowedSourcedFieldsColumnLayoutDefinitions,
    BidAskColumnLayoutDefinitions,
    BidAskPair,
    CommandRegisterService,
    DataIvemId,
    DataIvemIdArrayRankedDataIvemIdListDefinition,
    DepthStyleId,
    MarketsService,
    SettingsService,
    StringId,
    Strings,
    SymbolsService,
    TextFormatterService
} from '@plxtra/motif-core';
import { ToastService } from 'component-services-internal-api';
import {
    DepthFrame,
    TradesFrame,
    WatchlistFrame
} from 'content-internal-api';
import { RevColumnLayoutDefinition, RevColumnLayoutOrReferenceDefinition, revLowestValidServerNotificationId } from 'revgrid';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class DepthAndSalesDitemFrame extends BuiltinDitemFrame {
    private _watchlistFrame: WatchlistFrame;
    private _depthFrame: DepthFrame;
    private _tradesFrame: TradesFrame;

    // private _watchlistCommandProcessor: WatchlistCommandProcessor;
    // private _depthCommandProcessor: DepthCommandProcessor;
    // private _tradesCommandProcessor: TradesCommandProcessor;

    constructor(
        private _componentAccess: DepthAndSalesDitemFrame.ComponentAccess,
        settingsService: SettingsService,
        marketsService: MarketsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
        private readonly _textFormatterService: TextFormatterService,
        private readonly _toastService: ToastService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.DepthAndTrades, _componentAccess,
            settingsService, marketsService, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    get initialised() { return this._depthFrame !== undefined; }

    get filterActive() { return this._depthFrame.filterActive; }
    get filterXrefs() { return this._depthFrame.filterXrefs; }

    initialise(
        watchlistFrame: WatchlistFrame,
        depthFrame: DepthFrame,
        tradesFrame: TradesFrame,
        frameElement: JsonElement | undefined
    ): void {
        this._watchlistFrame = watchlistFrame;
        this._depthFrame = depthFrame;
        this._tradesFrame = tradesFrame;

        depthFrame.openedPopulatedAndRenderedEvent = (lastBidServerNotificationId, lastAskServerNotificationId) => {
            if (lastBidServerNotificationId >= revLowestValidServerNotificationId && lastAskServerNotificationId >= revLowestValidServerNotificationId) {
                this.checkAutoAdjustOpenWidths();
            }
        }

        let watchlistLayoutDefinition: RevColumnLayoutOrReferenceDefinition | undefined;
        if (frameElement === undefined) {
            watchlistFrame.initialise(this.opener, undefined, false);
            tradesFrame.initialise(undefined);
            depthFrame.initialise(undefined);
        } else {
            const watchlistElementResult = frameElement.tryGetElement(DepthAndSalesDitemFrame.JsonName.watchlist);
            if (watchlistElementResult.isOk()) {
                const watchlistElement = watchlistElementResult.value;
                const layoutDefinitionResult = this._watchlistFrame.tryCreateLayoutDefinitionFromJson(watchlistElement);
                if (layoutDefinitionResult.isErr()) {
                    this._toastService.popup(`${Strings[StringId.ErrorLoadingColumnLayout]} ${Strings[StringId.DepthAndSalesWatchlist]}: ${Strings[StringId.Watchlist]}: ${layoutDefinitionResult.error}`);
                } else {
                    watchlistLayoutDefinition = layoutDefinitionResult.value;
                }
            }

            const tradesElementResult = frameElement.tryGetElement(DepthAndSalesDitemFrame.JsonName.trades);
            if (tradesElementResult.isErr()) {
                this._toastService.popup(`${Strings[StringId.ErrorLoadingColumnLayout]} ${Strings[StringId.DepthAndSalesWatchlist]}: ${Strings[StringId.Trades]}: ${tradesElementResult.error}`);
                this._tradesFrame.initialise(undefined);
            } else {
                this._tradesFrame.initialise(tradesElementResult.value);
            }

            const depthElementResult = frameElement.tryGetElement(DepthAndSalesDitemFrame.JsonName.depth);
            if (depthElementResult.isErr()) {
                this._toastService.popup(`${Strings[StringId.ErrorLoadingColumnLayout]} ${Strings[StringId.DepthAndSalesWatchlist]}: ${Strings[StringId.Depth]}: ${depthElementResult.error}`);
                this._depthFrame.initialise(undefined);
            } else {
                this._depthFrame.initialise(depthElementResult.value);
            }
        }

        this._watchlistFrame.initialise(this.opener, watchlistLayoutDefinition, true);
        watchlistFrame.fixedRowCount = 1;
        watchlistFrame.focusedRowColoredAllowed = false;

        const watchlistOpenPromise = this._watchlistFrame.tryOpenDataIvemIdArray([], true);
        watchlistOpenPromise.then(
            (watchlistOpenResult) => {
                if (watchlistOpenResult.isErr()) {
                    this._toastService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.DepthAndSalesWatchlist]}: ${watchlistOpenResult.error}`);
                } else {
                    this.applyLinked();
                }
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'OADFIPR50137') }
        );
    }

    override save(element: JsonElement) {
        super.save(element);

        if (this._watchlistFrame.opened) {
            const watchlistElement = element.newElement(DepthAndSalesDitemFrame.JsonName.watchlist);
            this._watchlistFrame.saveLayout(watchlistElement);
        }

        if (this._depthFrame.opened) {
            const depthElement = element.newElement(DepthAndSalesDitemFrame.JsonName.depth);
            this._depthFrame.save(depthElement);
        }

        if (this._tradesFrame.opened) {
            const tradesElement = element.newElement(DepthAndSalesDitemFrame.JsonName.trades);
            this._tradesFrame.saveLayoutToConfig(tradesElement);
        }
    }

    open() {
        const dataIvemId = this.dataIvemId;
        if (dataIvemId === undefined) {
            this.close();
        } else {
            // watchlist
            if (!this._watchlistFrame.opened) {
                const dataIvemIdListDefinition = new DataIvemIdArrayRankedDataIvemIdListDefinition('', '', '', [dataIvemId]);
                const definition = this._watchlistFrame.createGridSourceOrReferenceDefinitionFromList(
                    dataIvemIdListDefinition,
                    undefined,
                    undefined
                );
                const watchlistOpenPromise = this._watchlistFrame.tryOpenGridSource(definition, false);
                watchlistOpenPromise.then(
                    (openResult) => {
                        if (openResult.isErr()) {
                            this._toastService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.DepthAndSalesWatchlist]}: ${openResult.error}`);
                        } else {
                            this._watchlistFrame.focusItem(0);
                        }
                    },
                    (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'DASDFO88552', dataIvemId.name)}
                );
            } else {
                if (this._watchlistFrame.recordCount === 0) {
                    this._watchlistFrame.addDataIvemIds([dataIvemId], true);
                } else {
                    this._watchlistFrame.userReplaceAt(0, [dataIvemId]);
                }
            }
            // depth
            this._depthFrame.open(dataIvemId, DepthStyleId.Full);
            // trades
            this._tradesFrame.open(dataIvemId, undefined);

            this._componentAccess.notifyOpenedClosed(dataIvemId, undefined);
        }
    }

    // getDepthRenderedActiveWidth() {
    //     return this._depthFrame.getRenderedActiveWidth();
    // }

    // getTradesRenderedActiveWidth() {
    //     return this._tradesFrame.getRenderedActiveWidth();
    // }

    toggleFilterActive() {
        this._depthFrame.toggleFilterActive();
    }

    setFilter(xrefs: string[]) {
        this._depthFrame.setFilter(xrefs);
    }

    expand(newRecordsOnly: boolean) {
        this._depthFrame.openExpand = true;
        this._depthFrame.expand(newRecordsOnly);
    }

    rollUp(newRecordsOnly: boolean) {
        this._depthFrame.openExpand = false;
        this._depthFrame.rollup(newRecordsOnly);
    }

    historicalTradesDateCommit() {
        this.openTrades();
    }

    autoSizeAllColumnWidths(widenOnly: boolean) {
        this._watchlistFrame.autoSizeAllColumnWidths(widenOnly);
        this._depthFrame.autoSizeAllColumnWidths(widenOnly);
        this._tradesFrame.autoSizeAllColumnWidths(widenOnly );
    }

    canCreateAllowedSourcedFieldsColumnLayoutDefinition() {
        return (
            this._watchlistFrame.canCreateAllowedSourcedFieldsColumnLayoutDefinition() &&
            this._depthFrame.canCreateAllowedSourcedFieldsColumnLayoutDefinition()
        );
    }

    createAllowedFieldsAndLayoutDefinition(): DepthAndSalesDitemFrame.AllowedFieldsAndLayoutDefinitions {
        return {
            depth: this._depthFrame.createAllowedSourcedFieldsColumnLayoutDefinitions(),
            watchlist: this._watchlistFrame.createAllowedSourcedFieldsColumnLayoutDefinition(),
            trades: this._tradesFrame.createAllowedSourcedFieldsColumnLayoutDefinition(),
        };
    }

    applyColumnLayoutDefinitions(layouts: DepthAndSalesDitemFrame.ColumnLayoutDefinitions) {
        this._depthFrame.applyColumnLayoutDefinitions(layouts.depth);
        const watchlistColumnLayoutOrReferenceDefinition = new RevColumnLayoutOrReferenceDefinition(layouts.watchlist);
        this._watchlistFrame.applyColumnLayoutOrReferenceDefinition(watchlistColumnLayoutOrReferenceDefinition);
        this._tradesFrame.applyColumnLayoutDefinition(layouts.trades);
    }

    // adviseShown() {
    //     setTimeout(() => this._depthFrame.initialiseWidths(), 3000);
    // }

    protected override applyDataIvemId(dataIvemId: DataIvemId | undefined, SelfInitiated: boolean): boolean {
        super.applyDataIvemId(dataIvemId, SelfInitiated);
        if (dataIvemId === undefined) {
            return false;
        } else {
            this._componentAccess.pushSymbol(dataIvemId);
            this.open();
            return true;
        }
    }

    // private async handleDepthActiveWidthChangedEvent(bidActiveWidth: Integer | undefined, askActiveWidth: Integer | undefined) {
    //     const depthActiveWidth = await this._depthFrame.getCompleteRenderedActiveWidth(bidActiveWidth, askActiveWidth);
    //     this._componentAccess.setDepthActiveWidth(depthActiveWidth);
    // }

    // private async handleTradesActiveWidthChangedEvent() {
    //     const tradesActiveWidth = await this._tradesFrame.getRenderedActiveWidth();
    //     this._componentAccess.setTradesActiveWidth(tradesActiveWidth);
    // }

    private close() {
        this._watchlistFrame.closeGridSource(false);
        this._depthFrame.close();
        this._tradesFrame.close();
    }

    private openTrades() {
        const dataIvemId = this.dataIvemId;
        if (dataIvemId !== undefined) {
            const historicalDate = this._componentAccess.getHistoricalDate();
            this._tradesFrame.open(dataIvemId, historicalDate);
        }
    }

    private checkAutoAdjustOpenWidths() {
        if (!this._componentAccess.explicitDepthWidth) {
            const preferredDepthWidth = this._depthFrame.getSymetricActiveWidth();
            this._componentAccess.adjustDepthWidth(preferredDepthWidth);
        }
    }
}

export namespace DepthAndSalesDitemFrame {
    export namespace JsonName {
        export const watchlist = 'watchlist';
        export const depth = 'depth';
        export const trades = 'trades';
        export const keptLayout = 'keptLayout';
        export const filterActive = 'filterActive';
        export const filterXrefs = 'filterXrefs';
        export const historicalTradeDate = 'historicalTradeDate';
    }

    export namespace JsonDefault {
        export const filterActive = false;
        export const filterXrefs: string[] = [];
        export const historicalTradeDate = undefined;
    }

    export interface AllowedGridFields {
        watchlist: readonly AllowedGridField[];
        depth: BidAskPair<readonly AllowedGridField[]>;
        trades: readonly AllowedGridField[];
    }

    export interface ColumnLayoutDefinitions {
        watchlist: RevColumnLayoutDefinition;
        depth: BidAskColumnLayoutDefinitions;
        trades: RevColumnLayoutDefinition;
    }

    export interface AllowedFieldsAndLayoutDefinitions {
        watchlist: AllowedSourcedFieldsColumnLayoutDefinition;
        depth: BidAskAllowedSourcedFieldsColumnLayoutDefinitions;
        trades: AllowedSourcedFieldsColumnLayoutDefinition;
    }

    export type OpenedEventHandler = (this: void) => void;

    export interface ComponentAccess extends DitemFrame.ComponentAccess {
        readonly explicitDepthWidth: boolean;
        adjustDepthWidth(preferredDepthWidth: number): void;
        getHistoricalDate(): Date | undefined;
        pushSymbol(dataIvemId: DataIvemId): void;
        notifyOpenedClosed(dataIvemId: DataIvemId, historicalDate: Date | undefined): void;
        // setDepthActiveWidth(width: Integer): void;
        // setTradesActiveWidth(width: Integer): void;
    }
}
