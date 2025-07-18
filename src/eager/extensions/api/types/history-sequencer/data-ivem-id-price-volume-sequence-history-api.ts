import { DataIvemId } from '../adi/symbol-id/data-ivem-id-api';
import { HistorySequenceSeries } from './history-sequence-series-api';
import { HistorySequencer } from './history-sequencer-api';
import { SequenceHistory } from './sequence-history-api';

/** @public */
export interface DataIvemIdPriceVolumeSequenceHistory extends SequenceHistory {

    readonly active: boolean;
    readonly dataIvemId: DataIvemId;

    registerSeries(series: HistorySequenceSeries, seriesType: DataIvemIdPriceVolumeSequenceHistory.SeriesType): void;
    deregisterSeries(series: HistorySequenceSeries, seriesType: DataIvemIdPriceVolumeSequenceHistory.SeriesType): void;

    activate(dataIvemId: DataIvemId): void;

    setSequencer(sequencer: HistorySequencer | undefined): void;
}

/** @public */
export namespace DataIvemIdPriceVolumeSequenceHistory {
    export const enum SeriesTypeEnum {
        Price = 'Price',
        Volume = 'Volume',
    }
    export type SeriesType = keyof typeof SeriesTypeEnum;
}
