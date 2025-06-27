import {
    AccumulationIntervalHistorySequenceSeries,
    CloseIntervalHistorySequenceSeries,
    CurrentRepeatableExactHistorySequenceSeries,
    DataIvemId,
    DataIvemIdPriceVolumeSequenceHistory,
    HistorySequencer,
    IntervalHistorySequencer,
    LastIntervalHistorySequenceSeries,
    OhlcIntervalHistorySequenceSeries,
    RepeatableExactHistorySequencer
} from '../../types';

/** @public */
export interface HistorySequencerSvc {
    createIntervalHistorySequencer(): IntervalHistorySequencer;
    createRepeatableExactHistorySequencer(): RepeatableExactHistorySequencer;

    createOhlcIntervalHistorySequenceSeries(sequencer: IntervalHistorySequencer): OhlcIntervalHistorySequenceSeries;
    createCloseIntervalHistorySequenceSeries(sequencer: IntervalHistorySequencer): CloseIntervalHistorySequenceSeries;
    createLastIntervalHistorySequenceSeries(sequencer: IntervalHistorySequencer): LastIntervalHistorySequenceSeries;
    createAccumulationIntervalHistorySequenceSeries(sequencer: IntervalHistorySequencer): AccumulationIntervalHistorySequenceSeries;
    createCurrentRepeatableExactHistorySequenceSeries(
        sequencer: RepeatableExactHistorySequencer
    ): CurrentRepeatableExactHistorySequenceSeries;
    createDataIvemIdPriceVolumeSequenceHistory(dataIvemId: DataIvemId): DataIvemIdPriceVolumeSequenceHistory;

    typeToJsonValue(value: HistorySequencer.TypeEnum): string;
    typeFromJsonValue(value: string): HistorySequencer.TypeEnum | undefined;
}
