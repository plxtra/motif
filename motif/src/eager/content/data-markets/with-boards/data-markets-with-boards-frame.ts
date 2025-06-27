import {
    AssertInternalError,
    Integer,
    MultiEvent,
    SourceTzOffsetDateTime,
    UnreachableCaseError,
    UsableListChangeTypeId
} from '@pbkware/js-utils';
import {
    Badness,
    Correctness,
    DataMarket,
    FeedStatus,
    MarketBoard,
    MarketsService,
    ScalarSettings,
    TextFormatterService,
    TradingState
} from '@plxtra/motif-core';
import { ContentFrame } from '../../content-frame';

export class DataMarketsWithBoardsFrame extends ContentFrame {
    marketCountChangedEvent: DataMarketsWithBoardsFrame.MarketsCountChangedEventHandler | undefined;
    marketBoardCountChangedEvent: DataMarketsWithBoardsFrame.MarketBoardCountChangedEventHandler | undefined;

    private _marketsListChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _marketsBadnessChangeSubscriptionId: MultiEvent.SubscriptionId;

    private _markets: MarketsService.AllKnownDataMarkets;

    private _marketWrappers: DataMarketsWithBoardsFrame.MarketWrapper[] = [];
    private _displayRecords: DataMarketsWithBoardsFrame.DisplayRecord[] = [];

    private _marketCount = 0;
    private _offlineMarketCount = 0;
    private _marketBoardCount = 0;

    constructor(
        private readonly _componentAccess: DataMarketsWithBoardsFrame.ComponentAccess,
        private readonly _scalarSettings: ScalarSettings,
        private readonly _marketsService: MarketsService,
        private readonly _textFormatterService: TextFormatterService,
    ) {
        super();
        this._markets = this._marketsService.dataMarkets;
    }

    get displayRecords() { return this._displayRecords; }
    get marketCount() { return this._marketCount; }
    get offlineMarketCount() { return this._offlineMarketCount; }
    get tradingMarketCount() { return this._marketBoardCount; }

    initialise() {
        this._marketsListChangeSubscriptionId = this._markets.subscribeListChangeEvent(
            (listChangeTypeId, index, count) => this.handleMarketsListChangeEvent(listChangeTypeId, index, count)
        );
        this._marketsBadnessChangeSubscriptionId = this._markets.subscribeBadnessChangedEvent(
            () => this.handleMarketsBadnessChangeEvent()
        );

        if (this._markets.usable) {
            const count = this._markets.count;
            if (count > 0) {
                this.processMarketsListChange(UsableListChangeTypeId.PreUsableAdd, 0, count);
            }
            this.processMarketsListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this.processMarketsListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }

        const badness = this.calculateBadness();
        this._componentAccess.hideBadnessWithVisibleDelay(badness);

        this.updateDisplayRecordsAndCounts();
    }

    override finalise() {
        this.clearMarkets();
        this._markets.unsubscribeListChangeEvent(this._marketsListChangeSubscriptionId);
        this._marketsListChangeSubscriptionId = undefined;
        this._markets.unsubscribeBadnessChangedEvent(this._marketsBadnessChangeSubscriptionId);
        this._marketsBadnessChangeSubscriptionId = undefined;

        super.finalise();
    }

    private handleMarketsListChangeEvent(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        const marketsChanged = this.processMarketsListChange(listChangeTypeId, index, count);
        if (marketsChanged) {
            this.updateDisplayRecordsAndCounts();
        }
    }

    private handleMarketsBadnessChangeEvent() {
        const badness = this.calculateBadness();
        this._componentAccess.setBadness(badness);
        this.updateDisplayRecordsAndCounts();
    }

    private handleMarketChangeEvent() {
        this.updateDisplayRecordsAndCounts();
    }

    private notifyMarketCountChanged() {
        if (this.marketCountChangedEvent !== undefined) {
            this.marketCountChangedEvent();
        }
    }

    private notifyMarketBoardCountChanged() {
        if (this.marketBoardCountChangedEvent !== undefined) {
            this.marketBoardCountChangedEvent();
        }
    }

    private calculateBadness() {
        return this._markets.badness;
    }

    private processMarketsListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable: {
                const UnusableBadness = this.calculateBadness();
                this._componentAccess.setBadness(UnusableBadness);
                return true;
            }
            case UsableListChangeTypeId.PreUsableClear: {
                return this.clearMarkets();
            }
            case UsableListChangeTypeId.PreUsableAdd: {
                return this.insertMarkets(index, count);
            }
            case UsableListChangeTypeId.Usable: {
                const Usablebadness = this.calculateBadness();
                this._componentAccess.setBadness(Usablebadness);
                return true;
            }
            case UsableListChangeTypeId.Insert: {
                return this.insertMarkets(index, count);
            }
            case UsableListChangeTypeId.BeforeReplace: {
                throw new AssertInternalError('CIDFPMLCBR09134');
            }
            case UsableListChangeTypeId.AfterReplace: {
                throw new AssertInternalError('CIDFPMLCAR09134');
            }
            case UsableListChangeTypeId.BeforeMove: {
                throw new AssertInternalError('CIDFPMLCBM09134');
            }
            case UsableListChangeTypeId.AfterMove: {
                throw new AssertInternalError('CIDFPMLCAM09134');
            }
            case UsableListChangeTypeId.Remove: {
                return this.removeMarkets(index, count);
            }
            case UsableListChangeTypeId.Clear: {
                return this.clearMarkets();
            }
            default:
                throw new UnreachableCaseError('CIDFPMLCU09134', listChangeTypeId);
        }
    }

    private clearMarkets() {
        if (this._marketWrappers.length === 0) {
            return false;
        } else {
            for (const wrapper of this._marketWrappers) {
                wrapper.finalise();
            }

            this._marketWrappers.length = 0;
            return true;
        }
    }

    private insertMarkets(index: Integer, count: Integer) {
        if (count === 0) {
            return false;
        } else {
            const newMarketWrappers = new Array<DataMarketsWithBoardsFrame.MarketWrapper>(count);
            let recordIdx = index;
            for (let i = 0; i < count; i++) {
                const market = this._markets.getAt(recordIdx++);
                const wrapper = new DataMarketsWithBoardsFrame.MarketWrapper(market);
                wrapper.changeEvent = () => this.handleMarketChangeEvent();
                newMarketWrappers[i] = wrapper;
            }

            this._marketWrappers.splice(index, 0, ...newMarketWrappers);

            return true;
        }
    }

    private removeMarkets(index: Integer, count: Integer) {
        if (count === 0) {
            return false;
        } else {
            for (let i = index; i < index + count; i++) {
                const wrapper = this._marketWrappers[i];
                wrapper.finalise();
            }

            this._marketWrappers.splice(index, count);

            return true;
        }
    }

    private updateDisplayRecordsAndCounts() {
        const markets = this._markets;

        const marketCount = markets.count;
        let offlineMarketCount = 0;
        let marketBoardCount = 0;

        const displayRecords = new Array<DataMarketsWithBoardsFrame.DisplayRecord>(marketCount + marketBoardCount);

        let idx = 0;
        for (let marketIdx = 0; marketIdx < marketCount; marketIdx++) {
            const market = markets.getAt(marketIdx);
            displayRecords[idx++] = this.createMarketDisplayRecord(market);
            const feedStatusId = market.feedStatusId;
            const correctnessId = FeedStatus.idToCorrectnessId(feedStatusId);
            if (Correctness.idIsUnusable(correctnessId)) {
                offlineMarketCount++;
            }

            const marketMarketBoards = market.marketBoards;
            const marketMarketBoardCount = marketMarketBoards.count;
            for (let boardIdx = 0; boardIdx < marketMarketBoardCount; boardIdx++) {
                marketBoardCount++;
                const board = marketMarketBoards.getAt(boardIdx);
                displayRecords[idx++] = this.createMarketBoardDisplayRecord(board);
            }
        }

        this._displayRecords = displayRecords;
        this._componentAccess.notifyDisplayRecordsChanged();

        if (this._marketCount !== marketCount || this._offlineMarketCount !== offlineMarketCount) {
            this._marketCount = marketCount;
            this._offlineMarketCount = offlineMarketCount;
            this.notifyMarketCountChanged();
        }

        if (this._marketBoardCount !== marketBoardCount) {
            this._marketBoardCount = marketBoardCount;
            this.notifyMarketBoardCountChanged();
        }
    }

    private createMarketDisplayRecord(market: DataMarket) {
        let tradingDateStr: string;
        const tradingDate = market.tradingDate;
        if (tradingDate === undefined) {
            tradingDateStr = '';
        } else {
            tradingDateStr = this._textFormatterService.formatSourceTzOffsetDate(tradingDate); // utcTimezonedTradingDate.toLocaleString();
        }

        let marketTimeStr: string;
        const marketTime = market.marketTime;
        if (marketTime === undefined) {
            marketTimeStr = '';
        } else {
            const utcTimezonedMarketTime =
                SourceTzOffsetDateTime.getTimezonedDate(marketTime, this._scalarSettings.format_DateTimeTimezoneModeId);
            marketTimeStr = this._textFormatterService.formatDateTime(utcTimezonedMarketTime); // utcTimezonedMarketTime.toLocaleString();
        }

        const record: DataMarketsWithBoardsFrame.DisplayRecord = {
            name: market.display,
            board: false,
            status: market.status ?? '?',
            reason: this.reasonIdToDisplay(market.reasonId),
            allows: this.allowIdsToDisplay(market.allowIds),
            feedStatus: FeedStatus.idToDisplay(market.feedStatusId),
            tradingDate: tradingDateStr,
            marketTime: marketTimeStr,
        };
        return record;
    }

    private createMarketBoardDisplayRecord(board: MarketBoard) {
        const record: DataMarketsWithBoardsFrame.DisplayRecord = {
            name: board.display,
            board: true,
            status: board.status ?? '?',
            reason: this.reasonIdToDisplay(board.reasonId),
            allows: this.allowIdsToDisplay(board.allowIds),
            feedStatus: '',
            tradingDate: '',
            marketTime: '',
        };
        return record;
    }

    private allowIdsToDisplay(allowIds: TradingState.AllowIds | undefined) {
        let display: string;
        if (allowIds === undefined) {
            display = '';
        } else {
            const allowCount = allowIds.length;
            const allowDisplays = new Array<string>(allowCount);
            for (let i = 0; i < allowCount; i++) {
                allowDisplays[i] = TradingState.Allow.idToDisplay(allowIds[i]);
            }
            display = allowDisplays.join(',');
        }
        return display;
    }

    private reasonIdToDisplay(reasonId: TradingState.ReasonId | undefined) {
        return reasonId === undefined ? '' : TradingState.Reason.idToDisplay(reasonId);
    }
}

export namespace DataMarketsWithBoardsFrame {
    export type MarketsCountChangedEventHandler = (this: void) => void;
    export type MarketBoardCountChangedEventHandler = (this: void) => void;

    export interface DisplayRecord {
        name: string;
        board: boolean;
        status: string;
        reason: string;
        allows: string;
        feedStatus: string;
        tradingDate: string;
        marketTime: string;
    }

    export class MarketWrapper {
        changeEvent: MarketWrapper.ChangeEventHandler;

        private _changeSubscriptionId: MultiEvent.SubscriptionId;

        constructor(private _market: DataMarket) {
            this._changeSubscriptionId = this._market.subscribeFieldValuesChangedEvent(
                (changedFieldIds) => this.handleChangeEvent(changedFieldIds)
            );
        }

        finalise() {
            this._market.unsubscribeFieldValuesChangedEvent(this._changeSubscriptionId);
        }

        private handleChangeEvent(changedFieldIds: DataMarket.FieldId[]) {
            this.changeEvent(changedFieldIds);
        }
    }

    export namespace MarketWrapper {
        export type ChangeEventHandler = (this: void, changedFieldIds: DataMarket.FieldId[]) => void;
    }

    export interface ComponentAccess {
        notifyDisplayRecordsChanged(): void;

        setBadness(value: Badness): void;
        hideBadnessWithVisibleDelay(badness: Badness): void;
    }
}
