import { CurrentRepeatableExactHistorySequenceSeries } from '@plxtra/motif-core';
import {
    CurrentRepeatableExactHistorySequenceSeries as CurrentRepeatableExactHistorySequenceSeriesApi, Integer as IntegerApi
} from '../../../../api';
import { RepeatableExactHistorySequenceSeriesImplementation } from './repeatable-exact-history-sequence-series-implementation';

export class CurrentRepeatableExactHistorySequenceSeriesImplementation extends RepeatableExactHistorySequenceSeriesImplementation
    implements CurrentRepeatableExactHistorySequenceSeriesApi {

    constructor(private readonly _actual: CurrentRepeatableExactHistorySequenceSeries) {
        super();
    }

    get actual() { return this._actual; }

    getNumberPoint(idx: IntegerApi): CurrentRepeatableExactHistorySequenceSeriesApi.Point {
        return this._actual.getNumberPoint(idx);
    }
}

export namespace CurrentRepeatableExactHistorySequenceSeriesImplementation {
    export function toApi(actual: CurrentRepeatableExactHistorySequenceSeries) {
        return new CurrentRepeatableExactHistorySequenceSeriesImplementation(actual);
    }

    export function fromApi(value: CurrentRepeatableExactHistorySequenceSeriesApi) {
        const implementation = value as CurrentRepeatableExactHistorySequenceSeriesImplementation;
        return implementation.actual;
    }
}
