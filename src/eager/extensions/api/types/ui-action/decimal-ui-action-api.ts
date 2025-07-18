import { Decimal } from '../sys';
import { UiAction } from './ui-action-api';

/** @public */
export interface DecimalUiAction extends UiAction {
    readonly value: Decimal | undefined;
    readonly definedValue: Decimal;
    readonly options: DecimalUiAction.Options;

    pushValue(value: Decimal | undefined): void;
    pushOptions(options: DecimalUiAction.Options): void;
}

/** @public */
export namespace DecimalUiAction {
    export interface Options {
        max?: number;
        min?: number;
        step?: number;
        useGrouping?: boolean;
    }
}
