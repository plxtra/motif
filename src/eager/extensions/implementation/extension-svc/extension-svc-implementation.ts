import { DecimalFactory } from '@pbkware/js-utils';
import { AdiService, AppStorageService, CommandRegisterService, MarketsService, RegisteredExtension, SymbolsService } from '@plxtra/motif-core';
import { MenuBarService } from 'controls-internal-api';
import { WorkspaceService } from 'workspace-internal-api';
import { ExtensionSvc } from '../../api';
import {
    BrokerageAccountGroupSvcImplementation,
    DataIvemIdSvcImplementation,
    FeedClassSvcImplementation,
    FeedStatusSvcImplementation,
    IvemIdSvcImplementation,
    MarketsSvcImplementation,
    OrderExtendedSideSvcImplementation,
    OrderRouteSvcImplementation,
    OrderTimeInForceSvcImplementation,
    OrderTypeSvcImplementation,
    SymbolFieldSvcImplementation,
    TradingIvemIdSvcImplementation
} from './adi/internal-api';
import {
    CommandSvcImplementation,
    HistorySequencerSvcImplementation,
    IntervalHistorySequencerSvcImplementation,
    StorageSvcImplementation,
    SymbolSvcImplementation
} from './core/internal-api';
import { ResourcesSvcImplementation } from './resources/internal-api';
import { SelfInfoSvcImplementation } from './self-info/internal-api';
import { BinaryFindSvcImplementation } from './sys/binary-find-svc-implementation';
import {
    ApiErrorSvcImplementation,
    BadnessSvcImplementation,
    CommaTextSvcImplementation,
    CorrectnessSvcImplementation,
    DecimalSvcImplementation,
    JsonSvcImplementation,
    SourceTzOffsetDateSvcImplementation,
    SourceTzOffsetDateTimeSvcImplementation
} from './sys/internal-api';
import { WorkspaceSvcImplementation } from './workspace/internal-api';

export class ExtensionSvcImplementation implements ExtensionSvc {
    private readonly _selfInfoSvc: SelfInfoSvcImplementation;
    private readonly _resourcesSvc: ResourcesSvcImplementation;
    private readonly _apiErrorSvc: ApiErrorSvcImplementation;
    private readonly _decimalSvc: DecimalSvcImplementation;
    private readonly _commaTextSvc: CommaTextSvcImplementation;
    private readonly _correctnessSvc: CorrectnessSvcImplementation;
    private readonly _jsonSvc: JsonSvcImplementation;
    private readonly _binaryFindSvc: BinaryFindSvcImplementation;
    private readonly _sourceTzOffsetDateTimeSvc: SourceTzOffsetDateTimeSvcImplementation;
    private readonly _sourceTzOffsetDateSvc: SourceTzOffsetDateSvcImplementation;
    private readonly _badnessSvc: BadnessSvcImplementation;
    private readonly _marketsSvc: MarketsSvcImplementation;
    private readonly _brokerageAccountGroupSvcImplementation: BrokerageAccountGroupSvcImplementation;
    private readonly _feedClassSvcImplementation: FeedClassSvcImplementation;
    private readonly _feedStatusSvcImplementation: FeedStatusSvcImplementation;
    private readonly _ivemIdSvcImplementation: IvemIdSvcImplementation;
    private readonly _dataIvemIdSvcImplementation: DataIvemIdSvcImplementation;
    private readonly _tradingIvemIdSvcImplementation: TradingIvemIdSvcImplementation;
    private readonly _orderTypeSvcImplementation: OrderTypeSvcImplementation;
    private readonly _orderExtendedSideSvcImplementation: OrderExtendedSideSvcImplementation;
    private readonly _orderTimeInForceSvcImplementation: OrderTimeInForceSvcImplementation;
    private readonly _symbolFieldSvcImplementation: SymbolFieldSvcImplementation;
    private readonly _orderRouteSvcImplementation: OrderRouteSvcImplementation;
    private readonly _commandSvc: CommandSvcImplementation;
    private readonly _historySequencerSvc: HistorySequencerSvcImplementation;
    private readonly _intervalHistorySequencerSvc: IntervalHistorySequencerSvcImplementation;
    private readonly _storageSvc: StorageSvcImplementation;
    private readonly _symbolSvc: SymbolSvcImplementation;
    private readonly _workspaceSvc: WorkspaceSvcImplementation;

    constructor(
        registeredExtension: RegisteredExtension,
        decimalFactory: DecimalFactory,
        adiService: AdiService,
        marketsService: MarketsService,
        commandRegisterService: CommandRegisterService,
        storageService: AppStorageService,
        symbolsService: SymbolsService,
        menuBarService: MenuBarService,
        workspaceService: WorkspaceService,
    ) {
        const handle = registeredExtension.handle;
        this._selfInfoSvc = new SelfInfoSvcImplementation(registeredExtension);
        this._resourcesSvc = new ResourcesSvcImplementation(handle);
        this._apiErrorSvc = new ApiErrorSvcImplementation();
        this._decimalSvc = new DecimalSvcImplementation(decimalFactory);
        this._commaTextSvc = new CommaTextSvcImplementation();
        this._correctnessSvc = new CorrectnessSvcImplementation();
        this._jsonSvc = new JsonSvcImplementation(decimalFactory);
        this._binaryFindSvc = new BinaryFindSvcImplementation();
        this._sourceTzOffsetDateTimeSvc = new SourceTzOffsetDateTimeSvcImplementation();
        this._sourceTzOffsetDateSvc = new SourceTzOffsetDateSvcImplementation();
        this._badnessSvc = new BadnessSvcImplementation();
        this._marketsSvc = new MarketsSvcImplementation(marketsService);
        this._brokerageAccountGroupSvcImplementation = new BrokerageAccountGroupSvcImplementation(marketsService);
        this._feedClassSvcImplementation = new FeedClassSvcImplementation();
        this._feedStatusSvcImplementation = new FeedStatusSvcImplementation();
        this._ivemIdSvcImplementation = new IvemIdSvcImplementation();
        this._dataIvemIdSvcImplementation = new DataIvemIdSvcImplementation();
        this._tradingIvemIdSvcImplementation = new TradingIvemIdSvcImplementation();
        this._orderTypeSvcImplementation = new OrderTypeSvcImplementation();
        this._orderExtendedSideSvcImplementation = new OrderExtendedSideSvcImplementation();
        this._orderTimeInForceSvcImplementation = new OrderTimeInForceSvcImplementation();
        this._symbolFieldSvcImplementation = new SymbolFieldSvcImplementation();
        this._orderRouteSvcImplementation = new OrderRouteSvcImplementation();
        this._commandSvc = new CommandSvcImplementation(handle, commandRegisterService);
        this._historySequencerSvc = new HistorySequencerSvcImplementation(decimalFactory, adiService, symbolsService);
        this._intervalHistorySequencerSvc = new IntervalHistorySequencerSvcImplementation();
        this._storageSvc = new StorageSvcImplementation(registeredExtension, storageService);
        this._symbolSvc = new SymbolSvcImplementation(symbolsService);
        this._workspaceSvc = new WorkspaceSvcImplementation(registeredExtension, workspaceService, commandRegisterService);
    }

    get selfInfoSvc() { return this._selfInfoSvc; }
    get resourcesSvc() { return this._resourcesSvc; }
    get apiErrorSvc() { return this._apiErrorSvc; }
    get decimalSvc() { return this._decimalSvc; }
    get commaTextSvc() { return this._commaTextSvc; }
    get correctnessSvc() { return this._correctnessSvc; }
    get jsonSvc() { return this._jsonSvc; }
    get binaryFindSvc() { return this._binaryFindSvc; }
    get sourceTzOffsetDateTimeSvc() { return this._sourceTzOffsetDateTimeSvc; }
    get sourceTzOffsetDateSvc() { return this._sourceTzOffsetDateSvc; }
    get badnessSvc() { return this._badnessSvc; }
    get marketsSvc() { return this._marketsSvc; }
    get brokerageAccountGroupSvc() { return this._brokerageAccountGroupSvcImplementation; }
    get feedClassSvc() { return this._feedClassSvcImplementation; }
    get feedStatusSvc() { return this._feedStatusSvcImplementation; }
    get ivemIdSvc() { return this._ivemIdSvcImplementation; }
    get dataIvemIdSvc() { return this._dataIvemIdSvcImplementation; }
    get tradingIvemIdSvc() { return this._tradingIvemIdSvcImplementation; }
    get orderTypeSvc() { return this._orderTypeSvcImplementation; }
    get orderExtendedSideSvc() { return this._orderExtendedSideSvcImplementation; }
    get orderTimeInForceSvc() { return this._orderTimeInForceSvcImplementation; }
    get symbolFieldSvc() { return this._symbolFieldSvcImplementation; }
    get orderRouteSvc() { return this._orderRouteSvcImplementation; }
    get commandSvc() { return this._commandSvc; }
    get historySequencerSvc() { return this._historySequencerSvc; }
    get intervalHistorySequencerSvc() { return this._intervalHistorySequencerSvc; }
    get storageSvc() { return this._storageSvc; }
    get symbolSvc() { return this._symbolSvc; }
    get workspaceSvc() { return this._workspaceSvc; }

    destroy() {
        this._selfInfoSvc.destroy();
        this._brokerageAccountGroupSvcImplementation.destroy();
        this._workspaceSvc.destroy();
    }
}
