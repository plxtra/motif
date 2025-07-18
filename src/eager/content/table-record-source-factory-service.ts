import { AssertInternalError, DecimalFactory, NotImplementedError, UnreachableCaseError } from '@pbkware/js-utils';
import {
    AdiService,
    BalancesTableRecordSource,
    BalancesTableRecordSourceDefinition,
    BrokerageAccountTableRecordSource,
    BrokerageAccountTableRecordSourceDefinition,
    CallPutFromUnderlyingTableRecordSource,
    CallPutFromUnderlyingTableRecordSourceDefinition,
    CorrectnessBadness,
    DataIvemDetailFromSearchSymbolsTableRecordSource,
    DataIvemDetailFromSearchSymbolsTableRecordSourceDefinition,
    DataIvemIdComparableListTableRecordSource,
    DataIvemIdComparableListTableRecordSourceDefinition,
    EditableColumnLayoutDefinitionColumnTableRecordSource,
    EditableColumnLayoutDefinitionColumnTableRecordSourceDefinition,
    FeedTableRecordSource,
    FeedTableRecordSourceDefinition,
    GridFieldTableRecordSource,
    GridFieldTableRecordSourceDefinition,
    HoldingTableRecordSource,
    HoldingTableRecordSourceDefinition,
    MarketsService,
    NotificationChannelsService,
    OrderTableRecordSource,
    OrderTableRecordSourceDefinition,
    RankedDataIvemIdListDirectoryItemTableRecordSource,
    RankedDataIvemIdListDirectoryItemTableRecordSourceDefinition,
    RankedDataIvemIdListFactoryService,
    RankedDataIvemIdListTableRecordSource,
    RankedDataIvemIdListTableRecordSourceDefinition,
    ScanTableRecordSource,
    ScanTableRecordSourceDefinition,
    ScanTestTableRecordSourceDefinition,
    ScansService,
    SymbolDetailCacheService,
    SymbolsService,
    TableFieldSourceDefinitionCachingFactory,
    TableRecordSource,
    TableRecordSourceDefinition,
    TableRecordSourceFactory,
    TextFormatterService,
    TopShareholderTableRecordSource,
    TopShareholderTableRecordSourceDefinition,
    WatchmakerService
} from '@plxtra/motif-core';
import { RevSourcedFieldCustomHeadings } from 'revgrid';
import { DataMarketListTableRecordSource, DataMarketListTableRecordSourceDefinition } from './data-markets/internal-api';
import { ExchangeEnvironmentListTableRecordSource, ExchangeEnvironmentListTableRecordSourceDefinition } from './exchange-environments/internal-api';
import { ExchangeListTableRecordSource, ExchangeListTableRecordSourceDefinition } from './exchanges/internal-api';
import { LockOpenNotificationChannelListTableRecordSource, LockOpenNotificationChannelListTableRecordSourceDefinition } from './lock-open-notification-channels/internal-api';
import { MarketBoardListTableRecordSource, MarketBoardListTableRecordSourceDefinition } from './market-boards/internal-api';
import {
    ScanEditorAttachedNotificationChannelComparableListTableRecordSource,
    ScanEditorAttachedNotificationChannelComparableListTableRecordSourceDefinition,
    ScanFieldEditorFrameComparableListTableRecordSource,
    ScanFieldEditorFrameComparableListTableRecordSourceDefinition,
} from './scan/internal-api';
import { TradingMarketListTableRecordSource, TradingMarketListTableRecordSourceDefinition } from './trading-markets/internal-api';

/** @public */
export class TableRecordSourceFactoryService implements TableRecordSourceFactory {
    constructor(
        private readonly _decimalFactory: DecimalFactory,
        private readonly _marketsService: MarketsService,
        private readonly _adiService: AdiService,
        private readonly _symbolsService: SymbolsService,
        private readonly _symbolDetailCacheService: SymbolDetailCacheService,
        private readonly _rankedDataIvemIdListFactoryService: RankedDataIvemIdListFactoryService,
        private readonly _watchmakerService: WatchmakerService,
        private readonly _notificationChannelsService: NotificationChannelsService,
        private readonly _scansService: ScansService,
        private readonly _textFormatterService: TextFormatterService,
        private readonly _gridFieldCustomHeadingsService: RevSourcedFieldCustomHeadings,
        private readonly _tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
    ) { }

    create(definition: TableRecordSourceDefinition): TableRecordSource {
        switch (definition.typeId) {
            case TableRecordSourceDefinition.TypeId.Null: throw new NotImplementedError('TRSFCFDN29984');
            case TableRecordSourceDefinition.TypeId.DataIvemIdComparableList: return this.createDataIvemIdComparableList(definition);
            case TableRecordSourceDefinition.TypeId.DataIvemDetailsFromSearchSymbols: return this.createDataIvemDetailFromSearchSymbols(definition);
            case TableRecordSourceDefinition.TypeId.RankedDataIvemIdList: return this.createWatchlist(definition);
            case TableRecordSourceDefinition.TypeId.MarketMovers: throw new NotImplementedError('TRSFCFDMM3820');
            case TableRecordSourceDefinition.TypeId.Gics: throw new NotImplementedError('TRSFCFDG78783');
            case TableRecordSourceDefinition.TypeId.ProfitIvemHolding: throw new NotImplementedError('TRSFCFDP18885');
            case TableRecordSourceDefinition.TypeId.CashItemHolding: throw new NotImplementedError('TRSFCFDC20098');
            case TableRecordSourceDefinition.TypeId.IntradayProfitLossSymbolRec: throw new NotImplementedError('TRSFCFDI11198');
            case TableRecordSourceDefinition.TypeId.TmcDefinitionLegs: throw new NotImplementedError('TRSFCFDT99873');
            case TableRecordSourceDefinition.TypeId.TmcLeg: throw new NotImplementedError('TRSFCFDT22852');
            case TableRecordSourceDefinition.TypeId.TmcWithLegMatchingUnderlying: throw new NotImplementedError('TRSFCFDT75557');
            case TableRecordSourceDefinition.TypeId.CallPutFromUnderlying: return this.createCallPutFromUnderlying(definition);
            case TableRecordSourceDefinition.TypeId.HoldingAccountPortfolio: throw new NotImplementedError('TRSFCFDH22321');
            case TableRecordSourceDefinition.TypeId.Feed: return this.createFeed(definition);
            case TableRecordSourceDefinition.TypeId.BrokerageAccount: return this.createBrokerageAccount(definition);
            case TableRecordSourceDefinition.TypeId.Order: return this.createOrder(definition);
            case TableRecordSourceDefinition.TypeId.Holding: return this.createHolding(definition);
            case TableRecordSourceDefinition.TypeId.Balances: return this.createBalances(definition);
            case TableRecordSourceDefinition.TypeId.TopShareholder: return this.createTopShareholder(definition);
            case TableRecordSourceDefinition.TypeId.EditableColumnLayoutDefinitionColumn: return this.createColumnLayoutDefinitionColumnEditRecord(definition);
            case TableRecordSourceDefinition.TypeId.Scan: return this.createScan(definition);
            case TableRecordSourceDefinition.TypeId.RankedDataIvemIdListDirectoryItem: return this.createRankedDataIvemIdListDirectoryItem(definition);
            case TableRecordSourceDefinition.TypeId.GridField: return this.createGridField(definition);
            case TableRecordSourceDefinition.TypeId.ScanFieldEditorFrame: return this.createScanFieldEditorFrameComparableList(definition)
            case TableRecordSourceDefinition.TypeId.ScanEditorAttachedNotificationChannel: return this.createScanEditorAttachedNotificationChannel(definition)
            case TableRecordSourceDefinition.TypeId.LockOpenNotificationChannelList: return this.createLockOpenNotificationChannel(definition)
            case TableRecordSourceDefinition.TypeId.ExchangeEnvironmentList: return this.createExchangeEnvironmentList(definition);
            case TableRecordSourceDefinition.TypeId.ExchangeList: return this.createExchangeList(definition);
            case TableRecordSourceDefinition.TypeId.TradingMarketList: return this.createTradingMarketList(definition);
            case TableRecordSourceDefinition.TypeId.DataMarketList: return this.createDataMarketList(definition);
            case TableRecordSourceDefinition.TypeId.MarketBoardList: return this.createMarketBoardList(definition);
            default: throw new UnreachableCaseError('TDLFCFTID17742', definition.typeId);
        }
    }

    createCorrectnessState() {
        return new CorrectnessBadness();
    }

    private createDataIvemIdComparableList(definition: TableRecordSourceDefinition) {
        if (definition instanceof DataIvemIdComparableListTableRecordSourceDefinition) {
            return new DataIvemIdComparableListTableRecordSource(
                this._decimalFactory,
                this._adiService,
                this._symbolDetailCacheService,
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactory,
                this.createCorrectnessState(),
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCLIICL21099');
        }
    }

    private createDataIvemDetailFromSearchSymbols(definition: TableRecordSourceDefinition) {
        if (definition instanceof DataIvemDetailFromSearchSymbolsTableRecordSourceDefinition) {
            return new DataIvemDetailFromSearchSymbolsTableRecordSource(
                this._decimalFactory,
                this._marketsService,
                this._adiService,
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactory,
                this.createCorrectnessState(),
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCLIIFSS21099');
        }
    }

    private createWatchlist(definition: TableRecordSourceDefinition) {
        if (definition instanceof RankedDataIvemIdListTableRecordSourceDefinition) {
            return new RankedDataIvemIdListTableRecordSource(
                this._decimalFactory,
                this._adiService,
                this._symbolDetailCacheService,
                this._rankedDataIvemIdListFactoryService,
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactory,
                this.createCorrectnessState(),
                definition,
            );
        } else {
            throw new AssertInternalError('TRSFCW21099');
        }
    }

    private createFeed(definition: TableRecordSourceDefinition) {
        if (definition instanceof FeedTableRecordSourceDefinition) {
            return new FeedTableRecordSource(
                this._adiService,
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactory,
                this.createCorrectnessState(),
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCF21099');
        }
    }

    private createBrokerageAccount(definition: TableRecordSourceDefinition) {
        if (definition instanceof BrokerageAccountTableRecordSourceDefinition) {
            return new BrokerageAccountTableRecordSource(
                this._adiService,
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactory,
                this.createCorrectnessState(),
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCBA21099');
        }
    }

    private createOrder(definition: TableRecordSourceDefinition) {
        if (definition instanceof OrderTableRecordSourceDefinition) {
            return new OrderTableRecordSource(
                this._decimalFactory,
                this._adiService,
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactory,
                this.createCorrectnessState(),
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCO21099');
        }
    }

    private createHolding(definition: TableRecordSourceDefinition) {
        if (definition instanceof HoldingTableRecordSourceDefinition) {
            return new HoldingTableRecordSource(
                this._decimalFactory,
                this._adiService,
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactory,
                this.createCorrectnessState(),
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCH21099');
        }
    }

    private createBalances(definition: TableRecordSourceDefinition) {
        if (definition instanceof BalancesTableRecordSourceDefinition) {
            return new BalancesTableRecordSource(
                this._decimalFactory,
                this._adiService,
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactory,
                this.createCorrectnessState(),
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCB21099');
        }
    }

    private createCallPutFromUnderlying(definition: TableRecordSourceDefinition) {
        if (definition instanceof CallPutFromUnderlyingTableRecordSourceDefinition) {
            return new CallPutFromUnderlyingTableRecordSource(
                this._decimalFactory,
                this._adiService,
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactory,
                this.createCorrectnessState(),
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCTS21099');
        }
    }

    private createTopShareholder(definition: TableRecordSourceDefinition) {
        if (definition instanceof TopShareholderTableRecordSourceDefinition) {
            return new TopShareholderTableRecordSource(
                this._adiService,
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactory,
                this.createCorrectnessState(),
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCTS21099');
        }
    }

    private createColumnLayoutDefinitionColumnEditRecord(definition: TableRecordSourceDefinition) {
        if (definition instanceof EditableColumnLayoutDefinitionColumnTableRecordSourceDefinition) {
            return new EditableColumnLayoutDefinitionColumnTableRecordSource(
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactory,
                this.createCorrectnessState(),
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCGLDCER21099');
        }
    }

    private createScan(definition: TableRecordSourceDefinition) {
        if (definition instanceof ScanTableRecordSourceDefinition) {
            return new ScanTableRecordSource(
                this._symbolsService,
                this._scansService,
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactory,
                this.createCorrectnessState(),
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCS21099');
        }
    }

    private createRankedDataIvemIdListDirectoryItem(definition: TableRecordSourceDefinition) {
        if (definition instanceof RankedDataIvemIdListDirectoryItemTableRecordSourceDefinition) {
            return new RankedDataIvemIdListDirectoryItemTableRecordSource(
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactory,
                this.createCorrectnessState(),
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCRLIILDI21099');
        }
    }

    private createGridField(definition: TableRecordSourceDefinition) {
        if (definition instanceof GridFieldTableRecordSourceDefinition) {
            return new GridFieldTableRecordSource(
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactory,
                this.createCorrectnessState(),
                definition
            );
        } else {
            throw new AssertInternalError('TRSFSCGF21099');
        }
    }

    private createScanTest(definition: TableRecordSourceDefinition) {
        if (definition instanceof ScanTestTableRecordSourceDefinition) {
            return new RankedDataIvemIdListTableRecordSource(
                this._decimalFactory,
                this._adiService,
                this._symbolDetailCacheService,
                this._rankedDataIvemIdListFactoryService,
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactory,
                this.createCorrectnessState(),
                definition,
            );
        } else {
            throw new AssertInternalError('TRSFSCST21099');
        }
    }

    private createScanFieldEditorFrameComparableList(definition: TableRecordSourceDefinition) {
        if (definition instanceof ScanFieldEditorFrameComparableListTableRecordSourceDefinition) {
            return new ScanFieldEditorFrameComparableListTableRecordSource(
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactory,
                this.createCorrectnessState(),
                definition,
            );
        } else {
            throw new AssertInternalError('TRSFSCSFEFCL21099');
        }
    }

    private createScanEditorAttachedNotificationChannel(definition: TableRecordSourceDefinition) {
        if (definition instanceof ScanEditorAttachedNotificationChannelComparableListTableRecordSourceDefinition) {
            return new ScanEditorAttachedNotificationChannelComparableListTableRecordSource(
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactory,
                this.createCorrectnessState(),
                definition,
            );
        } else {
            throw new AssertInternalError('TRSFSCSEANC21099');
        }
    }

    private createLockOpenNotificationChannel(definition: TableRecordSourceDefinition) {
        if (definition instanceof LockOpenNotificationChannelListTableRecordSourceDefinition) {
            return new LockOpenNotificationChannelListTableRecordSource(
                this._notificationChannelsService,
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactory,
                this.createCorrectnessState(),
                definition,
            );
        } else {
            throw new AssertInternalError('TRSFSCLONC21099');
        }
    }

    private createExchangeEnvironmentList(definition: TableRecordSourceDefinition) {
        if (definition instanceof ExchangeEnvironmentListTableRecordSourceDefinition) {
            return new ExchangeEnvironmentListTableRecordSource(
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactory,
                definition,
            )
        } else {
            throw new AssertInternalError('TRSFSCEEL21099');
        }
    }
    private createExchangeList(definition: TableRecordSourceDefinition) {
        if (definition instanceof ExchangeListTableRecordSourceDefinition) {
            return new ExchangeListTableRecordSource(
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactory,
                definition,
            )
        } else {
            throw new AssertInternalError('TRSFSCEL21099');
        }
    }
    private createTradingMarketList(definition: TableRecordSourceDefinition) {
        if (definition instanceof TradingMarketListTableRecordSourceDefinition) {
            return new TradingMarketListTableRecordSource(
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactory,
                definition,
            )
        } else {
            throw new AssertInternalError('TRSFSCTLM21099');
        }
    }
    private createDataMarketList(definition: TableRecordSourceDefinition) {
        if (definition instanceof DataMarketListTableRecordSourceDefinition) {
            return new DataMarketListTableRecordSource(
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactory,
                definition,
            )
        } else {
            throw new AssertInternalError('TRSFSCDML21099');
        }
    }
    private createMarketBoardList(definition: TableRecordSourceDefinition)  {
        if (definition instanceof MarketBoardListTableRecordSourceDefinition) {
            return new MarketBoardListTableRecordSource(
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactory,
                definition,
            )
        } else {
            throw new AssertInternalError('TRSFSCMBL21099');
        }
    }
}
