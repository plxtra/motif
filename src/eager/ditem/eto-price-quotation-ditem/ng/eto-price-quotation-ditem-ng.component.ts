import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy, viewChild } from '@angular/core';
import { delay1Tick, JsonElement, ModifierKey } from '@pbkware/js-utils';
import {
    DataIvemIdUiAction,
    IconButtonUiAction,
    InternalCommand,
    MarketsService,
    StringId,
    Strings
} from '@plxtra/motif-core';
import { CoreNgService, MarketsNgService } from 'component-services-ng-api';
import { ColumnLayoutEditorNgComponent, GridSourceNgDirective, WatchlistNgComponent } from 'content-ng-api';
import { DataIvemIdSelectNgComponent, SvgButtonNgComponent } from 'controls-ng-api';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { EtoPriceQuotationDitemFrame } from '../eto-price-quotation-ditem-frame';

@Component({
    selector: 'app-eto-price-quotation-ditem',
    templateUrl: './eto-price-quotation-ditem-ng.component.html',
    styleUrls: ['./eto-price-quotation-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class EtoPriceQuotationDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    private readonly _symbolEditComponentSignal = viewChild.required<DataIvemIdSelectNgComponent>('symbolInput');
    private readonly _symbolButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('symbolButton');
    private readonly _columnsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('columnsButton');
    private readonly _autoSizeColumnWidthsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('autoSizeColumnWidthsButton');
    private readonly _watchGridSourceComponentSignal = viewChild.required<WatchlistNgComponent>('watchGridSource');
    private readonly _callPutGridSourceComponentSignal = viewChild.required<GridSourceNgDirective>('callPutGridSource');
    private readonly _layoutEditorComponentSignal = viewChild.required<ColumnLayoutEditorNgComponent>('layoutEditor');

    private readonly _marketsService: MarketsService;

    private readonly _frame: EtoPriceQuotationDitemFrame;

    private readonly _symbolEditUiAction: DataIvemIdUiAction;
    private readonly _applySymbolUiAction: IconButtonUiAction;
    private readonly _selectColumnsUiAction: IconButtonUiAction;
    private readonly _autoSizeColumnWidthsUiAction: IconButtonUiAction;

    private _symbolEditComponent: DataIvemIdSelectNgComponent;
    private _symbolButtonComponent: SvgButtonNgComponent;
    private _columnsButtonComponent: SvgButtonNgComponent;
    private _autoSizeColumnWidthsButtonComponent: SvgButtonNgComponent;
    private _watchlistNgComponent: WatchlistNgComponent;
    private _callPutGridSourceComponent: GridSourceNgDirective;
    private _layoutEditorComponent: ColumnLayoutEditorNgComponent;

    private _modeId = EtoPriceQuotationDitemNgComponent.ModeId.Input;

    constructor() {
        super(++EtoPriceQuotationDitemNgComponent.typeInstanceCreateCount);

        const marketsNgService = inject(MarketsNgService);
        const desktopAccessNgService = inject(DesktopAccessNgService);
        const pulseService = inject(CoreNgService);

        this._marketsService = marketsNgService.service;

        this._frame = new EtoPriceQuotationDitemFrame(this, this.settingsService, this._marketsService, this.commandRegisterService,
            desktopAccessNgService.service, pulseService.symbolsService, pulseService.adiService);

        this._symbolEditUiAction = this.createSymbolEditUiAction();
        this._applySymbolUiAction = this.createApplySymbolUiAction();
        this._selectColumnsUiAction = this.createSelectColumnsUiAction();
        this._autoSizeColumnWidthsUiAction = this.createAutoSizeColumnWidthsUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());

        this.pushSymbol();
    }

    get ditemFrame() { return this._frame; }

    protected get stateSchemaVersion() { return EtoPriceQuotationDitemNgComponent.stateSchemaVersion; }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._symbolEditComponent = this._symbolEditComponentSignal();
        this._symbolButtonComponent = this._symbolButtonComponentSignal();
        this._columnsButtonComponent = this._columnsButtonComponentSignal();
        this._autoSizeColumnWidthsButtonComponent = this._autoSizeColumnWidthsButtonComponentSignal();
        this._watchlistNgComponent = this._watchGridSourceComponentSignal();
        this._callPutGridSourceComponent = this._callPutGridSourceComponentSignal();
        this._layoutEditorComponent = this._layoutEditorComponentSignal();

        delay1Tick(() => this.initialise());
    }

    isInputMode() {
        return this._modeId === EtoPriceQuotationDitemNgComponent.ModeId.Input;
    }

    isLayoutEditorMode() {
        return this._modeId === EtoPriceQuotationDitemNgComponent.ModeId.LayoutDialog;
    }

    protected override initialise() {
        const componentStateElement = this.getInitialComponentStateJsonElement();
        const frameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        this._frame.initialise(
            this._watchlistNgComponent.frame,
            this._callPutGridSourceComponent.frame,
            frameElement
        );

        // this._frame.ensureOpened();

        this._symbolEditComponent.focus();

        this.initialiseChildComponents();

        super.initialise();
    }

    protected override finalise() {
        this._symbolEditUiAction.finalise();
        this._applySymbolUiAction.finalise();
        this._selectColumnsUiAction.finalise();
        this._autoSizeColumnWidthsUiAction.finalise();

        this._frame.finalise();
        super.finalise();
    }

    protected constructLoad(element: JsonElement | undefined) {
        const frameElement = this.tryGetChildFrameJsonElement(element);
        this._frame.constructLoad(frameElement);
    }

    protected save(element: JsonElement) {
        const frameElement = this.createChildFrameJsonElement(element);
        this._frame.save(frameElement);
    }

    private handleSymbolCommitEvent() {
        this.commitSymbol();
    }

    private handleSymbolInputEvent() {
        if (this._symbolEditUiAction.inputtedText === '') {
            this._applySymbolUiAction.pushDisabled();
        } else {
            this._applySymbolUiAction.pushUnselected();
        }
    }

    private handleSymbolSignalEvent() {
        this.commitSymbol();
    }

    private handleColumnsSignalEvent(downKeys: ModifierKey.IdSet) {
        // let layoutWithHeadings: ColumnLayoutRecordStore.LayoutWithHeadersMap;
        // if (ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Shift)) {
        //     layoutWithHeadings = this._watchGridSourceComponent.frame.getColumnLayoutWithHeadersMap();
        // } else {
        //     layoutWithHeadings = this._callPutGridSourceComponent.frame.getColumnLayoutWithHeadersMap();
        // }
        // this._modeId = EtoPriceQuotationDitemNgComponent.ModeId.LayoutDialog;
        // this._layoutEditorComponent.setAllowedFieldsAndLayoutDefinition(layoutWithHeadings);
    }

    private handleAutoSizeColumnWidthsSignalEvent() {
        // TODO
    }

    private handleLayoutEditorComponentCloseEvent(ok: boolean) {
        // if (ok) {
        //     const layout = this._layoutEditorComponent.getColumnLayoutDefinition();
        //     // need to work out which is being edited
        //     this._watchGridSourceComponent.frame.gridLoadLayout(layout);
        // }
        // this._modeId = EtoPriceQuotationDitemNgComponent.ModeId.Input;
    }

    private createSymbolEditUiAction() {
        const action = new DataIvemIdUiAction(this._marketsService.dataMarkets);
        action.valueRequired = false;
        action.pushTitle(Strings[StringId.EtoPriceQuotationSymbolInputTitle]);
        action.commitEvent = () => this.handleSymbolCommitEvent();
        action.inputEvent = () => this.handleSymbolInputEvent();
        return action;
    }

    private createApplySymbolUiAction() {
        const commandName = InternalCommand.Id.EtoPriceQuotation_ApplySymbol;
        const displayId = StringId.EtoPriceQuotationApplySymbolCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.EtoPriceQuotationApplySymbolTitle]);
        action.pushIcon(IconButtonUiAction.IconId.Execute);
        action.signalEvent = () => this.handleSymbolSignalEvent();
        return action;
    }

    private createSelectColumnsUiAction() {
        const commandName = InternalCommand.Id.SelectGridColumns;
        const displayId = StringId.SelectColumnsCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.SelectColumnsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SelectColumns);
        action.pushUnselected();
        action.signalEvent = (signalTypeId, downKeys) => this.handleColumnsSignalEvent(downKeys);
        return action;
    }

    private createAutoSizeColumnWidthsUiAction() {
        const commandName = InternalCommand.Id.AutoSizeGridColumnWidths;
        const displayId = StringId.AutoSizeColumnWidthsCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.AutoSizeColumnWidthsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.AutoSizeColumnWidths);
        action.pushUnselected();
        action.signalEvent = () => this.handleAutoSizeColumnWidthsSignalEvent();
        return action;
    }


    private initialiseChildComponents() {
        this._symbolEditComponent.initialise(this._symbolEditUiAction);
        this._symbolButtonComponent.initialise(this._applySymbolUiAction);
        this._columnsButtonComponent.initialise(this._selectColumnsUiAction);
        this._autoSizeColumnWidthsButtonComponent.initialise(this._autoSizeColumnWidthsUiAction);
    }

    private pushSymbol() {
        this._symbolEditUiAction.pushValue(this._frame.dataIvemId);
    }

    private commitSymbol() {
        const dataIvemId = this._symbolEditUiAction.value;
        if (dataIvemId !== undefined) {
            this._frame.setDataIvemIdFromDitem(dataIvemId);
            this._symbolEditUiAction.pushAccepted();
        }
    }
}

export namespace EtoPriceQuotationDitemNgComponent {
    export namespace JsonName {
        export const watchContent = 'watchContent';
        export const callPutContent = 'callPutContent';
    }

    export const stateSchemaVersion = '2';

    export const enum ModeId {
        Input,
        LayoutDialog,
    }
}
