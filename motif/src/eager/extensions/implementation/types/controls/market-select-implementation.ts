import { Market, MarketUiAction } from '@plxtra/motif-core';
import { Market as MarketApi, MarketSelect as MarketSelectApi } from '../../../api';
import { FactoryComponent, FactoryComponentRef } from '../component/internal-api';
import { MarketUiActionImplementation } from '../core/internal-api';

export abstract class MarketSelectImplementation<T extends MarketApi, A extends Market> extends MarketUiActionImplementation<T, A> implements MarketSelectApi<T>, FactoryComponent {
    constructor(private readonly _factoryComponentRef: FactoryComponentRef, uiAction: MarketUiAction<A>) {
        super(uiAction);
    }

    get factoryComponentRef() { return this._factoryComponentRef; }
    get rootHtmlElement() { return this._factoryComponentRef.rootHtmlElement; }
}
