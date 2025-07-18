import { Injectable } from '@angular/core';
import { LockOpenListItem } from '@pbkware/js-utils';
import { AdaptedRevgridGridSettings, EditableColumnLayoutDefinitionColumnList, GridField, SessionInfoService } from '@plxtra/motif-core';
import {
    CellPainterFactoryNgService,
    CoreNgService,
    SessionInfoNgService,
    ToastNgService
} from 'component-services-ng-api';
import { ContentService } from '../content-service';
import { DataMarketsWithBoardsFrame } from '../data-markets/internal-api';
import { DepthFrame } from '../depth/internal-api';
import { PadOrderRequestStepFrame, ResultOrderRequestStepFrame, ReviewOrderRequestStepFrame } from '../order-request-step/internal-api';
import { StatusSummaryFrame } from '../status-summary/status-summary-frame';
import { TradesFrame } from '../trades/internal-api';
import { ZenithStatusFrame } from '../zenith-status/internal-api';
import { LegacyTableRecordSourceDefinitionFactoryNgService } from './legacy-table-record-source-definition-factory-ng.service';
import { TableRecordSourceFactoryNgService } from './table-record-source-factory-ng.service';

@Injectable({
    providedIn: 'root'
})
export class ContentNgService {
    private _content: ContentService;

    constructor(
        coreNgService: CoreNgService,
        tableRecordSourceDefinitionFactoryNgService: LegacyTableRecordSourceDefinitionFactoryNgService,
        tableRecordSourceFactoryNgService: TableRecordSourceFactoryNgService,
        sessionInfoNgService: SessionInfoNgService,
        cellPainterFactoryNgService: CellPainterFactoryNgService,
        toastNgService: ToastNgService,
    ) {
        this._content = new ContentService(
            coreNgService.decimalFactoryService,
            coreNgService.settingsService,
            coreNgService.appStorageService,
            coreNgService.adiService,
            coreNgService.marketsService,
            coreNgService.symbolsService,
            coreNgService.notificationChannelsService,
            coreNgService.scansService,
            coreNgService.textFormatterService,
            coreNgService.customHeadingsService,
            coreNgService.referenceableColumnLayoutsService,
            coreNgService.tableFieldSourceDefinitionCachingFactoryService,
            tableRecordSourceDefinitionFactoryNgService.service,
            tableRecordSourceFactoryNgService.service,
            coreNgService.referenceableDataSourceDefinitionsStoreService,
            coreNgService.referenceableDataSourcesService,
            sessionInfoNgService.service,
            cellPainterFactoryNgService.service,
            toastNgService.service,
        );
    }

    createZenithStatusFrame(componentAccess: ZenithStatusFrame.ComponentAccess, zenithEndpoints: readonly string[]) {
        return this._content.createZenithStatusFrame(componentAccess, zenithEndpoints);
    }

    createFeedsGridFrame() {
        return this._content.createFeedsGridFrame();
    }

    createDataMarketsWithBoardsFrame(componentAccess: DataMarketsWithBoardsFrame.ComponentAccess) {
        return this._content.createDataMarketsWithBoardsFrame(componentAccess);
    }

    // createGridSourceFrame(
    //     componentAccess: GridSourceFrame.ComponentAccess,
    //     hostElement: HTMLElement,
    //     customGridSettings: AdaptedRevgrid.CustomGridSettings,
    //     customiseSettingsForNewColumnEventer: AdaptedRevgrid.CustomiseSettingsForNewColumnEventer,
    //     getMainCellPainterEventer: RevSubgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
    //     getHeaderCellPainterEventer: RevSubgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
    // ) {
    //     return this._content.createGridSourceFrame(
    //         componentAccess,
    //         hostElement,
    //         customGridSettings,
    //         customiseSettingsForNewColumnEventer,
    //         getMainCellPainterEventer,
    //         getHeaderCellPainterEventer,
    //     );
    // }

    createExchangeEnvironmentsGridFrame() {
        return this._content.createExchangeEnvironmentsGridFrame();
    }

    createExchangesGridFrame() {
        return this._content.createExchangesGridFrame();
    }

    createDataMarketsGridFrame() {
        return this._content.createDataMarketsGridFrame();
    }

    createTradingMarketsGridFrame() {
        return this._content.createTradingMarketsGridFrame();
    }

    createMarketBoardsGridFrame() {
        return this._content.createMarketBoardsGridFrame();
    }

    createDataIvemIdListFrame(initialCustomGridSettings: Partial<AdaptedRevgridGridSettings> | undefined) {
        return this._content.createDataIvemIdListFrame(initialCustomGridSettings);
    }

    createWatchlistFrame() {
        return this._content.createWatchlistFrame();
    }

    createScanTestMatchesFrame() {
        return this._content.createScanTestMatchesFrame();
    }

    createBrokerageAccountsFrame() {
        return this._content.createBrokerageAccountsFrame();
    }

    createOrdersFrame() {
        return this._content.createOrdersFrame();
    }

    createOrderAuthoriseFrame() {
        return this._content.createOrderAuthoriseFrame();
    }

    createHoldingsFrame() {
        return this._content.createHoldingsFrame();
    }

    createBalancesFrame() {
        return this._content.createBalancesFrame();
    }

    createStatusSummaryFrame(sessionInfoService: SessionInfoService, componentAccess: StatusSummaryFrame.ComponentAccess) {
        return this._content.createStatusSummaryFrame(sessionInfoService, componentAccess);
    }

    createSearchSymbolsFrame() {
        return this._content.createSearchSymbolsFrame();
    }

    createScanListFrame() {
        return this._content.createScanListFrame();
    }

    createScanFieldEditorFramesGridFrame() {
        return this._content.createScanFieldEditorFramesGridFrame();
    }

    createScanEditorAttachedNotificationChannelsGridFrame(opener: LockOpenListItem.Opener) {
        return this._content.createScanEditorAttachedNotificationChannelsGridFrame(opener);
    }

    createLockOpenNotificationChannelsGridFrame(opener: LockOpenListItem.Opener) {
        return this._content.createLockOpenNotificationChannelsGridFrame(opener);
    }

    createColumnLayoutEditorAllowedFieldsFrame(allowedFields: readonly GridField[], columnList: EditableColumnLayoutDefinitionColumnList) {
        return this._content.createColumnLayoutEditorAllowedFieldsFrame(allowedFields, columnList);
    }

    createColumnLayoutEditorColumnsFrame(columnList: EditableColumnLayoutDefinitionColumnList) {
        return this._content.createColumnLayoutEditorColumnsFrame(columnList);
    }

    createSymbolListDirectoryGridFrame(opener: LockOpenListItem.Opener) {
        return this._content.createSymbolListDirectoryGridFrame(opener);
    }

    createDepthSideFrame(hostElement: HTMLElement) {
        return this._content.createDepthSideFrame(hostElement);
    }

    createDepthFrame(componentAccess: DepthFrame.ComponentAccess) {
        return this._content.createDepthFrame(componentAccess);
    }

    createTradesFrame(componentAccess: TradesFrame.ComponentAccess) {
        return this._content.createTradesFrame(componentAccess);
    }

    createPadOrderRequestStepFrame(componentAccess: PadOrderRequestStepFrame.ComponentAccess) {
        return this._content.createPadOrderRequestStepFrame(componentAccess);
    }

    createResultOrderRequestStepFrame(componentAccess: ResultOrderRequestStepFrame.ComponentAccess) {
        return this._content.createResultOrderRequestStepFrame(componentAccess);
    }

    createReviewOrderRequestStepFrame(componentAccess: ReviewOrderRequestStepFrame.ComponentAccess) {
        return this._content.createReviewOrderRequestStepFrame(componentAccess);
    }
}
