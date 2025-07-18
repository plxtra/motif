import { Integer } from '../sys';
import { HistorySequenceSeries } from './history-sequence-series-api';
import { HistorySequenceSeriesInterface } from './history-sequence-series-interface-api';
import { HistorySequencer } from './history-sequencer-api';

/** @public */
export interface OhlcHistorySequenceSeriesInterface extends HistorySequenceSeriesInterface {
    getSequencerPoint(idx: Integer): HistorySequencer.Point;
    getOhlcPoint(idx: Integer): OhlcHistorySequenceSeriesInterface.Point;
}

/** @public */
export namespace OhlcHistorySequenceSeriesInterface {
    export interface Point extends HistorySequenceSeries.Point {
        open: number;
        high: number;
        low: number;
        close: number;
    }
}
