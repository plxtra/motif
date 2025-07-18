import { JsonElement } from '../../sys';
import { DataMarket, Exchange, ExchangeEnvironment, Market } from '../markets';
import { IvemId } from './ivem-id-api';

/** @public */
export interface MarketIvemId<T extends Market> {
    readonly code: string;
    readonly market: T;
    readonly exchangeEnvironmentExplicit: boolean;

    readonly name: string;
    readonly mapKey: string;
    readonly marketZenithCode: string;

    readonly exchangeEnvironment: ExchangeEnvironment;
    readonly exchange: Exchange;
    readonly bestLitDataIvemId: MarketIvemId<DataMarket> | undefined;

    createCopy(): MarketIvemId<T>;
    createIvemId(): IvemId;
    saveToJson(element: JsonElement): void;
}

/** @public */
export namespace MarketIvemId {
    export type Constructor<T extends Market> = new(code: string, market: T) => MarketIvemId<T>;
}
