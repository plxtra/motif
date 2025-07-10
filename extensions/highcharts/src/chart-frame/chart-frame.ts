import { Badness, DataIvemId, ExtensionSvc, JsonElement } from '@plxtra/motif';
import { Engine } from '../engine/engine';
import { TemplateStorage } from '../engine/template-storage';
import { LogService } from '../log-service';
import { Settings } from '../settings';
import './chart-frame.css';

export class ChartFrame {

    private readonly _element: HTMLElement;
    private readonly _chartEngine: Engine;

    constructor(
        private readonly _logService: LogService,
        private readonly _settings: Settings,
        private readonly _extensionSvc: ExtensionSvc,
        private readonly _uiAccess: ChartFrame.UiAccess,
        private readonly _templateStorage: TemplateStorage,
        hostElement: HTMLElement,
    ) {
        this._chartEngine = new Engine(this._logService, this._extensionSvc, this._settings, hostElement);
        this._chartEngine.badnessChangedEvent = () => this.handleChartEngineBadnessChangedEvent();
        this._chartEngine.chartOpenedEvent = () => this.handleChartOpenedEvent();
    }

    get chartEngine() { return this._chartEngine; }

    destroy() {
        this._chartEngine.destroy();
    }

    adviseResize() {
        // if (this._chartSizingHostElement !== undefined) {
        //     const height = this._chartSizingHostElement.offsetHeight;
        //     const width = this._chartSizingHostElement.offsetWidth;
        //     if (height > 5 && width > 5) {
        //         this.chartHostHeight = numberToPixels(height);
        //         this.chartHostWidth = numberToPixels(width);
        //         this._cdr.markForCheck();
        //         delay1Tick(() => this.frame.adviseResize());
        //     }
        // }


        this._chartEngine.reflowChart();
    }

    getCurrentTemplate() {
        // const chartOptions = getCustomOptions(this._chart);
        // return this.createTemplate(chartOptions);
    }

    saveState(element: JsonElement) {
        // const chartOptions = getCustomOptions(this._chart);
        // const templateElement = this.createTemplate(chartOptions);
        // element.setElement(ChartComponent.JsonName.template, templateElement);
    }

    loadState(element: JsonElement | undefined) {
        // if (element === undefined) {
        //     this._loadedTemplate = this.createDefaultTemplate();
        // } else {
        //     const template = element.tryGetElement(ChartComponent.JsonName.template);
        //     if (template === undefined) {
        //         this._loadedTemplate = this.createDefaultTemplate();
        //     } else {
        //         this._loadedTemplate = template;
        //     }
        // }
    }

    async openDataIvemId(dataIvemId: DataIvemId) {
        const rememberedTemplate = await this._templateStorage.getDataIvemIdRememberedTemplate(dataIvemId);
        if (rememberedTemplate === undefined) {
            this._chartEngine.loadDefaultDataIvemIdChart(dataIvemId);
        } else {
            this._chartEngine.loadRememberedDataIvemIdChart(dataIvemId, rememberedTemplate);
        }
    }

    private handleChartOpenedEvent() {
        this._uiAccess.hideBadnessWithVisibleDelay(this._chartEngine.badness);
    }

    private handleChartEngineBadnessChangedEvent() {
        this._uiAccess.setBadness(this._chartEngine.badness);
    }

    // loadChartTemplate(template: JsonElement): void {
    //     const context = 'Chart Component: Load Template Json';
    //     let chartOptions = template.tryGetJsonObject(ChartComponent.JsonName.options, context) as HighchartOptions;
    //     if (chartOptions === undefined) {
    //         chartOptions = this.createDefaultOptions();
    //     } else {
    //         chartOptions = combineOptions(getDefaultChartOptions(), chartOptions);
    //     }
    //     this.createChart(chartOptions);
    //     this.readChartData();
    // }

    // loadDefaultChartTemplate(): void {
    //     const options = this.createDefaultOptions();
    //     this.createChart(options);
    //     this.readChartData();
    // }

    // private combineOptions(baseOptions: Highcharts.Options, customOptions: Highcharts.Options): Highcharts.Options {
    //     const options = { ...baseOptions };
    
    //     options.series = [
    //         ...options.series ? options.series : [],
    //         ...customOptions.series ? customOptions.series : [],
    //     ];
    
    //     options.annotations = [
    //         ...options.annotations ? options.annotations : [],
    //         ...customOptions.annotations ? customOptions.annotations : [],
    //     ];
    
    //     options.yAxis = [
    //         ...options.yAxis instanceof Array ? options.yAxis : [],
    //         ...customOptions.yAxis instanceof Array ? customOptions.yAxis : [],
    //     ];
    
    //     return options;
    // }
    
}

export namespace ChartFrame {
    export type ChangedEvent = (this: void) => void;
    export type ClearEvent = (this: void) => void;

    export interface UiAccess {
        setBadness(value: Badness): void;
        hideBadnessWithVisibleDelay(badness: Badness): void;
    }
}
