import { BrokerageAccountGroup } from '../adi';
import { UiAction } from './ui-action-api';

/** @public */
export interface BrokerageAccountGroupUiAction extends UiAction {
    readonly value: BrokerageAccountGroup | undefined;
    readonly definedValue: BrokerageAccountGroup;
    readonly options: BrokerageAccountGroupUiAction.Options;

    pushValue(value: BrokerageAccountGroup | undefined): void;
    pushOptions(options: BrokerageAccountGroupUiAction.Options): void;
}

/** @public */
export namespace BrokerageAccountGroupUiAction {
    export interface Options {
        allAllowed: boolean;
    }
}
