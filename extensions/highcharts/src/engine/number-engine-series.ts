import { AssertInternalError } from '@pbkware/js-utils';
import { DataIvemId, DataIvemIdPriceVolumeSequenceHistory, ExtensionSvc, Integer, NumberHistorySequenceSeriesInterface } from '@plxtra/motif';
import Highcharts from 'highcharts/esm/highstock.js';
import { Settings } from '../settings';
import { EngineSeries } from './engine-series';
import { SupportedSeriesType, SupportedSeriesTypeId } from './supported-series-type';

export class NumberEngineSeries extends EngineSeries {
    private _numberSequenceSeries: NumberHistorySequenceSeriesInterface;
    private _optionsData: NumberHighstockChartEngineSeries.OptionsData;

    constructor(
        private readonly _extensionSvc: ExtensionSvc,
        settings: Settings,
        seriesTypeId: EngineSeries.TypeId,
        parameterIndex: Integer | undefined,
        litIvemId: DataIvemId,
        chartSeries: Highcharts.Series,
        chartSeriesTypeId: SupportedSeriesTypeId,
    ) {
        super(settings, seriesTypeId, parameterIndex, litIvemId, chartSeries, chartSeriesTypeId);
    }

    activate(history: DataIvemIdPriceVolumeSequenceHistory, series: NumberHistorySequenceSeriesInterface) {
        super.activate(history, series);
        this._numberSequenceSeries = series;
    }

    initialiseSequenceSeriesWithNullPoints() {
        this._numberSequenceSeries.initialiseWithNullPoints();
    }

    loadAllChartPoints() {
        const count = this._numberSequenceSeries.pointCount;
        const data = new Array<NumberHighstockChartEngineSeries.Point>(count);
        for (let i = 0; i < count; i++) {
            data[i] = this.createPoint(i);
        }
        this.chartSeries.setData(data, false, false, false);
        this._optionsData = this.calculateSeriesOptionsData();
        this.notifyPointsChangedEvent();
    }

    protected insertPoint(idx: Integer) {
        const oldOptionsDataCount = this._optionsData.length;
        if (idx === oldOptionsDataCount) {
            const chartPoint = this.createPoint(idx);
            this.chartSeries.addPoint(chartPoint, false, false, false, false);
        } else {
            // Simulate insert by overwriting idx and subsequent existing points and then add last point
            for (let i = idx; i < oldOptionsDataCount; i++) {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (this.chartSeries.data[i] !== undefined && this.chartSeries.data[i] !== null) {
                    const chartPoint = this.createPoint(i);
                    this.chartSeries.data[i].update(chartPoint, false, false);
                } else {
                    this._optionsData[i] = this.createOptionsDataPoint(i);
                }
            }
            const finalChartPoint = this.createPoint(oldOptionsDataCount);
            this.chartSeries.addPoint(finalChartPoint, false, false, false, false);
        }
        this.notifyPointsChangedEvent();
    }

    protected insertPoints(idx: Integer, count: Integer) {
        // update existing
        const oldOptionsDataCount = this._optionsData.length;
        for (let i = idx; i < oldOptionsDataCount; i++) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (this.chartSeries.data[i] !== undefined && this.chartSeries.data[i] !== null) {
                const chartPoint = this.createPoint(i);
                this.chartSeries.data[i].update(chartPoint, false, false);
            } else {
                this._optionsData[i] = this.createOptionsDataPoint(i);
            }
        }
        // add extra
        const newCount = this._numberSequenceSeries.pointCount;
        for (let i = oldOptionsDataCount; i < newCount; i++) {
            const chartPoint = this.createPoint(i);
            this.chartSeries.addPoint(chartPoint, false, false, false, false);
        }
        this.notifyPointsChangedEvent();
    }

    protected updatePoint(idx: Integer) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this.chartSeries.data[idx] !== undefined && this.chartSeries.data[idx] !== null) {
            const chartPoint = this.createPoint(idx);
            this.chartSeries.data[idx].update(chartPoint, false, false);
        } else {
            this._optionsData[idx] = this.createOptionsDataPoint(idx);
        }

        this.notifyPointsChangedEvent();
    }

    private calculateSeriesOptionsData() {
        let highchartsOptionsData: NumberHighstockChartEngineSeries.HighchartsOptionsData | undefined;
        switch (this.chartSeriesTypeId) {
            case SupportedSeriesTypeId.Column: {
                const columnOptions = this.chartSeries.options as Highcharts.SeriesColumnOptions;
                highchartsOptionsData = columnOptions.data;
                break;
            }
            case SupportedSeriesTypeId.Line: {
                const lineOptions = this.chartSeries.options as Highcharts.SeriesLineOptions;
                highchartsOptionsData = lineOptions.data;
                break;
            }
            default: {
                throw new AssertInternalError('NHCESCSODS444938827', SupportedSeriesType.idToDisplay(this.chartSeriesTypeId));
            }
        }
        if (highchartsOptionsData === undefined) {
            throw new AssertInternalError('NHCESCSODU444938827', SupportedSeriesType.idToDisplay(this.chartSeriesTypeId));
        } else {
            return highchartsOptionsData as NumberHighstockChartEngineSeries.OptionsData;
        }
    }

    private createPoint(idx: Integer) {
        const numberPoint = this._numberSequenceSeries.getNumberPoint(idx);
        const sequencerPoint = this._numberSequenceSeries.getSequencerPoint(idx);
        const timezonedDate = this._extensionSvc.sourceTzOffsetDateTimeSvc.getTimezonedDate(sequencerPoint,
            this.settings.format_DateTimeTimezoneModeId
        );
        const xValue = timezonedDate.getTime();
        let chartPoint: NumberHighstockChartEngineSeries.Point;
        if (numberPoint.null) {
            chartPoint = [xValue, null];
        } else {
            chartPoint = [xValue,
                numberPoint.value,
            ];
        }
        return chartPoint;
    }

    private createOptionsDataPoint(idx: Integer) {
        const numberPoint = this._numberSequenceSeries.getNumberPoint(idx);
        const sequencerPoint = this._numberSequenceSeries.getSequencerPoint(idx);
        const timezonedDate = this._extensionSvc.sourceTzOffsetDateTimeSvc.getTimezonedDate(sequencerPoint,
            this.settings.format_DateTimeTimezoneModeId
        );
        const xValue = timezonedDate.getTime();
        let optionsDataPoint: NumberHighstockChartEngineSeries.OptionsDataPoint;
        if (numberPoint.null) {
            optionsDataPoint = [xValue, null];
        } else {
            optionsDataPoint = [xValue, numberPoint.value];
        }
        return optionsDataPoint;
    }
}

export namespace NumberHighstockChartEngineSeries {
    export type Point = [number, number | null];
    export type OptionsDataPoint = [number, number | null];
    export type OptionsData = OptionsDataPoint[];
    export type HighchartsOptionsData = (number|[(number|string), (number|null)]|null|Highcharts.PointOptionsObject)[];
}
