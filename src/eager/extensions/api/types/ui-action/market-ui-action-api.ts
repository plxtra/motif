import { Market } from '../adi';
import { UiAction } from './ui-action-api';

/** @public */
export interface MarketUiAction<T extends Market> extends UiAction {
    readonly value: T | undefined;
    readonly definedValue: T;
    readonly allowedValues: readonly T[];

    pushValue(value: T | undefined): void;
    pushAllowedValues(value: readonly T[]): void;
}
