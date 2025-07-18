// import { Integer } from '../../sys/extension-api';
import { HistorySequenceSeries } from './history-sequence-series-api';
import { RepeatableExactHistorySequencer } from './repeatable-exact-history-sequencer-api';

/** @public */
export interface RepeatableExactHistorySequenceSeries extends HistorySequenceSeries {

    readonly repeatableExactSequencer: RepeatableExactHistorySequencer;
    readonly sequencerPoints: RepeatableExactHistorySequencer.PointList;

    // getRepeatableExactHistorySequencerPoint(idx: Integer): RepeatableExactHistorySequencer.Point;
}

/** @public */
export namespace RepeatableExactHistorySequenceSeries {
    export interface Point extends HistorySequenceSeries.Point {
    }
}
