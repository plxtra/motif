import { IntervalHistorySequenceSeries } from '@plxtra/motif-core';
import {
    Integer as IntegerApi,
    IntervalHistorySequenceSeries as IntervalHistorySequenceSeriesApi
} from '../../../../api';
import { HistorySequenceSeriesImplementation } from './history-sequence-series-implementation';
import { IntervalHistorySequencerImplementation } from './interval-history-sequencer-implementation';

export abstract class IntervalHistorySequenceSeriesImplementation extends HistorySequenceSeriesImplementation
    implements IntervalHistorySequenceSeriesApi {

    get intervalSequencer() { return IntervalHistorySequencerImplementation.toApi(this.actual.intervalSequencer); }
    get sequencerPoints() { return IntervalHistorySequencerImplementation.PointList.toApi(this.actual.sequencerPoints); }

    abstract override get actual(): IntervalHistorySequenceSeries;

    getSequencerPoint(idx: IntegerApi) {
        return this.actual.getSequencerPoint(idx);
    }
}
