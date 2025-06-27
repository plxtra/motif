import { Market, MarketIvemId } from '../adi';
import { MarketIvemIdParseDetails } from './market-ivem-id-parse-details-api';
import { UiAction } from './ui-action-api';

/** @public */
export interface MarketIvemIdUiAction<T extends Market> extends UiAction {
    readonly value: MarketIvemId<T> | undefined;
    readonly definedValue: MarketIvemId<T>;
    readonly parseDetails: MarketIvemIdParseDetails<T> | undefined;

    pushValue(value: MarketIvemId<T> | undefined): void;
}
