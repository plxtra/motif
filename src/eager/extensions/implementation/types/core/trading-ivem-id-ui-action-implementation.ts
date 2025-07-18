import { TradingIvemIdUiAction } from '@plxtra/motif-core';
import { TradingIvemId as TradingIvemIdApi, TradingIvemIdUiAction as TradingIvemIdUiActionApi } from '../../../api';
import { TradingIvemIdImplementation } from '../adi/internal-api';
import { TradingIvemIdParseDetailsImplementation } from './trading-ivem-id-parse-details-implementation';
import { UiActionImplementation } from './ui-action-api-implementation';

export class TradingIvemIdUiActionImplementation extends UiActionImplementation implements TradingIvemIdUiActionApi {
    constructor(private readonly _tradingIvemIdActual: TradingIvemIdUiAction) {
        super(_tradingIvemIdActual);
    }

    get tradingIvemIdActual() { return this._tradingIvemIdActual; }

    get value() {
        const tradingIvemId = this._tradingIvemIdActual.value;
        if (tradingIvemId === undefined) {
            return undefined;
        } else {
            return TradingIvemIdImplementation.toApi(tradingIvemId);
        }
    }

    get definedValue() {
        const tradingIvemId = this._tradingIvemIdActual.definedValue;
        return TradingIvemIdImplementation.toApi(tradingIvemId);
    }

    get parseDetails() {
        const parseDetails = this._tradingIvemIdActual.parseDetails;
        if (parseDetails === undefined) {
            return undefined;
        } else {
            return TradingIvemIdParseDetailsImplementation.toApi(parseDetails);
        }
    }

    public pushValue(value: TradingIvemIdApi | undefined) {
        const tradingIvemId = value === undefined ? undefined : TradingIvemIdImplementation.fromApi(value);
        this._tradingIvemIdActual.pushValue(tradingIvemId);
    }
}
