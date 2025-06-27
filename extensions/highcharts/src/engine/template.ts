import Highcharts from 'highcharts/esm/highstock.js';
import 'highcharts/esm/indicators/indicators-all.js';
import 'highcharts/esm/modules/annotations-advanced.js';
import 'highcharts/esm/modules/drag-panes.js';
import 'highcharts/esm/modules/full-screen.js';
import 'highcharts/esm/modules/price-indicator.js';
import 'highcharts/esm/modules/stock-tools.js';

// import annotationsVisibleSvgMap from 'highcharts/gfx/stock-icons/annotations-visible.svg';
// import arrowLineSvgMap from 'highcharts/gfx/stock-icons/arrow-line.svg';
// import arrowRaySvgMap from 'highcharts/gfx/stock-icons/arrow-ray.svg';
// import arrowSegmentSvgMap from 'highcharts/gfx/stock-icons/arrow-segment.svg';
// import circleSvgMap from 'highcharts/gfx/stock-icons/circle.svg';
// import crooked3SvgMap from 'highcharts/gfx/stock-icons/crooked-3.svg';
// import crooked5SvgMap from 'highcharts/gfx/stock-icons/crooked-5.svg';
// import currentPriceShowSvgMap from 'highcharts/gfx/stock-icons/current-price-show.svg';
// import elliott3SvgMap from 'highcharts/gfx/stock-icons/elliott-3.svg';
// import elliott5SvgMap from 'highcharts/gfx/stock-icons/elliott-5.svg';
// import ellipseSvgMap from 'highcharts/gfx/stock-icons/ellipse.svg';
// import fibonacciTimezoneSvgMap from 'highcharts/gfx/stock-icons/fibonacci-timezone.svg';
// import fibonacciSvgMap from 'highcharts/gfx/stock-icons/fibonacci.svg';
// import flagBasicSvgMap from 'highcharts/gfx/stock-icons/flag-basic.svg';
// import flagDiamondSvgMap from 'highcharts/gfx/stock-icons/flag-diamond.svg';
// import flagElipseSvgMap from 'highcharts/gfx/stock-icons/flag-elipse.svg';
// import flagTrapezeSvgMap from 'highcharts/gfx/stock-icons/flag-trapeze.svg';
// import fullscreenSvgMap from 'highcharts/gfx/stock-icons/fullscreen.svg';
// import horizontalLineSvgMap from 'highcharts/gfx/stock-icons/horizontal-line.svg';
// import indicatorsSvgMap from 'highcharts/gfx/stock-icons/indicators.svg';
// import labelSvgMap from 'highcharts/gfx/stock-icons/label.svg';
// import lineSvgMap from 'highcharts/gfx/stock-icons/line.svg';
// import measureXSvgMap from 'highcharts/gfx/stock-icons/measure-x.svg';
// import measureXYSvgMap from 'highcharts/gfx/stock-icons/measure-xy.svg';
// import measureYSvgMap from 'highcharts/gfx/stock-icons/measure-y.svg';
// import parallelChannelSvgMap from 'highcharts/gfx/stock-icons/parallel-channel.svg';
// import pitchforkSvgMap from 'highcharts/gfx/stock-icons/pitchfork.svg';
// import raySvgMap from 'highcharts/gfx/stock-icons/ray.svg';
// import rectangleSvgMap from 'highcharts/gfx/stock-icons/rectangle.svg';
// import saveChartSvgMap from 'highcharts/gfx/stock-icons/save-chart.svg';
// import segmentSvgMap from 'highcharts/gfx/stock-icons/segment.svg';
// import seriesCandlestickSvgMap from 'highcharts/gfx/stock-icons/series-candlestick.svg';
// import seriesHeikinAshiSvgMap from 'highcharts/gfx/stock-icons/series-heikin-ashi.svg';
// import seriesHLCSvgMap from 'highcharts/gfx/stock-icons/series-hlc.svg';
// import seriesHollowCandlestickSvgMap from 'highcharts/gfx/stock-icons/series-hollow-candlestick.svg';
// import seriesLineSvgMap from 'highcharts/gfx/stock-icons/series-line.svg';
// import seriesOHLCSvgMap from 'highcharts/gfx/stock-icons/series-ohlc.svg';
// import timeCyclesSvgMap from 'highcharts/gfx/stock-icons/time-cycles.svg';
// import verticalArrowSvgMap from 'highcharts/gfx/stock-icons/vertical-arrow.svg';
// import verticalCounterSvgMap from 'highcharts/gfx/stock-icons/vertical-counter.svg';
// import verticalLabelSvgMap from 'highcharts/gfx/stock-icons/vertical-label.svg';
// import verticalLineSvgMap from 'highcharts/gfx/stock-icons/vertical-line.svg';
// import zoomXSvgMap from 'highcharts/gfx/stock-icons/zoom-x.svg';
// import zoomXYSvgMap from 'highcharts/gfx/stock-icons/zoom-xy.svg';
// import zoomYSvgMap from 'highcharts/gfx/stock-icons/zoom-y.svg';

import { ExtensionSvc, HistorySequencer, Integer, IntervalHistorySequencer, JsonElement } from 'motif';
import { EngineSeries } from './engine-series';
import { SupportedSeriesType } from './supported-series-type';

import 'highcharts/css/annotations/popup.css';
import 'highcharts/css/highcharts.css';
import 'highcharts/css/stocktools/gui.css';
// import 'highcharts/css/themes/dark-unica.css';


export interface Template {
    chartOptions: Highcharts.Options | undefined;
    seriesArray: Template.Series[] | undefined;
    sequencerType: string;
    intervalSequencer: Template.IntervalSequencer | undefined;
}

export namespace Template {

    export const enum TypeId {
        Named,
        DataIvemIdDefault,
        DataIvemIdRemembered,
    }

    export interface Series {
        id: string | undefined;
        typeId: EngineSeries.Type.JsonValue;
        parameterIndex?: Integer;
        dataIvemId?: JsonElement;
        hideYAxisIfUnused: boolean;
    }

    export interface IntervalSequencer {
        unit: string;
        unitCount: number;
        emptyPeriodsSkipped: boolean;
        weekendsSkipped: boolean;
        completedIntervalsOnly: boolean;
    }

    export namespace IntervalSequencer {
        export namespace JsonName {
            export const unit = 'unit';
            export const unitCount = 'unitCount';
            export const emptyPeriodsSkipped = 'emptyPeriodsSkipped';
            export const weekendsSkipped = 'weekendsSkipped';
            export const completedIntervalsOnly = 'completedIntervalsOnly';
        }

        export namespace defaults {
            export const unit = IntervalHistorySequencer.UnitEnum.Millisecond;
            export const unitCount = 60000;
            export const emptyPeriodsSkipped = true;
            export const weekendsSkipped = true;
            export const completedIntervalsOnly = false;
        }
    }

    const enum DefaultId {
        // Series
        DataIvemIdPriceSeries = 'defaultDataIvemIdPriceSeries',
        DataIvemIdVolumeSeries = 'defaultDataIvemIdVolumeSeries',
        // YAxis
        DataIvemIdPriceYAxis = 'defaultDataIvemIdPriceYAxis',
        DataIvemIdVolumeYAxis = 'defaultDataIvemIdVolumeYAxis',
    }

    export const defaultSequencerTypeId = HistorySequencer.TypeEnum.Interval;

    export function createDefaultIntervalSequencer(extensionSvc: ExtensionSvc) {
        const result: IntervalSequencer = {
            unit: extensionSvc.intervalHistorySequencerSvc.unitToJsonValue(IntervalSequencer.defaults.unit),
            unitCount: IntervalSequencer.defaults.unitCount,
            emptyPeriodsSkipped: IntervalSequencer.defaults.emptyPeriodsSkipped,
            weekendsSkipped: IntervalSequencer.defaults.weekendsSkipped,
            completedIntervalsOnly: IntervalSequencer.defaults.completedIntervalsOnly,
        };
        return result;
    }

    export function createDefault(extensionSvc: ExtensionSvc) {
        const defaultIntervalSequencer = createDefaultIntervalSequencer(extensionSvc);

        const template: Template = {
            chartOptions: {
                chart: {
                    styledMode: true,
                    animation: false
                },
                credits: {
                    enabled: false,
                },
                rangeSelector: {
                    enabled: false,
                    // selected: 1
                },
                plotOptions: {
                    series: {
                        animation: false
                    }
                },
                series: [{
                        type: SupportedSeriesType.JsonValue.Ohlc,
                        id: DefaultId.DataIvemIdPriceSeries,
                        tooltip: {
                            valueDecimals: 2
                        },
                        name: 'Price',
                        yAxis: DefaultId.DataIvemIdPriceYAxis,
                    },
                    {
                        type: SupportedSeriesType.JsonValue.Column,
                        id: DefaultId.DataIvemIdVolumeSeries,
                        yAxis: DefaultId.DataIvemIdVolumeYAxis,
                    }
                ],
                yAxis: [
                    {
                        id: DefaultId.DataIvemIdPriceYAxis,
                        height: '80%',
                        resize: {
                            enabled: true
                        },
                    },
                    {
                        id: DefaultId.DataIvemIdVolumeYAxis,
                        top: '80%',
                        height: '20%',
                        offset: 0,
                    }
                ],
                time: {
                    timezone: undefined,
                },
                navigation: {
                    // iconsURL: ' ',
                    iconsURL: 'https://code.highcharts.com/12.1.2/gfx/stock-icons/',
                },
                stockTools: {
                    gui: {
                        enabled: true,
                        visible: true,
                        // definitions: {
                        //     indicators: { symbol: indicatorsSvgMap },
                        //     separator: { symbol: separatorSvgMap },
                        //     simpleShapes: {
                        //         circle: { symbol: circleSvgMap },
                        //         ellipse: { symbol: ellipseSvgMap },
                        //         label: { symbol: labelSvgMap },
                        //         rectangle: { symbol: rectangleSvgMap },
                        //     },
                        //     lines: {
                        //         arrowInfinityLine: { symbol: arrowLineSvgMap },
                        //         arrowRay: { symbol: arrowRaySvgMap },
                        //         arrowSegment: { symbol: arrowSegmentSvgMap },
                        //         horizontalLine: { symbol: horizontalLineSvgMap },
                        //         line: { symbol: lineSvgMap },
                        //         ray: { symbol: raySvgMap },
                        //         segment: { symbol: segmentSvgMap },
                        //         verticalLine: { symbol: verticalLineSvgMap },
                        //     },
                        //     crookedLines: {
                        //         crooked3: { symbol: crooked3SvgMap },
                        //         crooked5: { symbol: crooked5SvgMap },
                        //         elliott3: { symbol: elliott3SvgMap },
                        //         elliott5: { symbol: elliott5SvgMap },
                        //     },
                        //     measure: {
                        //         measureX: { symbol: measureXSvgMap },
                        //         measureXY: { symbol: measureXYSvgMap },
                        //         measureY: { symbol: measureYSvgMap },
                        //     },
                        //     advanced: {
                        //         fibonacci: { symbol: fibonacciSvgMap },
                        //         fibonacciTimeZones: { symbol: fibonacciTimezoneSvgMap },
                        //         parallelChannel: { symbol: parallelChannelSvgMap },
                        //         pitchfork: { symbol: pitchforkSvgMap },
                        //         timeCycles: { symbol: timeCyclesSvgMap },
                        //     },
                        //     toggleAnnotations: { symbol: annotationsVisibleSvgMap },
                        //     verticalLabels: {
                        //         verticalArrow: { symbol: verticalArrowSvgMap },
                        //         verticalCounter: { symbol: verticalCounterSvgMap },
                        //         verticalLabel: { symbol: verticalLabelSvgMap },
                        //     },
                        //     flags: {
                        //         flagCirclepin: { symbol: flagElipseSvgMap },
                        //         flagDiamondpin: { symbol: flagDiamondSvgMap },
                        //         flagSimplepin: { symbol: flagBasicSvgMap },
                        //         flagSquarepin: { symbol: flagTrapezeSvgMap },
                        //     },
                        //     zoomChange: {
                        //         zoomX: { symbol: zoomXSvgMap },
                        //         zoomXY: { symbol: zoomXYSvgMap },
                        //         zoomY: { symbol: zoomYSvgMap },
                        //     },
                        //     fullScreen: { symbol: fullscreenSvgMap },
                        //     typeChange: {
                        //         typeCandlestick: { symbol: seriesCandlestickSvgMap },
                        //         typeHeikinAshi: { symbol: seriesHeikinAshiSvgMap },
                        //         typeHLC: { symbol: seriesHLCSvgMap },
                        //         typeHollowCandlestick: { symbol: seriesHollowCandlestickSvgMap },
                        //         typeLine: { symbol: seriesLineSvgMap },
                        //         typeOHLC: { symbol: seriesOHLCSvgMap },
                        //     },
                        //     currentPriceIndicator: { symbol: currentPriceShowSvgMap },
                        //     saveChart: { symbol: saveChartSvgMap },
                        // }
                    }
                },
            },
            seriesArray: [{
                    id: DefaultId.DataIvemIdPriceSeries,
                    typeId: EngineSeries.Type.JsonValue.LitIvemIdOhlc,
                    parameterIndex: 0,
                    hideYAxisIfUnused: false,
                },
                {
                    id: DefaultId.DataIvemIdVolumeSeries,
                    typeId: EngineSeries.Type.JsonValue.LitIvemIdVolume,
                    parameterIndex: 0,
                    hideYAxisIfUnused: true,
                }
            ],

            sequencerType: extensionSvc.historySequencerSvc.typeToJsonValue(defaultSequencerTypeId),

            intervalSequencer: defaultIntervalSequencer,
        };

        // const result: Template = {
        //     chartOptions: {
        //         credits: {
        //             enabled: false,
        //         },
        //         rangeSelector: {
        //             enabled: false,
        //         },
        //         series: [{
        //                 type: SupportedHighchartsSeriesType.JsonValue.Ohlc,
        //                 id: DefaultId.LitIvemIdPriceSeries,
        //                 yAxis: DefaultId.LitIvemIdPriceYAxis,
        //             },
        //             {
        //                 type: SupportedHighchartsSeriesType.JsonValue.Column,
        //                 id: DefaultId.LitIvemIdVolumeSeries,
        //                 yAxis: DefaultId.LitIvemIdVolumeYAxis,
        //             }
        //         ],
        //         yAxis: [{
        //                 id: DefaultId.LitIvemIdPriceYAxis,
        //                 height: '80%',
        //                 resize: {
        //                   enabled: true
        //                 }
        //             },
        //             {
        //                 id: DefaultId.LitIvemIdVolumeYAxis,
        //                 top: '80%',
        //                 height: '20%',
        //                 offset: 0
        //             }
        //         ],
        //         // stockTools: {
        //         //     gui: {
        //         //         enabled: true,
        //         //     }
        //         // },
        //     },

        //     seriesArray: [{
        //             id: DefaultId.LitIvemIdPriceSeries,
        //             typeId: HighstockChartEngineSeries.Type.JsonValue.LitIvemIdOhlc,
        //             parameterIndex: 0,
        //             hideYAxisIfUnused: false,
        //         },
        //         {
        //             id: DefaultId.LitIvemIdVolumeSeries,
        //             typeId: HighstockChartEngineSeries.Type.JsonValue.LitIvemIdVolume,
        //             parameterIndex: 0,
        //             hideYAxisIfUnused: true,
        //         }
        //     ],

        //     sequencerType: HistorySequencer.Type.idToJsonValue(defaultSequencerTypeId),

        //     intervalSequencer: defaultIntervalSequencer,
        // };

        return template;
    }
}

