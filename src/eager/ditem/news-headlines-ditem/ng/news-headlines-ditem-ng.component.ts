import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy, viewChild, ViewContainerRef } from '@angular/core';
import { delay1Tick, JsonElement } from '@pbkware/js-utils';
import { StringUiAction } from '@pbkware/ui-action';
import {
    DataIvemIdUiAction,
    IconButtonUiAction,
    InternalCommand,
    MarketsService,
    StringId,
    Strings
} from '@plxtra/motif-core';
import { AdiNgService, CellPainterFactoryNgService, MarketsNgService, SymbolsNgService } from 'component-services-ng-api';
import { RowDataArrayGridNgComponent } from 'content-ng-api';
import { DataIvemIdSelectNgComponent, SvgButtonNgComponent, TextInputNgComponent } from 'controls-ng-api';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { NewsHeadlinesDitemFrame } from '../news-headlines-ditem-frame';

@Component({
    selector: 'app-news-headlines-ditem',
    templateUrl: './news-headlines-ditem-ng.component.html',
    styleUrls: ['./news-headlines-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class NewsHeadlinesDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    public isMainMode = true;
    public isLayoutEditorMode = false;

    private readonly _symbolEditComponentSignal = viewChild.required<DataIvemIdSelectNgComponent>('symbolInput');
    private readonly _symbolButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('symbolButton');
    private readonly _filterEditComponentSignal = viewChild.required<TextInputNgComponent>('filterInput');
    private readonly _symbolLinkButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('symbolLinkButton');
    private readonly _columnsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('columnsButton');
    private readonly _autoSizeColumnWidthsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('autoSizeColumnWidthsButton');
    private readonly _gridComponentSignal = viewChild.required(RowDataArrayGridNgComponent);
    private readonly _layoutEditorContainerSignal = viewChild.required('layoutEditorContainer', { read: ViewContainerRef });

    private readonly _marketsService: MarketsService;
    private readonly _frame: NewsHeadlinesDitemFrame;

    private readonly _symbolEditUiAction: DataIvemIdUiAction;
    private readonly _symbolApplyUiAction: IconButtonUiAction;
    private readonly _filterEditUiAction: StringUiAction;
    private readonly _toggleSymbolLinkingUiAction: IconButtonUiAction;
    private readonly _autoSizeColumnWidthsUiAction: IconButtonUiAction;
    private readonly _columnsUiAction: IconButtonUiAction;

    private _symbolEditComponent: DataIvemIdSelectNgComponent;
    private _symbolButtonComponent: SvgButtonNgComponent;
    private _filterEditComponent: TextInputNgComponent;
    private _symbolLinkButtonComponent: SvgButtonNgComponent;
    private _columnsButtonComponent: SvgButtonNgComponent;
    private _autoSizeColumnWidthsButtonComponent: SvgButtonNgComponent;
    private _gridComponent: RowDataArrayGridNgComponent;
    private _layoutEditorContainer: ViewContainerRef;

    constructor() {
        super(++NewsHeadlinesDitemNgComponent.typeInstanceCreateCount);

        const marketsNgService = inject(MarketsNgService);
        const desktopAccessNgService = inject(DesktopAccessNgService);
        const symbolsNgService = inject(SymbolsNgService);
        const adiNgService = inject(AdiNgService);
        const cellPainterFactoryNgService = inject(CellPainterFactoryNgService);

        this._marketsService = marketsNgService.service;

        this._frame = new NewsHeadlinesDitemFrame(this, this.settingsService, marketsNgService.service, this.commandRegisterService,
            desktopAccessNgService.service, symbolsNgService.service, adiNgService.service, cellPainterFactoryNgService.service,
            this.rootHtmlElement);

        this._symbolEditUiAction = this.createSymbolEditUiAction();
        this._symbolApplyUiAction = this.createSymbolApplyUiAction();
        this._filterEditUiAction = this.createFilterEditUiAction();
        this._toggleSymbolLinkingUiAction = this.createToggleSymbolLinkingUiAction();
        this._autoSizeColumnWidthsUiAction = this.createAutoSizeColumnWidthsUiAction();
        this._columnsUiAction = this.createColumnsUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());
    }

    get ditemFrame() { return this._frame; }
    protected get stateSchemaVersion() { return NewsHeadlinesDitemNgComponent.stateSchemaVersion; }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._symbolEditComponent = this._symbolEditComponentSignal();
        this._symbolButtonComponent = this._symbolButtonComponentSignal();
        this._filterEditComponent = this._filterEditComponentSignal();
        this._symbolLinkButtonComponent = this._symbolLinkButtonComponentSignal();
        this._columnsButtonComponent = this._columnsButtonComponentSignal();
        this._autoSizeColumnWidthsButtonComponent = this._autoSizeColumnWidthsButtonComponentSignal();
        this._gridComponent = this._gridComponentSignal();
        this._layoutEditorContainer = this._layoutEditorContainerSignal();

        delay1Tick(() => this.initialise());
    }

    protected override initialise() {
        // const componentStateElement = this.getInitialComponentStateJsonElement();
        // const frameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        // this._frame.initialise(this._contentComponent.frame, frameElement);

        this.initialiseComponents();

        super.initialise();
    }

    protected override finalise() {
        this._symbolEditUiAction.finalise();
        this._symbolApplyUiAction.finalise();
        this._filterEditUiAction.finalise();
        this._toggleSymbolLinkingUiAction.finalise();
        this._autoSizeColumnWidthsUiAction.finalise();
        this._columnsUiAction.finalise();

        this._frame.finalise();
        super.finalise();
    }

    protected constructLoad(element: JsonElement | undefined) {
        // nothing to load
    }

    protected save(element: JsonElement) {
        // nothing to save
    }

    private createSymbolEditUiAction() {
        const action = new DataIvemIdUiAction(this._marketsService.dataMarkets);
        action.valueRequired = false;
        action.pushTitle(Strings[StringId.SymbolInputTitle]);
        // action.commitEvent = () => this.handleSymbolCommitEvent();
        // action.inputEvent = () => this.handleSymbolInputEvent();
        return action;
    }

    private createSymbolApplyUiAction() {
        const commandName = InternalCommand.Id.ApplySymbol;
        const displayId = StringId.ApplySymbolCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ApplySymbolTitle]);
        action.pushIcon(IconButtonUiAction.IconId.Execute);
        action.pushDisabled();
        // action.signalEvent = () => this.handleSymbolApplyUiActionSignalEvent();
        return action;
    }

    private createFilterEditUiAction() {
        const action = new StringUiAction();
        action.valueRequired = false;
        action.pushTitle(Strings[StringId.Filter]);
        action.pushPlaceholder(Strings[StringId.Filter]);
        // action.commitEvent = () => this.handleSymbolCommitEvent();
        // action.inputEvent = () => this.handleSymbolInputEvent();
        return action;
    }

    private createToggleSymbolLinkingUiAction() {
        const commandName = InternalCommand.Id.ToggleSymbolLinking;
        const displayId = StringId.ToggleSymbolLinkingCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ToggleSymbolLinkingTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SymbolLink);
        // action.signalEvent = () => this.handleSymbolLinkUiActionSignalEvent();
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
        // action.signalEvent = () => this.handleAutoSizeColumnWidthsUiActionSignalEvent();
        return action;
    }

    private createColumnsUiAction() {
        const commandName = InternalCommand.Id.SelectGridColumns;
        const displayId = StringId.SelectColumnsCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.SelectColumnsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SelectColumns);
        action.pushUnselected();
        // action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }

    private initialiseComponents() {
        this._symbolEditComponent.initialise(this._symbolEditUiAction);
        this._symbolButtonComponent.initialise(this._symbolApplyUiAction);
        this._filterEditComponent.initialise(this._filterEditUiAction);
        this._symbolLinkButtonComponent.initialise(this._toggleSymbolLinkingUiAction);
        this._autoSizeColumnWidthsButtonComponent.initialise(this._autoSizeColumnWidthsUiAction);
        this._columnsButtonComponent.initialise(this._columnsUiAction);

        // this._frame.open();
    }
}

export namespace NewsHeadlinesDitemNgComponent {
    export const stateSchemaVersion = '2';
}

