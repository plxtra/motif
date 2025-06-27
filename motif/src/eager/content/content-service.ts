import { DecimalFactory, LockOpenListItem } from '@pbkware/js-utils';
import {
    AdaptedRevgridGridSettings,
    AdiService,
    AppStorageService,
    CellPainterFactoryService,
    EditableColumnLayoutDefinitionColumnList,
    GridField,
    MarketsService,
    NotificationChannelsService,
    ReferenceableColumnLayoutsService,
    ReferenceableDataSourceDefinitionsStoreService,
    ReferenceableDataSourcesService,
    ScansService,
    SessionInfoService,
    SettingsService,
    SymbolsService,
    TableFieldSourceDefinitionCachingFactory,
    TableRecordSourceFactory,
    TextFormatterService
} from '@plxtra/motif-core';
import { ToastService } from 'component-services-internal-api';
import { RevSourcedFieldCustomHeadings } from 'revgrid';
import { BalancesFrame } from './balances/internal-api';
import { BrokerageAccountsFrame } from './brokerage-accounts/internal-api';
import { DataMarketsGridFrame, DataMarketsWithBoardsFrame } from './data-markets/internal-api';
import { DepthSideFrame } from './depth-side/internal-api';
import { DepthFrame } from './depth/internal-api';
import { ExchangeEnvironmentsGridFrame } from './exchange-environments/grid/internal-api';
import { ExchangesGridFrame } from './exchanges/internal-api';
import { FeedsGridFrame } from './feeds/internal-api';
import { ColumnLayoutEditorAllowedFieldsFrame, ColumnLayoutEditorColumnsFrame } from './grid-layout-dialog/internal-api';
import { HoldingsFrame } from './holdings/internal-api';
import { LegacyTableRecordSourceDefinitionFactoryService } from './legacy-table-record-source-definition-factory-service';
import { DataIvemIdListFrame } from './lit-ivem-id-list/data-ivem-id-list-frame';
import { LockOpenNotificationChannelsGridFrame } from './lock-open-notification-channels/internal-api';
import { MarketBoardsGridFrame } from './market-boards/internal-api';
import { SymbolListDirectoryGridFrame } from './open-watchlist/internal-api';
import { OrderAuthoriseFrame } from './order-authorise/internal-api';
import { PadOrderRequestStepFrame, ResultOrderRequestStepFrame, ReviewOrderRequestStepFrame } from './order-request-step/internal-api';
import { OrdersFrame } from './orders/internal-api';
import { ScanEditorAttachedNotificationChannelsGridFrame, ScanFieldEditorFramesGridFrame, ScanListFrame, ScanTestMatchesFrame } from './scan/internal-api';
import { SearchSymbolsFrame } from './search-symbols/internal-api';
import { StatusSummaryFrame } from './status-summary/internal-api';
import { TradesFrame } from './trades/internal-api';
import { TradingMarketsGridFrame } from './trading-markets/internal-api';
import { WatchlistFrame } from './watchlist/internal-api';
import { ZenithStatusFrame } from './zenith-status/internal-api';

export class ContentService {
    constructor(
        private readonly _decimalFactory: DecimalFactory,
        private readonly _settingsService: SettingsService,
        private readonly _appStorageService: AppStorageService,
        private readonly _adiService: AdiService,
        private readonly _marketsService: MarketsService,
        private readonly _symbolsService: SymbolsService,
        private readonly _notificationChannelsService: NotificationChannelsService,
        private readonly _scansService: ScansService,
        private readonly _textFormatterService: TextFormatterService,
        private readonly _customHeadingsService: RevSourcedFieldCustomHeadings | undefined,
        private readonly _referenceableColumnLayoutsService: ReferenceableColumnLayoutsService,
        private readonly _tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        private readonly _tableRecordSourceDefinitionFactoryService: LegacyTableRecordSourceDefinitionFactoryService,
        private readonly _tableRecordSourceFactory: TableRecordSourceFactory,
        private readonly _referenceableDataSourceDefinitionsStoreService: ReferenceableDataSourceDefinitionsStoreService,
        private readonly _referenceableDataSourcesService: ReferenceableDataSourcesService,
        private readonly _sessionInfoService: SessionInfoService,
        private readonly _cellPainterFactoryService: CellPainterFactoryService,
        private readonly _toastService: ToastService,
) { }

    createZenithStatusFrame(componentAccess: ZenithStatusFrame.ComponentAccess, zenithEndpoints: readonly string[]) {
        return new ZenithStatusFrame(componentAccess, this._adiService, zenithEndpoints);
    }

    createExchangeEnvironmentsGridFrame() {
        return new ExchangeEnvironmentsGridFrame(
            this._settingsService,
            this._customHeadingsService,
            this._referenceableColumnLayoutsService,
            this._tableFieldSourceDefinitionCachingFactory,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactory,
            this._referenceableDataSourcesService,
            this._cellPainterFactoryService,
            this._toastService,
        );
    }

    createExchangesGridFrame() {
        return new ExchangesGridFrame(
            this._settingsService,
            this._customHeadingsService,
            this._referenceableColumnLayoutsService,
            this._tableFieldSourceDefinitionCachingFactory,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactory,
            this._referenceableDataSourcesService,
            this._cellPainterFactoryService,
            this._toastService,
        );
    }

    createDataMarketsGridFrame() {
        return new DataMarketsGridFrame(
            this._settingsService,
            this._customHeadingsService,
            this._referenceableColumnLayoutsService,
            this._tableFieldSourceDefinitionCachingFactory,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactory,
            this._referenceableDataSourcesService,
            this._cellPainterFactoryService,
            this._toastService,
        );
    }

    createTradingMarketsGridFrame() {
        return new TradingMarketsGridFrame(
            this._settingsService,
            this._customHeadingsService,
            this._referenceableColumnLayoutsService,
            this._tableFieldSourceDefinitionCachingFactory,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactory,
            this._referenceableDataSourcesService,
            this._cellPainterFactoryService,
            this._toastService,
        );
    }

    createMarketBoardsGridFrame() {
        return new MarketBoardsGridFrame(
            this._settingsService,
            this._customHeadingsService,
            this._referenceableColumnLayoutsService,
            this._tableFieldSourceDefinitionCachingFactory,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactory,
            this._referenceableDataSourcesService,
            this._cellPainterFactoryService,
            this._toastService,
        );
    }

    createFeedsGridFrame() {
        return new FeedsGridFrame(
            this._settingsService,
            this._referenceableColumnLayoutsService,
            this._tableFieldSourceDefinitionCachingFactory,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactory,
            this._referenceableDataSourcesService,
            this._cellPainterFactoryService,
            this._toastService,
        );
    }

    createDataMarketsWithBoardsFrame(componentAccess: DataMarketsWithBoardsFrame.ComponentAccess) {
        return new DataMarketsWithBoardsFrame(componentAccess, this._settingsService.scalar, this._marketsService, this._textFormatterService);
    }

    // createGridSourceFrame(
    //     componentAccess: GridSourceFrame.ComponentAccess,
    //     hostElement: HTMLElement,
    //     customGridSettings: AdaptedRevgrid.CustomGridSettings,
    //     customiseSettingsForNewColumnEventer: AdaptedRevgrid.CustomiseSettingsForNewColumnEventer,
    //     getMainCellPainterEventer: RevSubgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
    //     getHeaderCellPainterEventer: RevSubgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
    // ) {
    //     return new GridSourceFrame(
    //         this._settingsService,
    //         this._namedColumnLayoutDefinitionsService,
    //         this._tableRecordSourceFactoryService,
    //         this._namedGridSourcesService,
    //         componentAccess,
    //         hostElement,
    //         customGridSettings,
    //         customiseSettingsForNewColumnEventer,
    //         getMainCellPainterEventer,
    //         getHeaderCellPainterEventer,
    //     );
    // }

    createDataIvemIdListFrame(initialCustomGridSettings: Partial<AdaptedRevgridGridSettings> | undefined) {
        return new DataIvemIdListFrame(
            this._settingsService,
            this._referenceableColumnLayoutsService,
            this._tableFieldSourceDefinitionCachingFactory,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactory,
            this._referenceableDataSourcesService,
            this._cellPainterFactoryService,
            this._toastService,
            initialCustomGridSettings,
        );
    }

    createWatchlistFrame() {
        return new WatchlistFrame(
            this._settingsService,
            this._referenceableColumnLayoutsService,
            this._tableFieldSourceDefinitionCachingFactory,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactory,
            this._referenceableDataSourcesService,
            this._cellPainterFactoryService,
            this._toastService,
        );
    }

    createScanTestMatchesFrame() {
        return new ScanTestMatchesFrame(
            this._settingsService,
            this._referenceableColumnLayoutsService,
            this._tableFieldSourceDefinitionCachingFactory,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactory,
            this._referenceableDataSourcesService,
            this._cellPainterFactoryService,
            this._toastService,
        );
    }

    createBrokerageAccountsFrame() {
        return new BrokerageAccountsFrame(
            this._settingsService,
            this._referenceableColumnLayoutsService,
            this._tableFieldSourceDefinitionCachingFactory,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactory,
            this._referenceableDataSourcesService,
            this._cellPainterFactoryService,
            this._toastService,
        );
    }

    createOrdersFrame() {
        return new OrdersFrame(
            this._settingsService,
            this._referenceableColumnLayoutsService,
            this._tableFieldSourceDefinitionCachingFactory,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactory,
            this._referenceableDataSourcesService,
            this._cellPainterFactoryService,
            this._toastService,
        );
    }

    createOrderAuthoriseFrame() {
        return new OrderAuthoriseFrame(
            this._settingsService,
            this._referenceableColumnLayoutsService,
            this._tableFieldSourceDefinitionCachingFactory,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactory,
            this._referenceableDataSourcesService,
            this._cellPainterFactoryService,
            this._toastService,
        );
    }

    createHoldingsFrame() {
        return new HoldingsFrame(
            this._settingsService,
            this._referenceableColumnLayoutsService,
            this._tableFieldSourceDefinitionCachingFactory,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactory,
            this._referenceableDataSourcesService,
            this._cellPainterFactoryService,
            this._toastService,
        );
    }

    createBalancesFrame() {
        return new BalancesFrame(
            this._settingsService,
            this._referenceableColumnLayoutsService,
            this._tableFieldSourceDefinitionCachingFactory,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactory,
            this._referenceableDataSourcesService,
            this._cellPainterFactoryService,
            this._toastService,
        );
    }

    createSearchSymbolsFrame() {
        return new SearchSymbolsFrame(
            this._settingsService,
            this._referenceableColumnLayoutsService,
            this._tableFieldSourceDefinitionCachingFactory,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactory,
            this._referenceableDataSourcesService,
            this._cellPainterFactoryService,
            this._toastService,
        );
    }

    createScanListFrame() {
        return new ScanListFrame(
            this._settingsService,
            this._referenceableColumnLayoutsService,
            this._tableFieldSourceDefinitionCachingFactory,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactory,
            this._referenceableDataSourcesService,
            this._cellPainterFactoryService,
            this._toastService,
        );
    }

    createScanFieldEditorFramesGridFrame() {
        return new ScanFieldEditorFramesGridFrame(
            this._settingsService,
            this._customHeadingsService,
            this._referenceableColumnLayoutsService,
            this._tableFieldSourceDefinitionCachingFactory,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactory,
            this._referenceableDataSourcesService,
            this._cellPainterFactoryService,
            this._toastService,
        );
    }

    createScanEditorAttachedNotificationChannelsGridFrame(opener: LockOpenListItem.Opener) {
        return new ScanEditorAttachedNotificationChannelsGridFrame(
            this._settingsService,
            this._notificationChannelsService,
            this._customHeadingsService,
            this._referenceableColumnLayoutsService,
            this._tableFieldSourceDefinitionCachingFactory,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactory,
            this._referenceableDataSourcesService,
            this._cellPainterFactoryService,
            this._toastService,
            opener,
        );
    }

    createLockOpenNotificationChannelsGridFrame(opener: LockOpenListItem.Opener) {
        return new LockOpenNotificationChannelsGridFrame(
            this._settingsService,
            this._notificationChannelsService,
            this._customHeadingsService,
            this._referenceableColumnLayoutsService,
            this._tableFieldSourceDefinitionCachingFactory,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactory,
            this._referenceableDataSourcesService,
            this._cellPainterFactoryService,
            this._toastService,
            opener,
        );
    }

    createColumnLayoutEditorAllowedFieldsFrame(allowedFields: readonly GridField[], columnList: EditableColumnLayoutDefinitionColumnList) {
        return new ColumnLayoutEditorAllowedFieldsFrame(
            this._settingsService,
            this._referenceableColumnLayoutsService,
            this._tableFieldSourceDefinitionCachingFactory,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactory,
            this._referenceableDataSourcesService,
            this._cellPainterFactoryService,
            this._toastService,
            allowedFields,
            columnList,
        );
    }

    createColumnLayoutEditorColumnsFrame(columnList: EditableColumnLayoutDefinitionColumnList) {
        return new ColumnLayoutEditorColumnsFrame(
            this._settingsService,
            this._referenceableColumnLayoutsService,
            this._tableFieldSourceDefinitionCachingFactory,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactory,
            this._referenceableDataSourcesService,
            this._cellPainterFactoryService,
            this._toastService,
            columnList,
        );
    }

    createSymbolListDirectoryGridFrame(opener: LockOpenListItem.Opener) {
        return new SymbolListDirectoryGridFrame(
            this._settingsService,
            this._scansService,
            this._referenceableColumnLayoutsService,
            this._tableFieldSourceDefinitionCachingFactory,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactory,
            this._referenceableDataSourcesService,
            this._cellPainterFactoryService,
            this._toastService,
            opener,
        );
    }

    createStatusSummaryFrame(sessionInfoService: SessionInfoService, componentAccess: StatusSummaryFrame.ComponentAccess) {
        return new StatusSummaryFrame(this._adiService, sessionInfoService, componentAccess,);
    }

    createDepthSideFrame(hostElement: HTMLElement) {
        return new DepthSideFrame(
            this._decimalFactory,
            this._settingsService,
            this._marketsService,
            this._sessionInfoService,
            this._cellPainterFactoryService,
            hostElement
        );
    }

    createDepthFrame(componentAccess: DepthFrame.ComponentAccess) {
        return new DepthFrame(componentAccess, this._adiService);
    }

    createTradesFrame(componentAccess: TradesFrame.ComponentAccess) {
        return new TradesFrame(this._decimalFactory, this._settingsService, this._adiService, this._cellPainterFactoryService, componentAccess);
    }

    createPadOrderRequestStepFrame(componentAccess: PadOrderRequestStepFrame.ComponentAccess) {
        return new PadOrderRequestStepFrame(componentAccess, this._marketsService, this._symbolsService);
    }

    createResultOrderRequestStepFrame(componentAccess: ResultOrderRequestStepFrame.ComponentAccess) {
        return new ResultOrderRequestStepFrame(componentAccess, this._adiService);
    }

    createReviewOrderRequestStepFrame(componentAccess: ReviewOrderRequestStepFrame.ComponentAccess) {
        return new ReviewOrderRequestStepFrame(componentAccess);
    }
}
