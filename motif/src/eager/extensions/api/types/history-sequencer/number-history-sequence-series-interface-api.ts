import { Integer } from '../sys';
import { HistorySequenceSeries } from './history-sequence-series-api';
import { HistorySequenceSeriesInterface } from './history-sequence-series-interface-api';
import { HistorySequencer } from './history-sequencer-api';

/** @public */
export interface NumberHistorySequenceSeriesInterface extends HistorySequenceSeriesInterface {
    getSequencerPoint(idx: Integer): HistorySequencer.Point;
    getNumberPoint(idx: Integer): NumberHistorySequenceSeriesInterface.Point;

}

/** @public */
export namespace NumberHistorySequenceSeriesInterface {
    export interface Point extends HistorySequenceSeries.Point {
        value: number;
    }
}
