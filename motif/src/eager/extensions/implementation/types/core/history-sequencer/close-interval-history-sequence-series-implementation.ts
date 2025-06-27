import { CloseIntervalHistorySequenceSeries } from '@plxtra/motif-core';
import {
    CloseIntervalHistorySequenceSeries as CloseIntervalHistorySequenceSeriesApi, Integer as IntegerApi
} from '../../../../api';
import { IntervalHistorySequenceSeriesImplementation } from './interval-history-sequence-series-implementation';

export class CloseIntervalHistorySequenceSeriesImplementation extends IntervalHistorySequenceSeriesImplementation
    implements CloseIntervalHistorySequenceSeriesApi
// eslint-disable-next-line brace-style
{
    constructor(private readonly _actual: CloseIntervalHistorySequenceSeries) {
        super();
    }

    get actual() { return this._actual; }

    getNumberPoint(idx: IntegerApi): CloseIntervalHistorySequenceSeriesApi.Point {
        return this._actual.getNumberPoint(idx);
    }
}

export namespace CloseIntervalHistorySequenceSeriesImplementation {
    export function toApi(actual: CloseIntervalHistorySequenceSeries) {
        return new CloseIntervalHistorySequenceSeriesImplementation(actual);
    }

    export function fromApi(value: CloseIntervalHistorySequenceSeriesApi) {
        const implementation = value as CloseIntervalHistorySequenceSeriesImplementation;
        return implementation.actual;
    }
}
