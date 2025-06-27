import { Command } from '@plxtra/motif-core';
import {
    BrokerageAccountGroupSelect as BrokerageAccountGroupSelectApi,
    BuiltinIconButton as BuiltinIconButtonApi,
    Button as ButtonApi,
    CaptionedCheckbox as CaptionedCheckboxApi,
    Checkbox as CheckboxApi,
    DataIvemIdSelect as DataIvemIdSelectApi,
    DataMarketSelect as DataMarketSelectApi,
    DateInput as DateInputApi,
    DecimalInput as DecimalInputApi,
    IntegerInput as IntegerInputApi,
    NumberInput as NumberInputApi,
    TradingIvemIdSelect as TradingIvemIdSelectApi,
    TradingMarketSelect as TradingMarketSelectApi
} from '../../api';
import { ApiComponentFactory } from './api-component-factory';

export interface ApiControlComponentFactory extends ApiComponentFactory {
    createButton(command: Command): Promise<ButtonApi>;
    createBuiltinIconButton(command: Command): Promise<BuiltinIconButtonApi>;
    createCaptionedCheckbox(valueRequired: boolean | undefined): Promise<CaptionedCheckboxApi>;
    createCheckbox(valueRequired: boolean | undefined): Promise<CheckboxApi>;
    createIntegerInput(valueRequired: boolean | undefined): Promise<IntegerInputApi>;
    createNumberInput(valueRequired: boolean | undefined): Promise<NumberInputApi>;
    createDecimalInput(valueRequired: boolean | undefined): Promise<DecimalInputApi>;
    createDateInput(valueRequired: boolean | undefined): Promise<DateInputApi>;
    createBrokerageAccountGroupSelect(valueRequired: boolean | undefined): Promise<BrokerageAccountGroupSelectApi>;
    createDataIvemIdSelect(valueRequired: boolean | undefined, defaultExchangeEnvironmentMarketsOnly: boolean | undefined): Promise<DataIvemIdSelectApi>;
    createTradingIvemIdSelect(valueRequired: boolean | undefined, defaultExchangeEnvironmentMarketsOnly: boolean | undefined): Promise<TradingIvemIdSelectApi>;
    createDataMarketSelect(valueRequired: boolean | undefined, defaultExchangeEnvironmentMarketsOnly: boolean | undefined): Promise<DataMarketSelectApi>;
    createTradingMarketSelect(valueRequired: boolean | undefined, defaultExchangeEnvironmentMarketsOnly: boolean | undefined): Promise<TradingMarketSelectApi>;
}
