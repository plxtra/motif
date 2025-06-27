import { UnreachableCaseError } from '@pbkware/js-utils';
import { Market } from '@plxtra/motif-core';
import {
    ApiError as ApiErrorApi,
    Exchange as ExchangeApi,
    ExchangeEnvironment as ExchangeEnvironmentApi,
    Market as MarketApi,
} from '../../../../api';
import { DataMarketApiConstructor, ExchangeApiConstructor, TradingMarketApiConstructor } from '../../constructors';
import { UnreachableCaseApiErrorImplementation } from '../../sys/internal-api';
import { ExchangeEnvironmentImplementation } from './exchange-environment-api-implementation';

export class MarketImplementation<T extends Market> implements MarketApi {
    constructor(
        readonly actual: T,
        protected readonly _exchangeApiConstructor: ExchangeApiConstructor,
        protected readonly _dataMarketApiConstructor: DataMarketApiConstructor,
        protected readonly _tradingMarketApiConstructor: TradingMarketApiConstructor,
    ) { }

    get type(): MarketApi.Type {
        return MarketImplementation.Type.toApi(this.actual.typeId);
    }
    get mapKey(): string { return this.actual.mapKey; }
    get zenithCode(): string { return this.actual.zenithCode; }
    get unenvironmentedZenithCode(): string { return this.actual.unenvironmentedZenithCode; }
    get exchange(): ExchangeApi {
        return new this._exchangeApiConstructor(this.actual.exchange);
    }
    get exchangeEnvironment(): ExchangeEnvironmentApi {
        return ExchangeEnvironmentImplementation.toApi(this.actual.exchangeEnvironment, this._exchangeApiConstructor, this._dataMarketApiConstructor, this._tradingMarketApiConstructor);
    }
    get exchangeEnvironmentIsDefault(): boolean { return this.actual.exchangeEnvironmentIsDefault; }
    get lit(): boolean { return this.actual.lit; }
    get unknown(): boolean { return this.actual.unknown; }
    get display(): string { return this.actual.display; }
    get upperDisplay(): string { return this.actual.upperDisplay; }
    get symbologyCode(): string { return this.actual.symbologyCode; }
    get upperSymbologyCode(): string { return this.actual.upperSymbologyCode; }
    get symbologyExchangeSuffixCode(): string { return this.actual.symbologyExchangeSuffixCode; }
    get upperSymbologyExchangeSuffixCode(): string { return this.actual.upperSymbologyExchangeSuffixCode; }
}

export namespace MarketImplementation {
    export namespace Type {
        export function toApi(value: Market.TypeId): MarketApi.Type {
            switch (value) {
                case Market.TypeId.Data: return MarketApi.TypeEnum.Data;
                case Market.TypeId.Trading: return MarketApi.TypeEnum.Trading;
                default: throw new UnreachableCaseError('MAITTA40112', value);
            }
        }

        export function fromApi(value: MarketApi.Type): Market.TypeId {
            const enumValue = value as MarketApi.TypeEnum;
            switch (enumValue) {
                case MarketApi.TypeEnum.Data: return Market.TypeId.Data;
                case MarketApi.TypeEnum.Trading: return Market.TypeId.Trading;
                default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidMarketType, enumValue);
            }
        }
    }
}
