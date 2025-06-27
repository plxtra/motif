import { DecimalFactory } from '@pbkware/js-utils';
import {
    AccumulationIntervalHistorySequenceSeries, AdiService, CloseIntervalHistorySequenceSeries,
    CurrentRepeatableExactHistorySequenceSeries,
    DataIvemIdPriceVolumeSequenceHistory,
    HistorySequencer,
    IntervalHistorySequencer,
    LastIntervalHistorySequenceSeries,
    OhlcIntervalHistorySequenceSeries,
    RepeatableExactHistorySequencer,
    SymbolsService
} from '@plxtra/motif-core';
import {
    DataIvemId as DataIvemIdApi,
    HistorySequencer as HistorySequencerApi,
    HistorySequencerSvc,
    IntervalHistorySequencer as IntervalHistorySequencerApi,
    RepeatableExactHistorySequencer as RepeatableExactHistorySequencerApi
} from '../../../api';
import { HistorySequencerImplementation } from '../../types/core/history-sequencer/history-sequencer-implementation';
import {
    AccumulationIntervalHistorySequenceSeriesImplementation,
    CloseIntervalHistorySequenceSeriesImplementation,
    CurrentRepeatableExactHistorySequenceSeriesImplementation,
    DataIvemIdImplementation,
    DataIvemIdPriceVolumeSequenceHistoryImplementation,
    IntervalHistorySequencerImplementation,
    LastIntervalHistorySequenceSeriesImplementation,
    OhlcIntervalHistorySequenceSeriesImplementation,
    RepeatableExactHistorySequencerImplementation
} from '../../types/internal-api';

export class HistorySequencerSvcImplementation implements HistorySequencerSvc {
    constructor(
        private readonly _decimalFactory: DecimalFactory,
        private readonly _adiService: AdiService,
        private readonly _symbolsService: SymbolsService
    ) { }

    createIntervalHistorySequencer(): IntervalHistorySequencerApi {
        const actual = new IntervalHistorySequencer();
        return IntervalHistorySequencerImplementation.toApi(actual);
    }

    createRepeatableExactHistorySequencer(): RepeatableExactHistorySequencerApi {
        const actual = new RepeatableExactHistorySequencer();
        return RepeatableExactHistorySequencerImplementation.toApi(actual);
    }

    createOhlcIntervalHistorySequenceSeries(sequencer: IntervalHistorySequencerApi) {
        const actualSequencer = IntervalHistorySequencerImplementation.fromApi(sequencer);
        const actual = new OhlcIntervalHistorySequenceSeries(actualSequencer);
        return OhlcIntervalHistorySequenceSeriesImplementation.toApi(actual);
    }

    createCloseIntervalHistorySequenceSeries(sequencer: IntervalHistorySequencerApi) {
        const actualSequencer = IntervalHistorySequencerImplementation.fromApi(sequencer);
        const actual = new CloseIntervalHistorySequenceSeries(actualSequencer);
        return CloseIntervalHistorySequenceSeriesImplementation.toApi(actual);
    }

    createLastIntervalHistorySequenceSeries(sequencer: IntervalHistorySequencerApi) {
        const actualSequencer = IntervalHistorySequencerImplementation.fromApi(sequencer);
        const actual = new LastIntervalHistorySequenceSeries(actualSequencer);
        return LastIntervalHistorySequenceSeriesImplementation.toApi(actual);
    }

    createAccumulationIntervalHistorySequenceSeries(sequencer: IntervalHistorySequencerApi) {
        const actualSequencer = IntervalHistorySequencerImplementation.fromApi(sequencer);
        const actual = new AccumulationIntervalHistorySequenceSeries(actualSequencer);
        return AccumulationIntervalHistorySequenceSeriesImplementation.toApi(actual);
    }

    createCurrentRepeatableExactHistorySequenceSeries(sequencer: RepeatableExactHistorySequencerApi) {
        const actualSequencer = RepeatableExactHistorySequencerImplementation.fromApi(sequencer);
        const actual = new CurrentRepeatableExactHistorySequenceSeries(actualSequencer);
        return CurrentRepeatableExactHistorySequenceSeriesImplementation.toApi(actual);
    }

    createDataIvemIdPriceVolumeSequenceHistory(dataIvemId: DataIvemIdApi) {
        const actualDataIvemId = DataIvemIdImplementation.fromApi(dataIvemId);
        const actual = new DataIvemIdPriceVolumeSequenceHistory(this._decimalFactory, this._symbolsService, this._adiService, actualDataIvemId);
        return DataIvemIdPriceVolumeSequenceHistoryImplementation.toApi(actual);
    }

    typeToJsonValue(value: HistorySequencerApi.TypeEnum): string {
        const typeId = HistorySequencerImplementation.TypeId.fromApi(value);
        return HistorySequencer.Type.idToJsonValue(typeId);
    }

    typeFromJsonValue(value: string): HistorySequencerApi.TypeEnum | undefined {
        const typeId = HistorySequencer.Type.tryJsonValueToId(value as HistorySequencer.Type.JsonValue);
        if (typeId === undefined) {
            return undefined;
        } else {
            return HistorySequencerImplementation.TypeId.toApi(typeId);
        }
    }
}
