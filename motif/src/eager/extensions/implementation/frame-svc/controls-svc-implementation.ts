import { AssertInternalError, getErrorMessage, Integer } from '@pbkware/js-utils';
import {
    ApiError as ApiErrorApi,
    BrokerageAccountGroupSelect as BrokerageAccountGroupSelectApi,
    BuiltinIconButton as BuiltinIconButtonApi,
    Button as ButtonApi,
    CaptionedCheckbox as CaptionedCheckboxApi,
    Checkbox as CheckboxApi,
    Command as CommandApi,
    ControlComponent as ControlComponentApi,
    ControlsSvc,
    DataIvemIdSelect as DataIvemIdSelectApi,
    DataMarketSelect as DataMarketSelectApi,
    DateInput as DateInputApi,
    DecimalInput as DecimalInputApi,
    IntegerInput as IntegerInputApi,
    NumberInput as NumberInputApi,
    TradingIvemIdSelect as TradingIvemIdSelectApi,
    TradingMarketSelect as TradingMarketSelectApi,
    UiAction as UiActionApi
} from '../../api';
import {
    ApiErrorImplementation,
    CommandImplementation,
    FactoryComponent
} from '../types/internal-api';
import { ApiControlComponentFactory } from './api-control-component-factory';

export class ControlsSvcImplementation implements ControlsSvc {
    private _controls: ControlComponentApi[] = [];
    private _uiActions: UiActionApi[] = [];

    constructor(private readonly _componentFactory: ApiControlComponentFactory) { }

    get controls() { return this._controls; }
    get uiActions() { return this._uiActions; }

    public destroyAllControls() {
        const count = this._controls.length;

        for (let i = count - 1; i >= 0; i--) {
            this.destroyControlAtIndex(i);
        }
    }

    public destroyControl(control: UiActionApi | ControlComponentApi) {
        const uiAction = control as UiActionApi;
        const idx = this._uiActions.indexOf(uiAction);
        if (idx < 0) {
            throw new ApiErrorImplementation(ApiErrorApi.CodeEnum.UnknownControl, `Caption: ${uiAction.caption}`);
        } else {
            this.destroyControlAtIndex(idx);
        }
    }

    public createButton(command: CommandApi): Promise<ButtonApi> {
        const actualCommand = CommandImplementation.fromApi(command);
        const controlPromise = this._componentFactory.createButton(actualCommand);
        return controlPromise.then(
            (controlApi) => {
                this.pushControl(controlApi as ControlComponentApi, controlApi as UiActionApi);
                return Promise.resolve(controlApi);
            },
            (reason: unknown) => Promise.reject(new AssertInternalError(`CSICB377273727: ' + ${getErrorMessage(reason)}`))
        );
    }

    public createBuiltinIconButton(command: CommandApi): Promise<BuiltinIconButtonApi> {
        const actualCommand = CommandImplementation.fromApi(command);
        const controlPromise = this._componentFactory.createBuiltinIconButton(actualCommand);
        return controlPromise.then(
            (controlApi) => {
                this.pushControl(controlApi as ControlComponentApi, controlApi as UiActionApi);
                return Promise.resolve(controlApi);
            },
            (reason: unknown) => Promise.reject(new AssertInternalError(`CSICBIIB377273727: ' + ${getErrorMessage(reason)}`))
        );
    }

    public createCaptionedCheckbox(valueRequired?: boolean): Promise<CaptionedCheckboxApi> {
        const controlPromise = this._componentFactory.createCaptionedCheckbox(valueRequired);
        return controlPromise.then(
            (controlApi) => {
                this.pushControl(controlApi as ControlComponentApi, controlApi as UiActionApi);
                return Promise.resolve(controlApi);
            },
            (reason: unknown) => Promise.reject(new AssertInternalError(`CSICCC377273727: ' + ${getErrorMessage(reason)}`))
        );
    }

    public createCheckbox(valueRequired?: boolean): Promise<CheckboxApi> {
        const controlPromise = this._componentFactory.createCheckbox(valueRequired);
        return controlPromise.then(
            (controlApi) => {
                this.pushControl(controlApi as ControlComponentApi, controlApi as UiActionApi);
                return Promise.resolve(controlApi);
            },
            (reason: unknown) => Promise.reject(new AssertInternalError(`CSICC377273727: ' + ${getErrorMessage(reason)}`))
        );
    }

    public createIntegerInput(valueRequired?: boolean): Promise<IntegerInputApi> {
        const controlPromise = this._componentFactory.createIntegerInput(valueRequired);
        return controlPromise.then(
            (controlApi) => {
                this.pushControl(controlApi as ControlComponentApi, controlApi as UiActionApi);
                return Promise.resolve(controlApi);
            },
            (reason: unknown) => Promise.reject(new AssertInternalError(`CSICII377273727: ' + ${getErrorMessage(reason)}`))
        );
    }

    public createNumberInput(valueRequired?: boolean): Promise<NumberInputApi> {
        const controlPromise = this._componentFactory.createNumberInput(valueRequired);
        return controlPromise.then(
            (controlApi) => {
                this.pushControl(controlApi as ControlComponentApi, controlApi as UiActionApi);
                return Promise.resolve(controlApi);
            },
            (reason: unknown) => Promise.reject(new AssertInternalError(`CSICNI377273727: ' + ${getErrorMessage(reason)}`))
        );
    }

    public createDecimalInput(valueRequired?: boolean): Promise<DecimalInputApi> {
        const controlPromise = this._componentFactory.createDecimalInput(valueRequired);
        return controlPromise.then(
            (controlApi) => {
                this.pushControl(controlApi as ControlComponentApi, controlApi as UiActionApi);
                return Promise.resolve(controlApi);
            },
            (reason: unknown) => Promise.reject(new AssertInternalError(`CSICDEI377273727: ' + ${getErrorMessage(reason)}`))
        );
    }

    public createDateInput(valueRequired?: boolean): Promise<DateInputApi> {
        const controlPromise = this._componentFactory.createDateInput(valueRequired);
        return controlPromise.then(
            (controlApi) => {
                this.pushControl(controlApi as ControlComponentApi, controlApi as UiActionApi);
                return Promise.resolve(controlApi);
            },
            (reason: unknown) => Promise.reject(new AssertInternalError(`CSICDAI377273727: ' + ${getErrorMessage(reason)}`))
        );
    }

    public createBrokerageAccountGroupSelect(valueRequired?: boolean): Promise<BrokerageAccountGroupSelectApi> {
        const controlPromise = this._componentFactory.createBrokerageAccountGroupSelect(valueRequired);
        return controlPromise.then(
            (controlApi) => {
                this.pushControl(controlApi as ControlComponentApi, controlApi as UiActionApi);
                return Promise.resolve(controlApi);
            },
            (reason: unknown) => Promise.reject(new AssertInternalError(`CSICBAGS377273727: ' + ${getErrorMessage(reason)}`))
        );
    }

    public createDataIvemIdSelect(valueRequired?: boolean, defaultExchangeEnvironmentMarketsOnly?: boolean): Promise<DataIvemIdSelectApi> {
        const controlPromise = this._componentFactory.createDataIvemIdSelect(valueRequired, defaultExchangeEnvironmentMarketsOnly);
        return controlPromise.then(
            (controlApi) => {
                this.pushControl(controlApi as ControlComponentApi, controlApi as UiActionApi);
                return Promise.resolve(controlApi);
            },
            (reason: unknown) => Promise.reject(new AssertInternalError(`CSICLIIS377273727: ' + ${getErrorMessage(reason)}`))
        );
    }

    public createTradingIvemIdSelect(valueRequired?: boolean, defaultExchangeEnvironmentMarketsOnly?: boolean): Promise<TradingIvemIdSelectApi> {
        const controlPromise = this._componentFactory.createTradingIvemIdSelect(valueRequired, defaultExchangeEnvironmentMarketsOnly);
        return controlPromise.then(
            (controlApi) => {
                this.pushControl(controlApi as ControlComponentApi, controlApi as UiActionApi);
                return Promise.resolve(controlApi);
            },
            (reason: unknown) => Promise.reject(new AssertInternalError(`CSICRIIS377273727: ' + ${getErrorMessage(reason)}`))
        );
    }

    public createDataMarketSelect(valueRequired?: boolean, defaultExchangeEnvironmentMarketsOnly?: boolean): Promise<DataMarketSelectApi> {
        const controlPromise = this._componentFactory.createDataMarketSelect(valueRequired, defaultExchangeEnvironmentMarketsOnly);
        return controlPromise.then(
            (controlApi) => {
                this.pushControl(controlApi as ControlComponentApi, controlApi as UiActionApi);
                return Promise.resolve(controlApi);
            },
            (reason: unknown) => Promise.reject(new AssertInternalError(`CSICORS377273727: ' + ${getErrorMessage(reason)}`))
        );
    }

    public createTradingMarketSelect(valueRequired?: boolean, defaultExchangeEnvironmentMarketsOnly?: boolean): Promise<TradingMarketSelectApi> {
        const controlPromise = this._componentFactory.createTradingMarketSelect(valueRequired, defaultExchangeEnvironmentMarketsOnly);
        return controlPromise.then(
            (controlApi) => {
                this.pushControl(controlApi as ControlComponentApi, controlApi as UiActionApi);
                return Promise.resolve(controlApi);
            },
            (reason: unknown) => Promise.reject(new AssertInternalError(`CSICORS377273727: ' + ${getErrorMessage(reason)}`))
        );
    }

    private pushControl(control: ControlComponentApi, uiAction: UiActionApi) {
        this._controls.push(control);
        this._uiActions.push(uiAction);
    }

    private destroyControlAtIndex(idx: Integer) {
        const control = this._controls[idx];
        this._controls.splice(idx, 1);
        this._uiActions.splice(idx, 1);
        this._componentFactory.destroyComponent(control as FactoryComponent);
    }
}
