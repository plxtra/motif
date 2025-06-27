import { AssertInternalError, DecimalFactory, Err, JsonElement, LockOpenListItem, NotImplementedError, Ok, Result, UnreachableCaseError } from '@pbkware/js-utils';
import {
    BalancesTableRecordSourceDefinition,
    BrokerageAccountGroup,
    BrokerageAccountGroupTableRecordSourceDefinition,
    BrokerageAccountTableRecordSourceDefinition,
    CallPutFromUnderlyingTableRecordSourceDefinition,
    DataIvemDetailFromSearchSymbolsTableRecordSourceDefinition,
    DataIvemId,
    DataIvemIdArrayRankedDataIvemIdListDefinition,
    DataIvemIdComparableListTableRecordSourceDefinition,
    DataIvemIdExecuteScanRankedDataIvemIdListDefinition,
    EditableColumnLayoutDefinitionColumnList,
    EditableColumnLayoutDefinitionColumnTableRecordSourceDefinition,
    ErrorCode,
    FeedTableRecordSourceDefinition,
    GridField,
    GridFieldTableRecordSourceDefinition,
    HoldingTableRecordSourceDefinition,
    IvemId,
    MarketsService,
    OrderTableRecordSourceDefinition,
    RankedDataIvemIdListDefinition,
    RankedDataIvemIdListDefinitionFactoryService,
    RankedDataIvemIdListDirectory,
    RankedDataIvemIdListDirectoryItemTableRecordSourceDefinition,
    RankedDataIvemIdListTableRecordSourceDefinition,
    ScanIdRankedDataIvemIdListDefinition,
    ScanTableRecordSourceDefinition,
    ScanTestTableRecordSourceDefinition,
    SearchSymbolsDataDefinition,
    TableFieldSourceDefinitionCachingFactory,
    TableRecordSourceDefinition,
    TableRecordSourceDefinitionFromJsonFactory,
    TopShareholderTableRecordSourceDefinition,
    UiComparableList,
    WatchlistTableRecordSourceDefinition
} from '@plxtra/motif-core';
import { RevSourcedFieldCustomHeadings } from 'revgrid';

/** @public */
export class LegacyTableRecordSourceDefinitionFactoryService implements TableRecordSourceDefinitionFromJsonFactory {

    constructor(
        private readonly _decimalFactory: DecimalFactory,
        private readonly _marketsService: MarketsService,
        private readonly _dataIvemIdListDefinitionFactoryService: RankedDataIvemIdListDefinitionFactoryService,
        readonly _customHeadings: RevSourcedFieldCustomHeadings,
        readonly tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
    ) {
    }

    createDataIvemIdFromSearchSymbols(dataDefinition: SearchSymbolsDataDefinition) {
        return new DataIvemDetailFromSearchSymbolsTableRecordSourceDefinition(
            this._marketsService,
            this._customHeadings,
            this.tableFieldSourceDefinitionCachingFactory,
            dataDefinition,
        );
    }

    createDataIvemIdComparableList(list: UiComparableList<DataIvemId>) {
        return new DataIvemIdComparableListTableRecordSourceDefinition(
            this._customHeadings,
            this.tableFieldSourceDefinitionCachingFactory,
            list,
        );
    }

    createRankedDataIvemIdList(definition: RankedDataIvemIdListDefinition) {
        switch (definition.typeId) {
            case RankedDataIvemIdListDefinition.TypeId.DataIvemIdExecuteScan:
                if (definition instanceof DataIvemIdExecuteScanRankedDataIvemIdListDefinition) {
                    return new ScanTestTableRecordSourceDefinition(
                        this._customHeadings,
                        this.tableFieldSourceDefinitionCachingFactory,
                        definition,
                    );
                } else {
                    throw new AssertInternalError('TRSDFSCRLIILLIIES44456', definition.typeId.toString());
                }
            case RankedDataIvemIdListDefinition.TypeId.ScanId:
            case RankedDataIvemIdListDefinition.TypeId.DataIvemIdArray:
                return new WatchlistTableRecordSourceDefinition(
                    this._customHeadings,
                    this.tableFieldSourceDefinitionCachingFactory,
                    definition as (DataIvemIdArrayRankedDataIvemIdListDefinition | ScanIdRankedDataIvemIdListDefinition),
                );
            case RankedDataIvemIdListDefinition.TypeId.WatchmakerListId:
                throw new NotImplementedError('TRSDFSCRLIILWLI44456');
            default:
                throw new UnreachableCaseError('TRSDFSCRLIILD44456', definition.typeId);
        }
    }

    createCallPutFromUnderlying(underlyingIvemId: IvemId) {
        return new CallPutFromUnderlyingTableRecordSourceDefinition(
            this._customHeadings,
            this.tableFieldSourceDefinitionCachingFactory,
            underlyingIvemId
        );
    }

    createFeed() {
        return new FeedTableRecordSourceDefinition(
            this._customHeadings,
            this.tableFieldSourceDefinitionCachingFactory,
        );
    }

    createBrokerageAccount() {
        return new BrokerageAccountTableRecordSourceDefinition(
            this._customHeadings,
            this.tableFieldSourceDefinitionCachingFactory,
        );
    }

    createOrder(brokerageAccountGroup: BrokerageAccountGroup) {
        return new OrderTableRecordSourceDefinition(
            this._customHeadings,
            this.tableFieldSourceDefinitionCachingFactory,
            brokerageAccountGroup,
        );
    }

    createHolding(brokerageAccountGroup: BrokerageAccountGroup) {
        return new HoldingTableRecordSourceDefinition(
            this._customHeadings,
            this.tableFieldSourceDefinitionCachingFactory,
            brokerageAccountGroup,
        );
    }

    createBalances(brokerageAccountGroup: BrokerageAccountGroup) {
        return new BalancesTableRecordSourceDefinition(
            this._customHeadings,
            this.tableFieldSourceDefinitionCachingFactory,
            brokerageAccountGroup,
        );
    }

    createTopShareholder(
        dataIvemId: DataIvemId,
        tradingDate: Date | undefined,
        compareToTradingDate: Date | undefined
    ) {
        return new TopShareholderTableRecordSourceDefinition(
            this._customHeadings,
            this.tableFieldSourceDefinitionCachingFactory,
            dataIvemId,
            tradingDate,
            compareToTradingDate,
        );
    }

    createGridField(gridFieldArray: GridField[]) {
        return new GridFieldTableRecordSourceDefinition(
            this._customHeadings,
            this.tableFieldSourceDefinitionCachingFactory,
            gridFieldArray,
        );
    }

    createScan() {
        return new ScanTableRecordSourceDefinition(
            this._customHeadings,
            this.tableFieldSourceDefinitionCachingFactory,
        );
    }

    createRankedDataIvemIdListDirectoryItem(rankedDataIvemIdListDirectory: RankedDataIvemIdListDirectory) {
        return new RankedDataIvemIdListDirectoryItemTableRecordSourceDefinition(
            this._customHeadings,
            this.tableFieldSourceDefinitionCachingFactory,
            rankedDataIvemIdListDirectory,
        );
    }

    createScanTest(listDefinition: DataIvemIdExecuteScanRankedDataIvemIdListDefinition) {
        return new ScanTestTableRecordSourceDefinition(
            this._customHeadings,
            this.tableFieldSourceDefinitionCachingFactory,
            listDefinition,
        );
    }

    createEditableColumnLayoutDefinitionColumn(columnList: EditableColumnLayoutDefinitionColumnList) {
        return new EditableColumnLayoutDefinitionColumnTableRecordSourceDefinition(
            this._customHeadings,
            this.tableFieldSourceDefinitionCachingFactory,
            columnList,
        );
    }


    // createDataIvemIdComparableList(list: UiComparableList<DataIvemId>) {
    //     return new DataIvemIdComparableListTableRecordSourceDefinition(
    //         this.gridFieldCustomHeadingsService,
    //         this.tableFieldSourceDefinitionCachingFactory,
    //         list,
    //     );
    // }

    tryCreateFromJson(element: JsonElement): Result<TableRecordSourceDefinition> {
        const typeIdNameResult = TableRecordSourceDefinition.tryGetTypeIdNameFromJson(element);
        if (typeIdNameResult.isErr()) {
            return typeIdNameResult.createOuter(ErrorCode.TableRecordSourceDefinitionFactoryService_TryGetTypeIdFromJson);
        } else {
            const typeIdName = typeIdNameResult.value;
            const typeId = TableRecordSourceDefinition.Type.tryJsonToId(typeIdName);
            if (typeId === undefined) {
                return new Err(`${ErrorCode.TableRecordSourceDefinitionFactoryService_TypeIdNameIsInvalid}: ${typeIdName}`);
            } else {
                const definitionResult = this.tryCreateFromJsonAndTypeId(element, typeId);
                if (definitionResult.isErr()) {
                    return definitionResult.createOuter(ErrorCode.TableRecordSourceDefinitionFactoryService_TryCreateFromJson_Definition);
                } else {
                    const definition = definitionResult.value;
                    return new Ok(definition);
                }
            }
        }
    }

    private tryCreateFromJsonAndTypeId(element: JsonElement, typeId: TableRecordSourceDefinition.TypeId): Result<TableRecordSourceDefinition> {
        switch (typeId) {
            case TableRecordSourceDefinition.TypeId.Null:
                throw new NotImplementedError('TRSDFTCTFJN29984');
            case TableRecordSourceDefinition.TypeId.DataIvemDetailsFromSearchSymbols: {
                const definitionResult = DataIvemDetailFromSearchSymbolsTableRecordSourceDefinition.tryCreateDataDefinitionFromJson(this._decimalFactory, element);
                if (definitionResult.isErr()) {
                    return definitionResult.createOuter(ErrorCode.TableRecordSourceDefinitionFactoryService_DataIvemDetailsFromSearchSymbols_DataDefinitionCreateError);
                } else {
                    const definition = this.createDataIvemIdFromSearchSymbols(definitionResult.value);
                    return new Ok(definition);
                }
            }
            case TableRecordSourceDefinition.TypeId.DataIvemIdComparableList: {
                const definitionResult = DataIvemIdComparableListTableRecordSourceDefinition.tryCreateListFromElement(this._marketsService, element);
                if (definitionResult.isErr()) {
                    return definitionResult.createOuter(ErrorCode.TableRecordSourceDefinitionFactoryService_DataIvemIdComparableList_CreateListError);
                } else {
                    const definition = this.createDataIvemIdComparableList(definitionResult.value);
                    return new Ok(definition);
                }
            }
            case TableRecordSourceDefinition.TypeId.RankedDataIvemIdList: {
                const rankedDataIvemIdListDefinitionResult = RankedDataIvemIdListTableRecordSourceDefinition.tryCreateDefinition(
                    this._dataIvemIdListDefinitionFactoryService,
                    element
                );
                if (rankedDataIvemIdListDefinitionResult.isErr()) {
                    const errorCode = ErrorCode.TableRecordSourceDefinitionFactoryService_Watchlist_DefinitionOrNamedExplicitReferenceIsInvalid;
                    return rankedDataIvemIdListDefinitionResult.createOuter(errorCode);
                } else {
                    const rankedDataIvemIdListDefinition = rankedDataIvemIdListDefinitionResult.value;

                    switch (rankedDataIvemIdListDefinition.typeId) {
                        case RankedDataIvemIdListDefinition.TypeId.DataIvemIdArray: {
                            const definition = new WatchlistTableRecordSourceDefinition(
                                this._customHeadings,
                                this.tableFieldSourceDefinitionCachingFactory,
                                rankedDataIvemIdListDefinition as DataIvemIdArrayRankedDataIvemIdListDefinition
                            )
                            return new Ok(definition);
                        }
                        case RankedDataIvemIdListDefinition.TypeId.WatchmakerListId:
                            throw new NotImplementedError('TRSDFSRLIILWLII78783');
                        case RankedDataIvemIdListDefinition.TypeId.ScanId:
                            throw new NotImplementedError('TRSDFSRLIILSI78783');
                        case RankedDataIvemIdListDefinition.TypeId.DataIvemIdExecuteScan: {
                            const definition = this.createScanTest(rankedDataIvemIdListDefinition as DataIvemIdExecuteScanRankedDataIvemIdListDefinition);
                            return new Ok(definition);
                        }
                        default:
                            throw new UnreachableCaseError('TRSDFSRLIILU78783', rankedDataIvemIdListDefinition.typeId);
                    }
                }
            }
            case TableRecordSourceDefinition.TypeId.MarketMovers:
                throw new NotImplementedError('TRSDFTCTFJMM3820');
            case TableRecordSourceDefinition.TypeId.Gics:
                throw new NotImplementedError('TRSDFTCTFJG78783');
            case TableRecordSourceDefinition.TypeId.ProfitIvemHolding:
                throw new NotImplementedError('TRSDFTCTFJP18885');
            case TableRecordSourceDefinition.TypeId.CashItemHolding:
                throw new NotImplementedError('TRSDFTCTFJC20098');
            case TableRecordSourceDefinition.TypeId.IntradayProfitLossSymbolRec:
                throw new NotImplementedError('TRSDFTCTFJI11198');
            case TableRecordSourceDefinition.TypeId.TmcDefinitionLegs:
                throw new NotImplementedError('TRSDFTCTFJT99873');
            case TableRecordSourceDefinition.TypeId.TmcLeg:
                throw new NotImplementedError('TRSDFTCTFJT22852');
            case TableRecordSourceDefinition.TypeId.TmcWithLegMatchingUnderlying:
                throw new NotImplementedError('TRSDFTCTFJT75557');
            case TableRecordSourceDefinition.TypeId.CallPutFromUnderlying: {
                const underlyingIvemIdResult = CallPutFromUnderlyingTableRecordSourceDefinition.tryGetUnderlyingIvemIdFromJson(this._marketsService, element);
                if (underlyingIvemIdResult.isErr()) {
                    return underlyingIvemIdResult.createOuter(ErrorCode.TableRecordSourceDefinitionFactoryService_CallPutFromUnderlying_UnderlyingIvemIdIsInvalid);
                } else {
                    const definition = this.createCallPutFromUnderlying(underlyingIvemIdResult.value);
                    return new Ok(definition);
                }
            }
            case TableRecordSourceDefinition.TypeId.HoldingAccountPortfolio:
                throw new NotImplementedError('TRSDFTCTFJH22321');
            case TableRecordSourceDefinition.TypeId.Feed: {
                const definition = this.createFeed();
                return new Ok(definition);
            }
            case TableRecordSourceDefinition.TypeId.BrokerageAccount: {
                const definition = this.createBrokerageAccount();
                return new Ok(definition);
            }
            case TableRecordSourceDefinition.TypeId.Order: {
                const group = BrokerageAccountGroupTableRecordSourceDefinition.getBrokerageAccountGroupFromJson(this._marketsService, element);
                const definition = this.createOrder(group);
                return new Ok(definition);
            }
            case TableRecordSourceDefinition.TypeId.Holding: {
                const group = BrokerageAccountGroupTableRecordSourceDefinition.getBrokerageAccountGroupFromJson(this._marketsService, element);
                const definition = this.createHolding(group);
                return new Ok(definition);
            }
            case TableRecordSourceDefinition.TypeId.Balances: {
                const group = BrokerageAccountGroupTableRecordSourceDefinition.getBrokerageAccountGroupFromJson(this._marketsService, element);
                const definition = this.createBalances(group);
                return new Ok(definition);
            }
            case TableRecordSourceDefinition.TypeId.TopShareholder: {
                const createParametersResult = TopShareholderTableRecordSourceDefinition.tryGetCreateParametersFromJson(this._marketsService, element);
                if (createParametersResult.isErr()) {
                    return createParametersResult.createOuter(ErrorCode.TableRecordSourceDefinitionFactoryService_TopShareholder_CreateParametersError);
                } else {
                    const { dataIvemId, tradingDate, compareToTradingDate } = createParametersResult.value;
                    const definition = this.createTopShareholder(dataIvemId, tradingDate, compareToTradingDate);
                    return new Ok(definition);
                }
            }
            case TableRecordSourceDefinition.TypeId.EditableColumnLayoutDefinitionColumn: {
                throw new AssertInternalError('TRSDFSTCTFJEGLDC45550', 'outside');
            }
            case TableRecordSourceDefinition.TypeId.Scan: {
                const definition = this.createScan();
                return new Ok(definition);
            }
            case TableRecordSourceDefinition.TypeId.RankedDataIvemIdListDirectoryItem: {
                // currently not supported
                const locker: LockOpenListItem.Locker = {
                    lockerName: 'Unsupport JSON TableRecordSourceDefinition'
                };
                const emptyRankedLitItemListDirectory = new RankedDataIvemIdListDirectory([], locker);
                const definition = this.createRankedDataIvemIdListDirectoryItem(emptyRankedLitItemListDirectory);
                return new Ok(definition);
            }
            case TableRecordSourceDefinition.TypeId.GridField: {
                const definition = this.createGridField([]); // persistence not implemented
                return new Ok(definition);
            }
            case TableRecordSourceDefinition.TypeId.ScanFieldEditorFrame: {
                throw new AssertInternalError('TRSDFSTCTFJSFEF45550', 'legacy');
            }
            case TableRecordSourceDefinition.TypeId.ScanEditorAttachedNotificationChannel: {
                throw new AssertInternalError('TRSDFSTCTFJSEANC45550', 'legacy');
            }
            case TableRecordSourceDefinition.TypeId.LockOpenNotificationChannelList: {
                throw new AssertInternalError('TRSDFSTCTFLONCL45550', 'legacy');
            }
            case TableRecordSourceDefinition.TypeId.ExchangeEnvironmentList: {
                throw new AssertInternalError('LTRSDFSTCFJATIEE45550', 'legacy');
            }
            case TableRecordSourceDefinition.TypeId.ExchangeList: {
                throw new AssertInternalError('LTRSDFSTCFJATIE45550', 'legacy');
            }
            case TableRecordSourceDefinition.TypeId.TradingMarketList: {
                throw new AssertInternalError('LTRSDFSTCFJATITM45550', 'legacy');
            }
            case TableRecordSourceDefinition.TypeId.DataMarketList: {
                throw new AssertInternalError('LTRSDFSTCFJATIDM45550', 'legacy');
            }
            case TableRecordSourceDefinition.TypeId.MarketBoardList: {
                throw new AssertInternalError('LTRSDFSTCFJATIMB45550', 'legacy');
            }
            default:
                throw new UnreachableCaseError('TDLFCFTID17742', typeId);
        }
    }
}
