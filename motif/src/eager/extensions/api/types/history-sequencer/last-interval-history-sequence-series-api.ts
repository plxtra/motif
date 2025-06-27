import { Integer } from '../sys';
import { IntervalHistorySequenceSeries } from './interval-history-sequence-series-api';
import { NumberHistorySequenceSeriesInterface } from './number-history-sequence-series-interface-api';

/** @public */
export interface LastIntervalHistorySequenceSeries extends IntervalHistorySequenceSeries, NumberHistorySequenceSeriesInterface {
}

/** @public */
export namespace LastIntervalHistorySequenceSeries {
    export interface Point extends IntervalHistorySequenceSeries.Point {
        previousIntervalCloseDateTime: Date;
        previousIntervalCloseDateTimeRepeatCount: Integer;
        value: number;
    }
}
