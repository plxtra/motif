import {
    BrokerageAccountGroupSvc,
    DataIvemIdSvc,
    FeedClassSvc,
    FeedStatusSvc,
    IvemIdSvc,
    MarketsSvc,
    OrderExtendedSideSvc,
    OrderRouteSvc,
    OrderTimeInForceSvc,
    OrderTypeSvc,
    SymbolFieldSvc,
    TradingIvemIdSvc
} from './adi';
import { CommandSvc } from './command-svc';
import { StorageSvc } from './storage-svc';
import { SymbolSvc } from './symbol-svc';
import { HistorySequencerSvc, IntervalHistorySequencerSvc } from './history-sequencer';
import { ResourcesSvc } from './resources-svc';
import { SelfInfoSvc } from './self-info-svc';
import {
    ApiErrorSvc,
    BadnessSvc,
    BinaryFindSvc,
    CommaTextSvc,
    CorrectnessSvc,
    DecimalSvc,
    JsonSvc,
    SourceTzOffsetDateSvc,
    SourceTzOffsetDateTimeSvc
} from './sys';
import { WorkspaceSvc } from './workspace-svc';

/** @public */
export interface ExtensionSvc {
    // SelfInfo
    readonly selfInfoSvc: SelfInfoSvc;

    // Resources
    readonly resourcesSvc: ResourcesSvc;

    // Sys
    readonly apiErrorSvc: ApiErrorSvc;
    readonly badnessSvc: BadnessSvc;
    readonly commaTextSvc: CommaTextSvc;
    readonly correctnessSvc: CorrectnessSvc;
    readonly decimalSvc: DecimalSvc;
    readonly jsonSvc: JsonSvc;
    readonly binaryFindSvc: BinaryFindSvc
    readonly sourceTzOffsetDateTimeSvc: SourceTzOffsetDateTimeSvc;
    readonly sourceTzOffsetDateSvc: SourceTzOffsetDateSvc;

    // Markets
    readonly marketsSvc: MarketsSvc;

    // SymbolId
    readonly ivemIdSvc: IvemIdSvc;
    readonly dataIvemIdSvc: DataIvemIdSvc;
    readonly tradingIvemIdSvc: TradingIvemIdSvc;

    // Adi
    readonly brokerageAccountGroupSvc: BrokerageAccountGroupSvc;
    readonly feedClassSvc: FeedClassSvc;
    readonly feedStatusSvc: FeedStatusSvc;
    readonly orderTypeSvc: OrderTypeSvc;
    readonly orderExtendedSideSvc: OrderExtendedSideSvc;
    readonly orderRouteSvc: OrderRouteSvc;
    readonly orderTimeInForceSvc: OrderTimeInForceSvc;
    readonly symbolFieldSvc: SymbolFieldSvc;

    // Core
    readonly commandSvc: CommandSvc;
    readonly historySequencerSvc: HistorySequencerSvc;
    readonly intervalHistorySequencerSvc: IntervalHistorySequencerSvc;
    readonly storageSvc: StorageSvc;
    readonly symbolSvc: SymbolSvc;

    // Workspace
    readonly workspaceSvc: WorkspaceSvc;
}
