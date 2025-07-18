import { UnreachableCaseError } from '@pbkware/js-utils';
import { DataIvemIdPriceVolumeSequenceHistory } from '@plxtra/motif-core';
import {
    ApiError,
    DataIvemId as DataIvemIdApi,
    DataIvemIdPriceVolumeSequenceHistory as DataIvemIdPriceVolumeSequenceHistoryApi,
    HistorySequencer as HistorySequencerApi,
    HistorySequenceSeries as HistorySequenceSeriesApi
} from '../../../../api';
import { DataIvemIdImplementation } from '../../adi/internal-api';
import { UnreachableCaseApiErrorImplementation } from '../../sys/internal-api';
import { HistorySequenceSeriesImplementation } from './history-sequence-series-implementation';
import { HistorySequencerImplementation } from './history-sequencer-implementation';
import { SequenceHistoryImplementation } from './sequence-history-implementation';

export class DataIvemIdPriceVolumeSequenceHistoryImplementation extends SequenceHistoryImplementation
    implements DataIvemIdPriceVolumeSequenceHistoryApi {

    constructor(private readonly _actual: DataIvemIdPriceVolumeSequenceHistory) {
        super(_actual);
    }

    override get actual() { return this._actual; }

    get active() { return this._actual.active; }
    get dataIvemId() { return DataIvemIdImplementation.toApi(this._actual.dataIvemId); }

    override finalise() {
        this.setSequencer(undefined);
        this.deactivate();

        super.finalise();
    }

    activate(dataIvemIdApi: DataIvemIdApi) {
        const dataIvemId = DataIvemIdImplementation.fromApi(dataIvemIdApi);
        this._actual.activate(dataIvemId);
    }

    deactivate() {
        this._actual.deactivate();
    }

    setSequencer(sequencerApi: HistorySequencerApi | undefined) {
        const sequencer = sequencerApi === undefined ? undefined : HistorySequencerImplementation.baseFromApi(sequencerApi);
        this._actual.setSequencer(sequencer);
    }


    registerSeries(series: HistorySequenceSeriesApi, seriesType: DataIvemIdPriceVolumeSequenceHistoryApi.SeriesType) {
        const actualHistorySequenceSeries = HistorySequenceSeriesImplementation.baseFromApi(series);
        const actualSeriesTypeId = DataIvemIdPriceVolumeSequenceHistoryImplementation.SeriesTypeId.fromApi(seriesType);
        this._actual.registerSeries(actualHistorySequenceSeries, actualSeriesTypeId);
    }

    deregisterSeries(series: HistorySequenceSeriesApi, seriesType: DataIvemIdPriceVolumeSequenceHistoryApi.SeriesType) {
        const actualHistorySequenceSeries = HistorySequenceSeriesImplementation.baseFromApi(series);
        const actualSeriesTypeId = DataIvemIdPriceVolumeSequenceHistoryImplementation.SeriesTypeId.fromApi(seriesType);
        this._actual.deregisterSeries(actualHistorySequenceSeries, actualSeriesTypeId);
    }
}


export namespace DataIvemIdPriceVolumeSequenceHistoryImplementation {
    export function toApi(actual: DataIvemIdPriceVolumeSequenceHistory) {
        return new DataIvemIdPriceVolumeSequenceHistoryImplementation(actual);
    }

    export function fromApi(value: DataIvemIdPriceVolumeSequenceHistoryApi) {
        const implementation = value as DataIvemIdPriceVolumeSequenceHistoryImplementation;
        return implementation.actual;
    }

    export namespace SeriesTypeId {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function toApi(value: DataIvemIdPriceVolumeSequenceHistory.SeriesTypeId) {
            switch (value) {
                case DataIvemIdPriceVolumeSequenceHistory.SeriesTypeId.Price:
                    return DataIvemIdPriceVolumeSequenceHistoryApi.SeriesTypeEnum.Price;
                case DataIvemIdPriceVolumeSequenceHistory.SeriesTypeId.Volume:
                    return DataIvemIdPriceVolumeSequenceHistoryApi.SeriesTypeEnum.Volume;
                default:
                    throw new UnreachableCaseError('LIIPVSHI8555345239', value);

            }
        }

        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function fromApi(value: DataIvemIdPriceVolumeSequenceHistoryApi.SeriesType) {
            const enumValue = value as DataIvemIdPriceVolumeSequenceHistoryApi.SeriesTypeEnum;
            switch (enumValue) {
                case DataIvemIdPriceVolumeSequenceHistoryApi.SeriesTypeEnum.Price: {
                    return DataIvemIdPriceVolumeSequenceHistory.SeriesTypeId.Price;
                }
                case DataIvemIdPriceVolumeSequenceHistoryApi.SeriesTypeEnum.Volume: {
                    return DataIvemIdPriceVolumeSequenceHistory.SeriesTypeId.Volume;
                }
                default: {
                    const errorCode = ApiError.CodeEnum.InvalidDataIvemIdPriceVolumeSequenceHistorySeriesTypeId;
                    throw new UnreachableCaseApiErrorImplementation(errorCode, enumValue);
                }
            }
        }
    }
}
