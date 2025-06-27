import { UnreachableCaseError } from '@pbkware/js-utils';
import { SymbolsService } from '@plxtra/motif-core';
import {
    ApiError as ApiErrorApi,
    DataIvemId as DataIvemIdApi,
    Exchange as ExchangeApi,
    IvemId as IvemIdApi,
    Market as MarketApi,
    MarketIvemId as MarketIvemIdApi,
    SymbolSvc,
    TradingIvemId as TradingIvemIdApi
} from '../../../api';
import {
    DataIvemIdImplementation,
    ExchangeImplementation,
    IvemIdImplementation,
    MarketIvemIdImplementation,
    TradingIvemIdImplementation,
    UnreachableCaseApiErrorImplementation
} from '../../types/internal-api';

export class SymbolSvcImplementation implements SymbolSvc {
    constructor(private readonly _symbolsService: SymbolsService) { }

    get defaultExchange() { return ExchangeImplementation.toApi(this._symbolsService.defaultExchange); }
    set defaultExchange(value: ExchangeApi) { this._symbolsService.defaultExchange = ExchangeImplementation.fromApi(value); }
    get exchangeAnnouncerChar() { return this._symbolsService.pscExchangeAnnouncerChar; }
    set exchangeAnnouncerChar(value: string) { this._symbolsService.pscExchangeAnnouncerChar = value; }
    get marketSeparatorChar() { return this._symbolsService.pscMarketAnnouncerChar; }
    set marketSeparatorChar(value: string) { this._symbolsService.pscMarketAnnouncerChar = value; }
    get exchangeHideMode(): SymbolSvc.ExchangeHideMode { return SymbolSvcImplementation.ExchangeHideMode.toApi(this._symbolsService.pscExchangeHideModeId); }
    set exchangeHideMode(value: SymbolSvc.ExchangeHideMode) { this._symbolsService.pscExchangeHideModeId = SymbolSvcImplementation.ExchangeHideMode.fromApi(value); }
    get defaultMarketHidden() { return this._symbolsService.pscDefaultMarketHidden; }
    set defaultMarketHidden(value: boolean) { this._symbolsService.pscDefaultMarketHidden = value; }
    get marketCodeAsLocalWheneverPossible() { return this._symbolsService.pscMarketCodeAsLocalWheneverPossible; }
    set marketCodeAsLocalWheneverPossible(value: boolean) { this._symbolsService.pscMarketCodeAsLocalWheneverPossible = value; }
    get zenithSymbologySupportLevel(): SymbolSvc.ZenithSymbologySupportLevel {
        return SymbolSvcImplementation.ZenithSymbologySupportLevel.toApi(this._symbolsService.zenithSymbologySupportLevelId);
    }
    set zenithSymbologySupportLevel(value: SymbolSvc.ZenithSymbologySupportLevel) {
        this._symbolsService.zenithSymbologySupportLevelId = SymbolSvcImplementation.ZenithSymbologySupportLevel.fromApi(value);
    }

    parseDataIvemId(value: string): SymbolSvc.DataIvemIdParseDetails {
        const parseDetails = this._symbolsService.parseDataIvemId(value);
        const dataIvemId = parseDetails.marketIvemId;

        return {
            marketIvemId: DataIvemIdImplementation.toApi(dataIvemId),
            isZenith: parseDetails.isZenith,
            exchangeValidAndExplicit: parseDetails.exchangeValidAndExplicit,
            marketValidAndExplicit: parseDetails.marketValidAndExplicit,
            errorText: parseDetails.errorText,
            value: parseDetails.value,
        };
    }

    parseTradingIvemId(value: string): SymbolSvc.TradingIvemIdParseDetails {
        const parseDetails = this._symbolsService.parseTradingIvemId(value);
        const tradingIvemId = parseDetails.marketIvemId;

        return {
            marketIvemId: TradingIvemIdImplementation.toApi(tradingIvemId),
            isZenith: parseDetails.isZenith,
            exchangeValidAndExplicit: parseDetails.exchangeValidAndExplicit,
            marketValidAndExplicit: parseDetails.marketValidAndExplicit,
            errorText: parseDetails.errorText,
            value: parseDetails.value,
        };
    }

    parseIvemId(value: string): SymbolSvc.IvemIdParseDetails {
        const parseDetails = this._symbolsService.parseIvemId(value);
        const ivemId = parseDetails.ivemId;

        return {
            errorText: parseDetails.errorText,
            ivemId: IvemIdImplementation.toApi(ivemId),
            isZenith: parseDetails.isZenith,
            exchangeValidAndExplicit: parseDetails.exchangeValidAndExplicit,
            value: parseDetails.value,
        };
    }

    marketIvemIdToDisplay<T extends MarketApi>(marketIvemIdApi: MarketIvemIdApi<T> | undefined) {
        const marketIvemId = marketIvemIdApi === undefined ? undefined : MarketIvemIdImplementation.fromMarketApi(marketIvemIdApi);
        return this._symbolsService.marketIvemIdToDisplay(marketIvemId);
    }

    dataIvemIdToDisplay(dataIvemIdApi: DataIvemIdApi | undefined) {
        const dataIvemId = dataIvemIdApi === undefined ? undefined : DataIvemIdImplementation.fromApi(dataIvemIdApi);
        return this._symbolsService.dataIvemIdToDisplay(dataIvemId);
    }

    tradingIvemIdToDisplay(tradingIvemIdApi: TradingIvemIdApi | undefined) {
        const tradingIvemId = tradingIvemIdApi === undefined ? undefined : TradingIvemIdImplementation.fromApi(tradingIvemIdApi);
        return this._symbolsService.tradingIvemIdToDisplay(tradingIvemId);
    }

    tradingIvemIdToNothingHiddenDisplay(tradingIvemIdApi: TradingIvemIdApi) {
        const tradingIvemId = TradingIvemIdImplementation.fromApi(tradingIvemIdApi);
        return this._symbolsService.tradingIvemIdToNothingHiddenDisplay(tradingIvemId);
    }

    ivemIdToDisplay(ivemIdApi: IvemIdApi | undefined) {
        const ivemId = ivemIdApi === undefined ? undefined : IvemIdImplementation.fromApi(ivemIdApi);
        return this._symbolsService.ivemIdToDisplay(ivemId);
    }

    tryGetDefaultDataIvemIdFromIvemId(ivemIdApi: IvemIdApi) {
        const ivemId = IvemIdImplementation.fromApi(ivemIdApi);
        const dataIvemId = this._symbolsService.tryGetDefaultDataIvemIdFromIvemId(ivemId);
        if (dataIvemId === undefined) {
            return undefined;
        } else {
            return DataIvemIdImplementation.toApi(dataIvemId);
        }
    }

    tryGetDefaultTradingIvemIdFromIvemId(ivemIdApi: IvemIdApi) {
        const ivemId = IvemIdImplementation.fromApi(ivemIdApi);
        const tradingIvemId = this._symbolsService.tryGetDefaultTradingIvemIdFromIvemId(ivemId);
        if (tradingIvemId === undefined) {
            return undefined;
        } else {
            return TradingIvemIdImplementation.toApi(tradingIvemId);
        }
    }

    tryGetBestDataIvemIdFromTradingIvemId(tradingIvemIdApi: TradingIvemIdApi) {
        const tradingIvemId = TradingIvemIdImplementation.fromApi(tradingIvemIdApi);
        const dataIvemId = this._symbolsService.tryGetBestDataIvemIdFromTradingIvemId(tradingIvemId);
        return dataIvemId === undefined ? undefined : DataIvemIdImplementation.toApi(dataIvemId);
    }

    tryGetBestTradingIvemIdFromDataIvemId(dataIvemIdApi: DataIvemIdApi): TradingIvemIdApi | undefined {
        const dataIvemId = DataIvemIdImplementation.fromApi(dataIvemIdApi);
        const tradingIvemId = this._symbolsService.tryGetBestTradingIvemIdFromDataIvemId(dataIvemId);
        return tradingIvemId === undefined ? undefined : TradingIvemIdImplementation.toApi(tradingIvemId);
    }

}

export namespace SymbolSvcImplementation {
    export namespace ExchangeHideMode {
        export function toApi(value: SymbolsService.ExchangeHideModeId): SymbolSvc.ExchangeHideMode {
            switch (value) {
                case SymbolsService.ExchangeHideModeId.Never: return SymbolSvc.ExchangeHideModeEnum.Never;
                case SymbolsService.ExchangeHideModeId.Default: return SymbolSvc.ExchangeHideModeEnum.Default;
                case SymbolsService.ExchangeHideModeId.WheneverPossible: return SymbolSvc.ExchangeHideModeEnum.WheneverPossible;
                default: throw new UnreachableCaseError('SSIEHMTAU81778', value);
            }
        }

        export function fromApi(value: SymbolSvc.ExchangeHideMode): SymbolsService.ExchangeHideModeId {
            const enumValue = value as SymbolSvc.ExchangeHideModeEnum;
            switch (enumValue) {
                case SymbolSvc.ExchangeHideModeEnum.Never: return SymbolsService.ExchangeHideModeId.Never;
                case SymbolSvc.ExchangeHideModeEnum.Default: return SymbolsService.ExchangeHideModeId.Default;
                case SymbolSvc.ExchangeHideModeEnum.WheneverPossible: return SymbolsService.ExchangeHideModeId.WheneverPossible;
                default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidSymbolSvcExchangeHideMode, enumValue);
            }
        }
    }

    export namespace ZenithSymbologySupportLevel {
        export function toApi(value: SymbolsService.ZenithSymbologySupportLevelId): SymbolSvc.ZenithSymbologySupportLevel {
            switch (value) {
                case SymbolsService.ZenithSymbologySupportLevelId.None: return SymbolSvc.ZenithSymbologySupportLevelEnum.None;
                case SymbolsService.ZenithSymbologySupportLevelId.Parse: return SymbolSvc.ZenithSymbologySupportLevelEnum.Parse;
                case SymbolsService.ZenithSymbologySupportLevelId.ParseAndDisplay: return SymbolSvc.ZenithSymbologySupportLevelEnum.ParseAndDisplay;
                default: throw new UnreachableCaseError('SSIEHMTAU81778', value);
            }
        }

        export function fromApi(value: SymbolSvc.ZenithSymbologySupportLevel): SymbolsService.ZenithSymbologySupportLevelId {
            const enumValue = value as SymbolSvc.ZenithSymbologySupportLevelEnum;
            switch (enumValue) {
                case SymbolSvc.ZenithSymbologySupportLevelEnum.None: return SymbolsService.ZenithSymbologySupportLevelId.None;
                case SymbolSvc.ZenithSymbologySupportLevelEnum.Parse: return SymbolsService.ZenithSymbologySupportLevelId.Parse;
                case SymbolSvc.ZenithSymbologySupportLevelEnum.ParseAndDisplay: return SymbolsService.ZenithSymbologySupportLevelId.ParseAndDisplay;
                default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidSymbolSvcZenithSymbologySupportLevel, enumValue);
            }
        }
    }
}
