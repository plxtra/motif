import { UnreachableCaseError } from '@pbkware/js-utils';
import {
    BalancesTableFieldSourceDefinition,
    BrokerageAccountTableFieldSourceDefinition,
    CallOrPutId,
    CallPutSecurityDataItemTableFieldSourceDefinition,
    CallPutTableFieldSourceDefinition,
    DataIvemAlternateCodesTableFieldSourceDefinition,
    DataIvemBaseDetailTableFieldSourceDefinition,
    DataIvemExtendedDetailTableFieldSourceDefinition,
    DataIvemIdTableFieldSourceDefinition,
    EditableColumnLayoutDefinitionColumnTableFieldSourceDefinition,
    FeedTableFieldSourceDefinition,
    GridFieldTableFieldSourceDefinition,
    HoldingTableFieldSourceDefinition,
    MyxDataIvemAttributesTableFieldSourceDefinition,
    OrderTableFieldSourceDefinition,
    RankedDataIvemIdListDirectoryItemTableFieldSourceDefinition,
    RankedDataIvemIdTableFieldSourceDefinition,
    ScanTableFieldSourceDefinition,
    SecurityDataItemTableFieldSourceDefinition,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionFactory,
    TopShareholderTableFieldSourceDefinition
} from '@plxtra/motif-core';
import { DataMarketTableFieldSourceDefinition } from './data-markets/internal-api';
import { ExchangeEnvironmentTableFieldSourceDefinition } from './exchange-environments/grid/internal-api';
import { ExchangeTableFieldSourceDefinition } from './exchanges/internal-api';
import { LockOpenNotificationChannelTableFieldSourceDefinition } from './lock-open-notification-channels/internal-api';
import { MarketBoardTableFieldSourceDefinition } from './market-boards/internal-api';
import { LockerScanAttachedNotificationChannelTableFieldSourceDefinition, ScanFieldEditorFrameTableFieldSourceDefinition } from './scan/internal-api';
import { TradingMarketTableFieldSourceDefinition } from './trading-markets/internal-api';

export class TableFieldSourceDefinitionFactoryService implements TableFieldSourceDefinitionFactory {
    create(typeId: TableFieldSourceDefinition.TypeId): TableFieldSourceDefinition {
        switch (typeId) {
            case TableFieldSourceDefinition.TypeId.ExchangeEnvironment:
                return new ExchangeEnvironmentTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.Exchange:
                return new ExchangeTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.TradingMarket:
                return new TradingMarketTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.DataMarket:
                return new DataMarketTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.MarketBoard:
                return new MarketBoardTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.Feed:
                return new FeedTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.DataIvemId:
                return new DataIvemIdTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.RankedDataIvemId:
                return new RankedDataIvemIdTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.DataIvemBaseDetail:
                return new DataIvemBaseDetailTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.DataIvemExtendedDetail:
                return new DataIvemExtendedDetailTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.DataIvemAlternateCodes:
                return new DataIvemAlternateCodesTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.MyxDataIvemAttributes:
                return new MyxDataIvemAttributesTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.EditableColumnLayoutDefinitionColumn:
                return new EditableColumnLayoutDefinitionColumnTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.SecurityDataItem:
                return new SecurityDataItemTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.BrokerageAccount:
                return new BrokerageAccountTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.Order:
                return new OrderTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.Holding:
                return new HoldingTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.Balances:
                return new BalancesTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.CallPut:
                return new CallPutTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.CallSecurityDataItem:
                return new CallPutSecurityDataItemTableFieldSourceDefinition(CallOrPutId.Call);
            case TableFieldSourceDefinition.TypeId.PutSecurityDataItem:
                return new CallPutSecurityDataItemTableFieldSourceDefinition(CallOrPutId.Put);
            case TableFieldSourceDefinition.TypeId.TopShareholder:
                return new TopShareholderTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.Scan:
                return new ScanTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.RankedDataIvemIdListDirectoryItem:
                return new RankedDataIvemIdListDirectoryItemTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.GridField:
                return new GridFieldTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.ScanFieldEditorFrame:
                return new ScanFieldEditorFrameTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.LockerScanAttachedNotificationChannel:
                return new LockerScanAttachedNotificationChannelTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.LockOpenNotificationChannel:
                return new LockOpenNotificationChannelTableFieldSourceDefinition();

            default:
                throw new UnreachableCaseError('TFSDFSC25051', typeId);
        }
    }

    tryNameToId(name: string): TableFieldSourceDefinition.TypeId | undefined {
        return TableFieldSourceDefinition.Type.tryNameToId(name);
    }
}
