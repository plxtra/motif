import { AssertInternalError, EnumInfoOutOfOrderError } from '@pbkware/js-utils';
import Highcharts from 'highcharts/esm/highstock.js';
import { DataIvemId, DataIvemIdPriceVolumeSequenceHistory, HistorySequenceSeries, Integer, MultiEvent } from 'motif';
import { Settings } from '../settings';
import { SupportedSeriesTypeId } from './supported-series-type';

export abstract class EngineSeries {
    pointsChangedEvent: EngineSeries.PointsChangedEvent;

    private _history: DataIvemIdPriceVolumeSequenceHistory;
    private _sequenceSeries: HistorySequenceSeries | undefined;

    private _pointInsertedSubscriptionId: MultiEvent.SubscriptionId;
    private _pointUpdatedSubscriptionId: MultiEvent.SubscriptionId;
    private _emptyPointsInsertedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        private readonly _settings: Settings,
        private _typeId: EngineSeries.TypeId,
        private _parameterIndex: Integer | undefined,
        private _litIvemId: DataIvemId,
        private _chartSeries: Highcharts.Series,
        private _chartSeriesTypeId: SupportedSeriesTypeId,
    ) { }

    get typeId() { return this._typeId; }
    get parameterIndex() { return this._parameterIndex; }
    get litIvemId() { return this._litIvemId; }
    get chartSeries() { return this._chartSeries; }
    get chartSeriesTypeId() { return this._chartSeriesTypeId; }
    get history() { return this._history; }

    protected get settings() { return this._settings; }

    finalise() {
        this.checkDeactivate();
    }

    deactivate() {
        this.checkDeactivate();
    }

    activate(history: DataIvemIdPriceVolumeSequenceHistory, series: HistorySequenceSeries) {
        this.checkDeactivate();
        this._sequenceSeries = series;
        this._history = history;
        const seriesTypeId = EngineSeries.Type.idToLitIvemIdPriceVolumeHistorySeriesTypeId(this._typeId);
        this._history.registerSeries(series, seriesTypeId);
        this.subscribeSeriesEvents();
    }

    protected notifyPointsChangedEvent() {
        this.pointsChangedEvent();
    }

    private handlePointInsertedEvent(idx: Integer) {
        this.insertPoint(idx);
    }

    private handlePointsInsertedEvent(idx: Integer, count: Integer) {
        this.insertPoints(idx, count);
    }

    private handlePointUpdatedEvent(idx: Integer) {
        this.updatePoint(idx);
    }

    private subscribeSeriesEvents() {
        if (this._sequenceSeries === undefined) {
            throw new AssertInternalError('HCESSSE339944583');
        } else {
            this._pointInsertedSubscriptionId = this._sequenceSeries.subscribePointInsertedEvent(
                (idx) => this.handlePointInsertedEvent(idx)
            );
            this._pointUpdatedSubscriptionId = this._sequenceSeries.subscribePointUpdatedEvent(
                (idx) => this.handlePointUpdatedEvent(idx)
            );
            this._emptyPointsInsertedSubscriptionId = this._sequenceSeries.subscribePointsInsertedEvent(
                (idx, count) => this.handlePointsInsertedEvent(idx, count)
            );
        }
    }

    private checkDeactivate() {
        if (this._sequenceSeries !== undefined) {
            this._sequenceSeries.unsubscribePointInsertedEvent(this._pointInsertedSubscriptionId);
            this._pointInsertedSubscriptionId = undefined;
            this._sequenceSeries.unsubscribePointUpdatedEvent(this._pointUpdatedSubscriptionId);
            this._pointUpdatedSubscriptionId = undefined;
            this._sequenceSeries.unsubscribePointsInsertedEvent(this._emptyPointsInsertedSubscriptionId);
            this._emptyPointsInsertedSubscriptionId = undefined;

            const seriesTypeId = EngineSeries.Type.idToLitIvemIdPriceVolumeHistorySeriesTypeId(this._typeId);
            this._history.deregisterSeries(this._sequenceSeries, seriesTypeId);

            this._sequenceSeries.finalise();

            this._sequenceSeries = undefined;
        }
    }

    abstract initialiseSequenceSeriesWithNullPoints(): void;
    abstract loadAllChartPoints(): void;

    protected abstract insertPoint(idx: Integer): void;
    protected abstract insertPoints(idx: Integer, count: Integer): void;
    protected abstract updatePoint(idx: Integer): void;
}

export namespace EngineSeries {
    export const enum TypeId {
        LitIvemIdOhlc,
        LitIvemIdClose,
        LitIvemIdLast,
        LitIvemIdVolume,
    }

    export type PointsChangedEvent = (this: void) => void;

    export namespace Type {
        export const enum JsonValue {
            LitIvemIdOhlc = 'litIvemIdOhlc',
            LitIvemIdClose = 'litIvemIdClose',
            LitIvemIdLast = 'litIvemIdLast',
            LitIvemIdVolume = 'litIvemIdVolume',
        }

        interface Info {
            readonly id: TypeId;
            readonly jsonValue: JsonValue;
            readonly supportedHighchartsSeriesTypeIds: readonly SupportedSeriesTypeId[];
            readonly litIvemIdPriceVolumeSequenceHistorySeriesType: DataIvemIdPriceVolumeSequenceHistory.SeriesType;
        }

        type InfosObject = { [id in keyof typeof TypeId]: Info };

        const infosObject: InfosObject = {
            LitIvemIdOhlc: {
                id: TypeId.LitIvemIdOhlc,
                jsonValue: JsonValue.LitIvemIdOhlc,
                supportedHighchartsSeriesTypeIds: [SupportedSeriesTypeId.Candlestick, SupportedSeriesTypeId.Ohlc],
                litIvemIdPriceVolumeSequenceHistorySeriesType: DataIvemIdPriceVolumeSequenceHistory.SeriesTypeEnum.Price,
            },
            LitIvemIdClose: {
                id: TypeId.LitIvemIdClose,
                jsonValue: JsonValue.LitIvemIdClose,
                supportedHighchartsSeriesTypeIds: [SupportedSeriesTypeId.Line],
                litIvemIdPriceVolumeSequenceHistorySeriesType: DataIvemIdPriceVolumeSequenceHistory.SeriesTypeEnum.Price,
            },
            LitIvemIdLast: {
                id: TypeId.LitIvemIdLast,
                jsonValue: JsonValue.LitIvemIdLast,
                supportedHighchartsSeriesTypeIds: [SupportedSeriesTypeId.Line],
                litIvemIdPriceVolumeSequenceHistorySeriesType: DataIvemIdPriceVolumeSequenceHistory.SeriesTypeEnum.Price,
            },
            LitIvemIdVolume: {
                id: TypeId.LitIvemIdVolume,
                jsonValue: JsonValue.LitIvemIdVolume,
                supportedHighchartsSeriesTypeIds: [SupportedSeriesTypeId.Column],
                litIvemIdPriceVolumeSequenceHistorySeriesType: DataIvemIdPriceVolumeSequenceHistory.SeriesTypeEnum.Volume,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info, id) => info.id !== id as TypeId);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('HighstockChartEngineSeries.TypeId', outOfOrderIdx, infos[outOfOrderIdx].jsonValue);
            }
        }

        export function idToJsonValue(id: TypeId) {
            return infos[id].jsonValue;
        }

        export function tryJsonValueToId(value: JsonValue) {
            const index = infos.findIndex(info => info.jsonValue === value);
            return index >= 0 ? infos[index].id : undefined;
        }

        export function idToSupportedHighchartsSeriesTypeIds(id: TypeId) {
            return infos[id].supportedHighchartsSeriesTypeIds;
        }

        export function idToLitIvemIdPriceVolumeHistorySeriesTypeId(id: TypeId) {
            return infos[id].litIvemIdPriceVolumeSequenceHistorySeriesType;
        }
    }
}

export namespace HighstockChartEngineSeriesModule {
    export function initialiseStatic() {
        EngineSeries.Type.initialise();
    }
}
