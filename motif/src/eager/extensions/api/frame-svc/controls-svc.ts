import {
    BrokerageAccountGroupSelect,
    BuiltinIconButton,
    Button,
    CaptionedCheckbox,
    Checkbox,
    Command,
    ControlComponent,
    DataIvemIdSelect,
    DataMarketSelect,
    DateInput,
    DecimalInput,
    IntegerInput,
    NumberInput,
    TradingIvemIdSelect,
    TradingMarketSelect,
    UiAction
} from '../types';

/** @public */
export interface ControlsSvc {
    readonly controls: readonly ControlComponent[];
    readonly uiActions: readonly UiAction[];

    destroyAllControls(): void;
    destroyControl(control: UiAction | ControlComponent): void;

    createButton(command: Command): Promise<Button>;
    createBuiltinIconButton(command: Command): Promise<BuiltinIconButton>;
    createCaptionedCheckbox(valueRequired?: boolean): Promise<CaptionedCheckbox>;
    createCheckbox(valueRequired?: boolean): Promise<Checkbox>;
    createIntegerInput(valueRequired?: boolean): Promise<IntegerInput>;
    createNumberInput(valueRequired?: boolean): Promise<NumberInput>;
    createDecimalInput(valueRequired?: boolean): Promise<DecimalInput>;
    createDateInput(valueRequired?: boolean): Promise<DateInput>;
    createBrokerageAccountGroupSelect(valueRequired?: boolean): Promise<BrokerageAccountGroupSelect>;
    createDataIvemIdSelect(valueRequired?: boolean, defaultExchangeEnvironmentMarketsOnly?: boolean): Promise<DataIvemIdSelect>;
    createTradingIvemIdSelect(valueRequired?: boolean, defaultExchangeEnvironmentMarketsOnly?: boolean): Promise<TradingIvemIdSelect>;
    createDataMarketSelect(valueRequired?: boolean, defaultExchangeEnvironmentMarketsOnly?: boolean): Promise<DataMarketSelect>;
    createTradingMarketSelect(valueRequired?: boolean, defaultExchangeEnvironmentMarketsOnly?: boolean): Promise<TradingMarketSelect>;
}
