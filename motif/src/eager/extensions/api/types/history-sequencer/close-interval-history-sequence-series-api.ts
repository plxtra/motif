import { Integer } from '../sys';
import { IntervalHistorySequenceSeries } from './interval-history-sequence-series-api';
import { NumberHistorySequenceSeriesInterface } from './number-history-sequence-series-interface-api';

/** @public */
export interface CloseIntervalHistorySequenceSeries extends IntervalHistorySequenceSeries, NumberHistorySequenceSeriesInterface {
}

/** @public */
export namespace CloseIntervalHistorySequenceSeries {
    export interface Point extends IntervalHistorySequenceSeries.Point {
        closeDateTime: Date;
        closeDateTimeRepeatCount: Integer;
        value: number;
    }
}
