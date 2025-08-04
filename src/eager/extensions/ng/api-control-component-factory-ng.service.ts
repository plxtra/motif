import { ComponentRef, createComponent, EnvironmentInjector, inject, Injectable, Type } from '@angular/core';
import { DecimalFactory } from '@pbkware/js-utils';
import { BooleanUiAction, DateUiAction, DecimalUiAction, IntegerUiAction, NumberUiAction } from '@pbkware/ui-action';
import {
    BrokerageAccountGroupUiAction,
    ButtonUiAction,
    Command,
    DataIvemIdUiAction,
    DataMarketUiAction,
    IconButtonUiAction,
    MarketsService,
    TradingIvemIdUiAction,
    TradingMarketUiAction,
} from '@plxtra/motif-core';
import {
    BrokerageAccountGroupInputNgComponent,
    ButtonInputNgComponent,
    CaptionedCheckboxNgComponent,
    CheckboxInputNgComponent,
    ControlComponentBaseNgDirective,
    DataIvemIdSelectNgComponent,
    DataMarketInputNgComponent,
    DateInputNgComponent,
    DecimalInputNgComponent,
    IntegerTextInputNgComponent,
    NumberInputNgComponent,
    SvgButtonNgComponent,
    TradingIvemIdSelectNgComponent,
    TradingMarketInputNgComponent
} from 'controls-ng-api';
import { DecimalFactoryNgService, MarketsNgService } from '../../component-services/ng-api';
import {
    ApiControlComponentFactory, BrokerageAccountGroupSelectImplementation,
    BuiltinIconButtonImplementation,
    ButtonImplementation,
    CaptionedCheckboxImplementation,
    CheckboxImplementation,
    DataIvemIdSelectImplementation,
    DataMarketSelectImplementation,
    DateInputImplementation,
    DecimalInputImplementation,
    IntegerInputImplementation,
    NumberInputImplementation,
    TradingIvemIdSelectImplementation,
    TradingMarketSelectImplementation
} from '../implementation/internal-api';
import { ApiComponentFactoryServiceBaseNgDirective } from './api-component-factory-service-base-ng.directive';

@Injectable({
    providedIn: 'root',
})
export class ApiControlComponentFactoryNgService extends ApiComponentFactoryServiceBaseNgDirective implements ApiControlComponentFactory {
    private readonly _environmentInjector = inject(EnvironmentInjector);

    private readonly _decimalFactory: DecimalFactory;
    private readonly _marketsService: MarketsService;

    constructor() {
        super();

        const decimalFactoryNgService = inject(DecimalFactoryNgService);
        const marketsNgService = inject(MarketsNgService);

        this._decimalFactory = decimalFactoryNgService.service;
        this._marketsService = marketsNgService.service;
    }

    createButton(command: Command): Promise<ButtonImplementation> {
        const uiAction = new ButtonUiAction(command);
        const factoryComponentRef = this.createFactoryComponentRef(ButtonInputNgComponent);
        const instance = factoryComponentRef.componentRef.instance;
        const implementation = new ButtonImplementation(factoryComponentRef, uiAction);
        if (instance.initialiseReady) {
            instance.initialise(uiAction);
            return Promise.resolve(implementation);
        } else {
            return new Promise(
                (resolve) => {
                    instance.initialiseReadyEventer = () => {
                        factoryComponentRef.componentRef.instance.initialise(uiAction);
                        resolve(implementation);
                    };
                }
            );
        }
    }

    createBuiltinIconButton(command: Command): Promise<BuiltinIconButtonImplementation> {
        const uiAction = new IconButtonUiAction(command);
        const factoryComponentRef = this.createFactoryComponentRef(SvgButtonNgComponent);
        const instance = factoryComponentRef.componentRef.instance;
        const implementation = new BuiltinIconButtonImplementation(factoryComponentRef, uiAction);
        if (instance.initialiseReady) {
            instance.initialise(uiAction);
            return Promise.resolve(implementation);
        } else {
            return new Promise(
                (resolve) => {
                    instance.initialiseReadyEventer = () => {
                        factoryComponentRef.componentRef.instance.initialise(uiAction);
                        resolve(implementation);
                    };
                }
            );
        }
    }

    createCaptionedCheckbox(valueRequired: boolean | undefined): Promise<CaptionedCheckboxImplementation> {
        const uiAction = new BooleanUiAction(valueRequired);
        const factoryComponentRef = this.createFactoryComponentRef(CaptionedCheckboxNgComponent);
        const instance = factoryComponentRef.componentRef.instance;
        const implementation = new CaptionedCheckboxImplementation(factoryComponentRef, uiAction);
        if (instance.initialiseReady) {
            instance.initialise(uiAction);
            return Promise.resolve(implementation);
        } else {
            return new Promise(
                (resolve) => {
                    instance.initialiseReadyEventer = () => {
                        factoryComponentRef.componentRef.instance.initialise(uiAction);
                        resolve(implementation);
                    };
                }
            );
        }
    }

    createCheckbox(valueRequired: boolean | undefined): Promise<CheckboxImplementation> {
        const uiAction = new BooleanUiAction(valueRequired);
        const factoryComponentRef = this.createFactoryComponentRef(CheckboxInputNgComponent);
        const instance = factoryComponentRef.componentRef.instance;
        const implementation = new CheckboxImplementation(factoryComponentRef, uiAction);
        if (instance.initialiseReady) {
            instance.initialise(uiAction);
            return Promise.resolve(implementation);
        } else {
            return new Promise(
                (resolve) => {
                    instance.initialiseReadyEventer = () => {
                        factoryComponentRef.componentRef.instance.initialise(uiAction);
                        resolve(implementation);
                    };
                }
            );
        }
    }

    createIntegerInput(valueRequired: boolean | undefined): Promise<IntegerInputImplementation> {
        const uiAction = new IntegerUiAction(valueRequired);
        const factoryComponentRef = this.createFactoryComponentRef(IntegerTextInputNgComponent);
        const instance = factoryComponentRef.componentRef.instance;
        const implementation = new IntegerInputImplementation(factoryComponentRef, uiAction);
        if (instance.initialiseReady) {
            instance.initialise(uiAction);
            return Promise.resolve(implementation);
        } else {
            return new Promise(
                (resolve) => {
                    instance.initialiseReadyEventer = () => {
                        factoryComponentRef.componentRef.instance.initialise(uiAction);
                        resolve(implementation);
                    };
                }
            );
        }
    }

    createNumberInput(valueRequired: boolean | undefined): Promise<NumberInputImplementation> {
        const uiAction = new NumberUiAction(valueRequired);
        const factoryComponentRef = this.createFactoryComponentRef(NumberInputNgComponent);
        const instance = factoryComponentRef.componentRef.instance;
        const implementation = new NumberInputImplementation(factoryComponentRef, uiAction);
        if (instance.initialiseReady) {
            instance.initialise(uiAction);
            return Promise.resolve(implementation);
        } else {
            return new Promise(
                (resolve) => {
                    instance.initialiseReadyEventer = () => {
                        factoryComponentRef.componentRef.instance.initialise(uiAction);
                        resolve(implementation);
                    };
                }
            );
        }
    }

    createDecimalInput(valueRequired: boolean | undefined): Promise<DecimalInputImplementation> {
        const uiAction = new DecimalUiAction(this._decimalFactory, valueRequired);
        const factoryComponentRef = this.createFactoryComponentRef(DecimalInputNgComponent);
        const instance = factoryComponentRef.componentRef.instance;
        const implementation = new DecimalInputImplementation(factoryComponentRef, uiAction);
        if (instance.initialiseReady) {
            instance.initialise(uiAction);
            return Promise.resolve(implementation);
        } else {
            return new Promise(
                (resolve) => {
                    instance.initialiseReadyEventer = () => {
                        factoryComponentRef.componentRef.instance.initialise(uiAction);
                        resolve(implementation);
                    };
                }
            );
        }
    }

    createDateInput(valueRequired: boolean | undefined): Promise<DateInputImplementation> {
        const uiAction = new DateUiAction(valueRequired);
        const factoryComponentRef = this.createFactoryComponentRef(DateInputNgComponent);
        const instance = factoryComponentRef.componentRef.instance;
        const implementation = new DateInputImplementation(factoryComponentRef, uiAction);
        if (instance.initialiseReady) {
            instance.initialise(uiAction);
            return Promise.resolve(implementation);
        } else {
            return new Promise(
                (resolve) => {
                    instance.initialiseReadyEventer = () => {
                        factoryComponentRef.componentRef.instance.initialise(uiAction);
                        resolve(implementation);
                    };
                }
            );
        }
    }

    createBrokerageAccountGroupSelect(valueRequired: boolean | undefined): Promise<BrokerageAccountGroupSelectImplementation> {
        const uiAction = new BrokerageAccountGroupUiAction(valueRequired);
        const factoryComponentRef = this.createFactoryComponentRef(BrokerageAccountGroupInputNgComponent);
        const instance = factoryComponentRef.componentRef.instance;
        const implementation = new BrokerageAccountGroupSelectImplementation(factoryComponentRef, uiAction);
        if (instance.initialiseReady) {
            instance.initialise(uiAction);
            return Promise.resolve(implementation);
        } else {
            return new Promise(
                (resolve) => {
                    instance.initialiseReadyEventer = () => {
                        factoryComponentRef.componentRef.instance.initialise(uiAction);
                        resolve(implementation);
                    };
                }
            );
        }
    }

    createDataIvemIdSelect(valueRequired: boolean | undefined, defaultExchangeEnvironmentMarketsOnly: boolean | undefined): Promise<DataIvemIdSelectImplementation> {
        const markets = defaultExchangeEnvironmentMarketsOnly ? this._marketsService.defaultExchangeEnvironmentDataMarkets : this._marketsService.dataMarkets;
        const uiAction = new DataIvemIdUiAction(markets, valueRequired);
        const factoryComponentRef = this.createFactoryComponentRef(DataIvemIdSelectNgComponent);
        const instance = factoryComponentRef.componentRef.instance;
        const implementation = new DataIvemIdSelectImplementation(factoryComponentRef, uiAction);
        if (instance.initialiseReady) {
            instance.initialise(uiAction);
            return Promise.resolve(implementation);
        } else {
            return new Promise(
                (resolve) => {
                    instance.initialiseReadyEventer = () => {
                        factoryComponentRef.componentRef.instance.initialise(uiAction);
                        resolve(implementation);
                    };
                }
            );
        }
    }

    createTradingIvemIdSelect(valueRequired: boolean | undefined, defaultExchangeEnvironmentMarketsOnly: boolean | undefined): Promise<TradingIvemIdSelectImplementation> {
        const markets = defaultExchangeEnvironmentMarketsOnly ? this._marketsService.defaultExchangeEnvironmentTradingMarkets : this._marketsService.tradingMarkets;
        const uiAction = new TradingIvemIdUiAction(markets, valueRequired);
        const factoryComponentRef = this.createFactoryComponentRef(TradingIvemIdSelectNgComponent);
        const instance = factoryComponentRef.componentRef.instance;
        const implementation = new TradingIvemIdSelectImplementation(factoryComponentRef, uiAction);
        if (instance.initialiseReady) {
            instance.initialise(uiAction);
            return Promise.resolve(implementation);
        } else {
            return new Promise(
                (resolve) => {
                    instance.initialiseReadyEventer = () => {
                        factoryComponentRef.componentRef.instance.initialise(uiAction);
                        resolve(implementation);
                    };
                }
            );
        }
    }

    createDataMarketSelect(valueRequired: boolean | undefined, defaultExchangeEnvironmentMarketsOnly: boolean | undefined): Promise<DataMarketSelectImplementation> {
        const markets = defaultExchangeEnvironmentMarketsOnly ? this._marketsService.defaultExchangeEnvironmentDataMarkets : this._marketsService.dataMarkets;
        const uiAction = new DataMarketUiAction(markets, valueRequired);
        const factoryComponentRef = this.createFactoryComponentRef(DataMarketInputNgComponent);
        const instance = factoryComponentRef.componentRef.instance;
        const implementation = new DataMarketSelectImplementation(factoryComponentRef, uiAction);
        if (instance.initialiseReady) {
            instance.initialise(uiAction);
            return Promise.resolve(implementation);
        } else {
            return new Promise(
                (resolve) => {
                    instance.initialiseReadyEventer = () => {
                        factoryComponentRef.componentRef.instance.initialise(uiAction);
                        resolve(implementation);
                    };
                }
            );
        }
    }

    createTradingMarketSelect(valueRequired: boolean | undefined, defaultExchangeEnvironmentMarketsOnly: boolean | undefined): Promise<TradingMarketSelectImplementation> {
        const markets = defaultExchangeEnvironmentMarketsOnly ? this._marketsService.defaultExchangeEnvironmentTradingMarkets : this._marketsService.tradingMarkets;
        const uiAction = new TradingMarketUiAction(markets, valueRequired);
        const factoryComponentRef = this.createFactoryComponentRef(TradingMarketInputNgComponent);
        const instance = factoryComponentRef.componentRef.instance;
        const implementation = new TradingMarketSelectImplementation(factoryComponentRef, uiAction);
        if (instance.initialiseReady) {
            instance.initialise(uiAction);
            return Promise.resolve(implementation);
        } else {
            return new Promise(
                (resolve) => {
                    instance.initialiseReadyEventer = () => {
                        factoryComponentRef.componentRef.instance.initialise(uiAction);
                        resolve(implementation);
                    };
                }
            );
        }
    }

    private createFactoryComponentRef<T extends ControlComponentBaseNgDirective>(componentType: Type<T>) {
        const componentRef = this.createControl(componentType);
        return new ApiControlComponentFactoryNgService.ControlFactoryComponentRefImplementation(componentRef);
    }

    private createControl<T extends ControlComponentBaseNgDirective>(componentType: Type<T>) {
        const componentRef = createComponent(componentType, { environmentInjector: this._environmentInjector } );
        this.appRef.attachView(componentRef.hostView);
        return componentRef;
    }
}

export namespace ApiControlComponentFactoryNgService {
    export class ControlFactoryComponentRefImplementation<T extends ControlComponentBaseNgDirective>
        extends ApiComponentFactoryServiceBaseNgDirective.FactoryComponentRefImplementation {

        constructor(private readonly _componentRef: ComponentRef<T>) {
            super();
        }

        get componentRef() { return this._componentRef; }
    }
}
