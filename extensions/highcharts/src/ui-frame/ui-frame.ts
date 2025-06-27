import { AssertInternalError } from '@pbkware/js-utils';
import {
    Badness,
    BuiltinIconButton,
    DataIvemId,
    DataIvemIdSelect,
    DelayedBadnessComponent,
    ExtensionSvc,
    Frame,
    FrameSvc,
    JsonElement
} from 'motif';
import { ChartFrame } from '../chart-frame/chart-frame';
import { TemplateStorage } from '../engine/template-storage';
import { LogService } from '../log-service';
import { Settings } from '../settings';
import { StatusBarFrame } from '../status-bar-frame/status-bar-frame';
import './ui-frame.scss';

export class UiFrame implements Frame, ChartFrame.UiAccess {
    private _delayedBadnessComponent: DelayedBadnessComponent;

    private readonly _templateStorage: TemplateStorage;
    private readonly _rootHtmlElement: HTMLElement;
    private _litIvemIdSelect: DataIvemIdSelect;
    private _symbolLinkedButton: BuiltinIconButton;

    private _chartFrame: ChartFrame;
    private _statusBarFrame: StatusBarFrame;
    private _currentChartTemplateName: string;

    constructor(
        private readonly _logService: LogService,
        private readonly _settings: Settings,
        private readonly _extensionSvc: ExtensionSvc,
        private readonly _svc: FrameSvc,
    ) {
        this._templateStorage = new TemplateStorage(this._logService, this._extensionSvc.storageSvc, this._extensionSvc.commaTextSvc, this._extensionSvc.jsonSvc);

        this._rootHtmlElement = document.createElement('div');
        this._rootHtmlElement.classList.add('ui-frame-root');
        this._rootHtmlElement.style.position = 'absolute';
        this._rootHtmlElement.style.overflow = 'hidden';
    }

    get rootHtmlElement() {
        return this._rootHtmlElement;
    }
    get svc() {
        return this._svc;
    }

    public setBadness(value: Badness) {
        this._delayedBadnessComponent.setBadness(value);
    }

    public hideBadnessWithVisibleDelay(badness: Badness) {
        this._delayedBadnessComponent.hideWithVisibleDelay(badness);
    }

    async initialise() {
        const controlsDiv = document.createElement('div');
        controlsDiv.classList.add('ui-frame-controls');
        this._rootHtmlElement.appendChild(controlsDiv);
        this._litIvemIdSelect = await this.svc.controlsSvc.createDataIvemIdSelect();
        this._litIvemIdSelect.rootHtmlElement.classList.add('ui-frame-lit-ivem-id-select');
        this._litIvemIdSelect.commitEventer = () => this.commitSymbol();
        controlsDiv.appendChild(this._litIvemIdSelect.rootHtmlElement);

        const symbolLinkedToggleCommand = this._extensionSvc.commandSvc.getOrRegisterCommand('SymbolLinkedToggle', 0);
        this._symbolLinkedButton = await this.svc.controlsSvc.createBuiltinIconButton(symbolLinkedToggleCommand);
        controlsDiv.appendChild(this._symbolLinkedButton.rootHtmlElement);

        const delayedBadnessComponentAndChartFrameDiv = document.createElement('div');
        delayedBadnessComponentAndChartFrameDiv.classList.add('badness-and-chart');
        this.rootHtmlElement.appendChild(delayedBadnessComponentAndChartFrameDiv);
        this._delayedBadnessComponent = this._svc.contentSvc.createDelayedBadnessComponent();
        const delayedBadnessHtmlElement = this._delayedBadnessComponent.rootHtmlElement;
        delayedBadnessHtmlElement.classList.add('delayed-badness');
        delayedBadnessComponentAndChartFrameDiv.appendChild(delayedBadnessHtmlElement);
        const chartFrameDiv = document.createElement('div');
        chartFrameDiv.classList.add('chart-frame');
        delayedBadnessComponentAndChartFrameDiv.appendChild(chartFrameDiv);
        this._chartFrame = new ChartFrame(this._logService,  this._settings, this._extensionSvc, this, this._templateStorage, chartFrameDiv);

        this._svc.applySymbolEventer = (symbol, selfInitiated) => this.applySymbol(symbol, selfInitiated);
        this._svc.savePersistStateEventer = (element) => this.saveState(element);
        this._svc.resizedEventer = () => this.handleFrameResize();

        this.loadState(this._svc.initialPersistState);

        this.pushSymbol(this._svc.dataIvemId);
        this.pushSymbolLinkButtonState();

        this.applySymbol(this._svc.dataIvemId, true);
    }

    destroy() {
        this._svc.destroyAllComponents();
        this._chartFrame.destroy();
    }

    public handleSaveAsTemplate(): void {
        if (this._svc.dataIvemId !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression, @typescript-eslint/no-unused-vars
            const template = this._chartFrame.getCurrentTemplate();
            // const templateAsStr = template.stringify();
            // ChartTemplates.saveTemplate(this._frame.frameLitIvemId, 'MyFancyTemplate', templateAsStr);
        }
    }

    public handleTemplateChanged(templateName: string): void {
        // this._currentChartTemplateName = templateName;
        // this.loadChartTemplate();
    }

    // public handleIntervalChanged(text: string): void {
    //     const id = ChartInterval.tryJsonValueToId(text);
    //     if (!defined(id)) {
    //         throw new AdiError('Condition not handled [ID:11126165645]');
    //     }
    //     this._frame.frameIntervalId = id;
    // }

    // public isIntervalSelected(text: string): boolean {
    //     const id = ChartInterval.tryJsonValueToId(text);
    //     if (!defined(id)) {
    //         throw new AdiError('Condition not handled [ID:11926165903]');
    //     }
    //     return this._frame.frameIntervalId === id;
    // }

    public isTemplateSelected(name: string): boolean {
        // return (name === this._currentChartTemplateName);
        return false;
    }

    private applySymbol(litIvemId: DataIvemId | undefined, selfInitiated: boolean): boolean {
        if (litIvemId === undefined) {
            this.notifyOpenedClosed(undefined);
            return false;
        } else {
            this.pushSymbol(litIvemId);
            const openPromise = this._chartFrame.openDataIvemId(litIvemId);
            openPromise.then(
                () => this.notifyOpenedClosed(litIvemId),
                (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'Highcharts: UI35311', `Could not open DataIvemId: ${litIvemId.name}`); }
            );
            return true;
        }
    }

    private handleFrameResize() {
        this._chartFrame.adviseResize();
    }

    private loadState(element: JsonElement | undefined) {
        // ToDo
    }

    private saveState(element: JsonElement) {
        element.setString(UiFrame.JsonName.stateSchemaVersion, UiFrame.defaultStateSchemaVersion);
        const chartFrameElement = element.newElement(UiFrame.JsonName.chartFrame);
        this._chartFrame.saveState(chartFrameElement);
    }

    private async loadChartTemplate() {
        // const context = 'chart-input.component.ts';

        // const litIvemId = this._svc.litIvemId;
        // if (litIvemId !== undefined && this._currentChartTemplateName !== undefined) {
        //     const templateData = await this._templateStorage.getLitIvemIdRememberedTemplate(litIvemId, this._currentChartTemplateName);
        //     if (templateData === undefined) {
        //         this._chartFrame.loadDefaultChartTemplate();
        //     } else {
        //         try {
        //             const chartTemplateElement = this._extensionSvc.jsonSvc.createJsonElement();
        //             chartTemplateElement.parse(templateData, context);
        //             this._chartFrame.loadChartTemplate(chartTemplateElement);
        //         } catch (error) {
        //             this._logService.logError('ID:18028144025');
        //             this._contentComponent.loadDefaultChartTemplate();
        //         }
        //     }
        // }
    }

    private pushSymbolLinkButtonState() {
        if (this._svc.dataIvemIdLinked) {
            this._symbolLinkedButton.pushSelected();
        } else {
            this._symbolLinkedButton.pushUnselected();
        }
    }

    private pushSymbol(litIvemId: DataIvemId | undefined) {
        this._litIvemIdSelect.pushValue(litIvemId);
    }

    private commitSymbol() {
        const litIvemId = this._litIvemIdSelect.value;
        if (litIvemId !== undefined) {
            this._svc.setDataIvemId(litIvemId);
            this._litIvemIdSelect.pushAccepted();
        }
    }

    private notifyOpenedClosed(litIvemId: DataIvemId | undefined) {
        this.pushSymbol(litIvemId);
        this._litIvemIdSelect.pushDisabled();
        this._litIvemIdSelect.pushAccepted();
    }
}

export namespace UiFrame {
    export const frameTypeName = 'chart';

    export namespace JsonName {
        export const stateSchemaVersion = 'stateSchemaVersion';
        export const chartFrame = 'chartFrame';
        export const intervalUnit = 'intervalUnit';
        export const intervalUnitCount = 'intervalUnitCount';
    }

    export const defaultStateSchemaVersion = '1';

    export type OpenedEventHandler = (this: void) => void;
}
