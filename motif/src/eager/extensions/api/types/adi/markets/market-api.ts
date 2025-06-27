// eslint-disable-next-line import-x/no-cycle
import { Exchange } from './exchange-api';
// eslint-disable-next-line import-x/no-cycle
import { ExchangeEnvironment } from './exchange-environment-api';

/** @public */
export interface Market {
    readonly type: Market.Type,
    readonly mapKey: string;
    readonly zenithCode: string,
    readonly unenvironmentedZenithCode: string,
    readonly exchange: Exchange,
    readonly exchangeEnvironment: ExchangeEnvironment,
    readonly exchangeEnvironmentIsDefault: boolean;
    readonly lit: boolean,
    readonly unknown: boolean,
    readonly display: string;
    readonly upperDisplay: string;

    readonly symbologyCode: string;
    readonly upperSymbologyCode: string;
    readonly symbologyExchangeSuffixCode: string;
    readonly upperSymbologyExchangeSuffixCode: string;
}

/** @public */
export namespace Market {
    export const enum TypeEnum {
        Data = 'Data',
        Trading = 'Trading',
    }

    export type Type = keyof typeof TypeEnum;
}
