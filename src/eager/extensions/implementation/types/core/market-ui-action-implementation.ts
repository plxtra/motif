import { Market, MarketUiAction } from '@plxtra/motif-core';
import { Market as MarketApi, MarketUiAction as MarketUiActionApi } from '../../../api';
import { UiActionImplementation } from './ui-action-api-implementation';

export abstract class MarketUiActionImplementation<T extends MarketApi, A extends Market> extends UiActionImplementation implements MarketUiActionApi<T> {
    constructor(readonly actual: MarketUiAction<A>) {
        super(actual);
    }

    get value(): T | undefined {
        const actual = this.actual.value;
        return actual === undefined ? undefined : this.toApi(actual);
    }
    get definedValue() { return this.toApi(this.actual.definedValue); }
    get allowedValues() { return this.arrayToApi(this.actual.allowedValues); }

    public pushValue(value: T | undefined) {
        const actualMarket = value === undefined ? undefined : this.fromApi(value);
        this.actual.pushValue(actualMarket);
    }

    public pushAllowedValues(allowedValues: readonly T[]) {
        const actualAllowedValues = this.arrayFromApi(allowedValues);
        this.actual.pushAllowedValues(actualAllowedValues);
    }

    protected abstract toApi(value: A): T;
    protected abstract fromApi(value: T): A;
    protected abstract arrayToApi(value: readonly A[]): T[];
    protected abstract arrayFromApi(value: readonly T[]): A[];
}
