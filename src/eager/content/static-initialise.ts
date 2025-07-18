import { ColorControlsComponentModule } from './color-controls/ng-api';
import { DataMarketTableFieldSourceDefinitionModule } from './data-markets/internal-api';
import { ExchangeEnvironmentTableFieldSourceDefinitionModule } from './exchange-environments/internal-api';
import { LockOpenNotificationChannelTableFieldSourceDefinitionModule } from './lock-open-notification-channels/internal-api';
import { ResultOrderRequestStepFrameModule } from './order-request-step/internal-api';
import {
    LockerScanAttachedNotificationChannelTableFieldSourceDefinitionModule,
    ScanFieldEditorFrameTableFieldSourceDefinitionModule,
} from './scan/internal-api';
import {
    ConditionSetScanFormulaViewNgComponentModule,
    FormulaScanPropertiesSectionNgComponentModule,
    ScanTargetsNgComponentModule
} from './scan/ng-api';
import { TradingMarketTableFieldSourceDefinitionModule } from './trading-markets/internal-api';

export namespace StaticInitialise {
    export function initialise() {
        ColorControlsComponentModule.initialiseStatic();
        ResultOrderRequestStepFrameModule.initialiseStatic();
        FormulaScanPropertiesSectionNgComponentModule.initialiseStatic();
        ScanTargetsNgComponentModule.initialiseStatic();
        ConditionSetScanFormulaViewNgComponentModule.initialiseStatic();
        ScanFieldEditorFrameTableFieldSourceDefinitionModule.initialiseStatic();
        LockerScanAttachedNotificationChannelTableFieldSourceDefinitionModule.initialiseStatic();
        LockOpenNotificationChannelTableFieldSourceDefinitionModule.initialiseStatic();
        ExchangeEnvironmentTableFieldSourceDefinitionModule.initialiseStatic();
        DataMarketTableFieldSourceDefinitionModule.initialiseStatic();
        TradingMarketTableFieldSourceDefinitionModule.initialiseStatic();
    }
}
