import { TradingIvemIdUiAction } from '@plxtra/motif-core';
import { TradingIvemIdSelect as TradingIvemIdSelectApi } from '../../../api';
import { FactoryComponent, FactoryComponentRef } from '../component/internal-api';
import { TradingIvemIdUiActionImplementation } from '../core/internal-api';

export class TradingIvemIdSelectImplementation extends TradingIvemIdUiActionImplementation implements TradingIvemIdSelectApi, FactoryComponent {
    constructor(private readonly _factoryComponentRef: FactoryComponentRef, uiAction: TradingIvemIdUiAction) {
        super(uiAction);
    }

    get factoryComponentRef() { return this._factoryComponentRef; }
    get rootHtmlElement() { return this._factoryComponentRef.rootHtmlElement; }
}
