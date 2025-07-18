import { Market, MarketIvemId } from '../adi';

/** @public */
export interface MarketIvemIdParseDetails<T extends Market> {
    readonly marketIvemId: MarketIvemId<T>;
    readonly exchangeValidAndExplicit: boolean;
    readonly marketValidAndExplicit: boolean;
    readonly errorText: string | undefined;
    readonly parseText: string;
}

