import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy, viewChild, ViewContainerRef } from '@angular/core';
import {
    CommaText,
    delay1Tick,
    getErrorMessage,
    JsonElement,
    ModifierKey,
    ModifierKeyId
} from '@pbkware/js-utils';
import { StringUiAction, UiAction } from '@pbkware/ui-action';
import {
    DataIvemId,
    DataIvemIdUiAction,
    IconButtonUiAction,
    InternalCommand,
    MarketsService,
    StringId,
    Strings
} from '@plxtra/motif-core';
import { AdiNgService, MarketsNgService, SymbolsNgService } from 'component-services-ng-api';
import { DepthColumnLayoutsDialogNgComponent, DepthNgComponent } from 'content-ng-api';
import { DataIvemIdSelectNgComponent, SvgButtonNgComponent, TextInputNgComponent } from 'controls-ng-api';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { DepthDitemFrame } from '../depth-ditem-frame';

@Component({
    selector: 'app-depth-ditem',
    templateUrl: './depth-ditem-ng.component.html',
    styleUrls: ['./depth-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DepthDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements OnDestroy, AfterViewInit, DepthDitemFrame.ComponentAccess {
    private static typeInstanceCreateCount = 0;

    public isLayoutEditorVisible = false;

    private readonly _symbolInputComponentSignal = viewChild.required<DataIvemIdSelectNgComponent>('symbolInput');
    private readonly _symbolButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('symbolButton');
    private readonly _symbolLinkButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('symbolLinkButton');
    private readonly _rollUpButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('rollUpButton');
    private readonly _rollDownButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('rollDownButton');
    private readonly _filterButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('filterButton');
    private readonly _filterEditComponentSignal = viewChild.required<TextInputNgComponent>('filterEdit');
    private readonly _columnsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('columnsButton');
    private readonly _autoSizeColumnWidthsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('autoSizeColumnWidthsButton');
    private readonly _depthComponentSignal = viewChild.required<DepthNgComponent>('depthContent');
    private readonly _layoutEditorContainerSignal = viewChild.required('layoutEditorContainer', { read: ViewContainerRef });

    private readonly _marketsService: MarketsService;

    private readonly _symbolInputUiAction: DataIvemIdUiAction;
    private readonly _symbolApplyUiAction: IconButtonUiAction;
    private readonly _toggleSymbolLinkingUiAction: IconButtonUiAction;
    private readonly _rollUpUiAction: IconButtonUiAction;
    private readonly _expandUiAction: IconButtonUiAction;
    private readonly _filterUiAction: IconButtonUiAction;
    private readonly _filterEditUiAction: StringUiAction;
    private readonly _autoSizeColumnWidthsUiAction: IconButtonUiAction;
    private readonly _columnsUiAction: IconButtonUiAction;

    private readonly _frame: DepthDitemFrame;

    private _symbolInputComponent: DataIvemIdSelectNgComponent;
    private _symbolButtonComponent: SvgButtonNgComponent;
    private _symbolLinkButtonComponent: SvgButtonNgComponent;
    private _rollUpButtonComponent: SvgButtonNgComponent;
    private _rollDownButtonComponent: SvgButtonNgComponent;
    private _filterButtonComponent: SvgButtonNgComponent;
    private _filterEditComponent: TextInputNgComponent;
    private _columnsButtonComponent: SvgButtonNgComponent;
    private _autoSizeColumnWidthsButtonComponent: SvgButtonNgComponent;
    private _layoutEditorContainer: ViewContainerRef;

    constructor() {
        super(++DepthDitemNgComponent.typeInstanceCreateCount);

        const marketsNgService = inject(MarketsNgService);
        const desktopAccessNgService = inject(DesktopAccessNgService);
        const adiNgService = inject(AdiNgService);
        const symbolsNgService = inject(SymbolsNgService);

        this._marketsService = marketsNgService.service;

        this._frame = new DepthDitemFrame(this, this.settingsService, marketsNgService.service, this.commandRegisterService,
            desktopAccessNgService.service, symbolsNgService.service, adiNgService.service);

        this._symbolInputUiAction = this.createSymbolInputUiAction();
        this._symbolApplyUiAction = this.createSymbolApplyUiAction();
        this._toggleSymbolLinkingUiAction = this.createToggleSymbolLinkingUiAction();
        this._rollUpUiAction = this.createRollUpUiAction();
        this._expandUiAction = this.createExpandUiAction();
        this._filterUiAction = this.createFilterUiAction();
        this._filterEditUiAction = this.createFilterEditUiAction();
        this._autoSizeColumnWidthsUiAction = this.createAutoSizeColumnWidthsUiAction();
        this._columnsUiAction = this.createColumnsUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());

        this.pushSymbol(this._frame.dataIvemId);
        this.pushSymbolLinkSelectState();

    }

    get ditemFrame() { return this._frame; }
    protected get stateSchemaVersion() { return DepthDitemNgComponent.stateSchemaVersion; }

    public ngOnDestroy() {
        this.finalise();
    }

    public ngAfterViewInit() {
        this._symbolInputComponent = this._symbolInputComponentSignal();
        this._symbolButtonComponent = this._symbolButtonComponentSignal();
        this._symbolLinkButtonComponent = this._symbolLinkButtonComponentSignal();
        this._rollUpButtonComponent = this._rollUpButtonComponentSignal();
        this._rollDownButtonComponent = this._rollDownButtonComponentSignal();
        this._filterButtonComponent = this._filterButtonComponentSignal();
        this._filterEditComponent = this._filterEditComponentSignal();
        this._columnsButtonComponent = this._columnsButtonComponentSignal();
        this._autoSizeColumnWidthsButtonComponent = this._autoSizeColumnWidthsButtonComponentSignal();
        this._layoutEditorContainer = this._layoutEditorContainerSignal();

        delay1Tick(() => this.initialise());
    }

    // TradesDitemFrame.ComponentAccess methods
    public pushSymbol(dataIvemId: DataIvemId | undefined) {
        this._symbolInputUiAction.pushValue(dataIvemId);
    }

    public notifyOpenedClosed(dataIvemId: DataIvemId | undefined) {
        this.pushSymbol(dataIvemId);
        this.pushFilterEditValue();
        this._symbolApplyUiAction.pushDisabled();
        this.pushAccepted();
    }

    public override processSymbolLinkedChanged() {
        this.pushSymbolLinkSelectState();
    }

    protected override initialise() {
        const componentStateElement = this.getInitialComponentStateJsonElement();
        const ditemFrameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        this._frame.initialise(ditemFrameElement, this._depthComponentSignal().frame);

        this.pushFilterSelectState();
        this.pushFilterEditValue();

        this.initialiseChildComponents();

        this._frame.open();

        super.initialise();
    }

    protected override finalise() {
        this._symbolInputUiAction.finalise();
        this._symbolApplyUiAction.finalise();
        this._toggleSymbolLinkingUiAction.finalise();
        this._rollUpUiAction.finalise();
        this._expandUiAction.finalise();
        this._filterUiAction.finalise();
        this._filterEditUiAction.finalise();
        this._autoSizeColumnWidthsUiAction.finalise();
        this._columnsUiAction.finalise();

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

    // protected override processShown() {
    //     this._frame.adviseShown();
    // }

    private handleSymbolCommitEvent(typeId: UiAction.CommitTypeId) {
        this.commitSymbol(typeId);
    }

    private handleSymbolInputEvent() {
        if (this._symbolInputUiAction.inputtedText === '') {
            this._symbolApplyUiAction.pushDisabled();
        } else {
            // if (!this._symbolEditUiAction.inputtedParseDetails.success) {
            //     this._symbolApplyUiAction.pushDisabled();
            // } else {
            //     if (this._symbolEditUiAction.isInputtedSameAsCommitted()) {
            //         this._symbolApplyUiAction.pushDisabled();
            //     } else {
                    this._symbolApplyUiAction.pushUnselected();
            //     }
            // }
        }
    }

    private handleSymbolApplyUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this.commitSymbol(UiAction.CommitTypeId.Explicit);
    }

    private handleSymbolLinkUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this._frame.dataIvemIdLinked = !this._frame.dataIvemIdLinked;
    }

    private handleRollUpUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this._frame.rollUp(ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Shift));
    }

    private handleExpandUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this._frame.expand(ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Shift));
    }

    private handleFilterUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this._frame.toggleFilterActive();
        this.pushFilterSelectState();
    }

    private handleFilterEditUiActionCommitEvent(typeId: UiAction.CommitTypeId) {
        const toArrayResult = CommaText.tryToStringArray(this._filterEditUiAction.definedValue, false);
        if (toArrayResult.isOk()) {
            this._frame.setFilter(toArrayResult.value);
            this.pushFilterEditValue();
        } else {
            this._filterUiAction.pushInvalid(Strings[StringId.Depth_InvalidFilterXrefs]);
        }
    }

    private handleAutoSizeColumnWidthsUiActionSignalEvent(_signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        const widenOnly = ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Shift);
        this._frame.autoSizeAllColumnWidths(widenOnly);
    }

    private handleColumnsUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this.showLayoutEditor();
    }

    private createSymbolInputUiAction() {
        const action = new DataIvemIdUiAction(this._marketsService.dataMarkets);
        action.valueRequired = false;
        action.pushTitle(Strings[StringId.SymbolInputTitle]);
        action.commitEvent = (typeId) => this.handleSymbolCommitEvent(typeId);
        action.inputEvent = () => this.handleSymbolInputEvent();
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
        action.signalEvent = (signalTypeId, downKeys) => this.handleSymbolApplyUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private createToggleSymbolLinkingUiAction() {
        const commandName = InternalCommand.Id.ToggleSymbolLinking;
        const displayId = StringId.ToggleSymbolLinkingCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ToggleSymbolLinkingTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SymbolLink);
        action.signalEvent = (signalTypeId, downKeys) => this.handleSymbolLinkUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private createRollUpUiAction() {
        const commandName = InternalCommand.Id.Depth_Rollup;
        const displayId = StringId.Depth_RollUpCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.Depth_RollUpToPriceLevelsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.RollUp);
        action.signalEvent = (signalTypeId, downKeys) => this.handleRollUpUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private createExpandUiAction() {
        const commandName = InternalCommand.Id.Depth_Expand;
        const displayId = StringId.Depth_ExpandCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.Depth_ExpandToOrdersTitle]);
        action.pushIcon(IconButtonUiAction.IconId.RollDown);
        action.signalEvent = (signalTypeId, downKeys) => this.handleExpandUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private createFilterUiAction() {
        const commandName = InternalCommand.Id.Depth_Filter;
        const displayId = StringId.Depth_FilterCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.Depth_FilterToXrefsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.Filter);
        action.signalEvent = (signalTypeId, downKeys) => this.handleFilterUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private createFilterEditUiAction() {
        const action = new StringUiAction();
        action.pushTitle(Strings[StringId.Depth_SpecifyFilterXrefsTitle]);
        action.commitEvent = (typeId) => this.handleFilterEditUiActionCommitEvent(typeId);
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
        action.signalEvent = (signalTypeId, downKeys) => this.handleAutoSizeColumnWidthsUiActionSignalEvent(signalTypeId, downKeys);
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
        action.signalEvent = (signalTypeId, downKeys) => this.handleColumnsUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private initialiseChildComponents() {
        this._symbolInputComponent.initialise(this._symbolInputUiAction);
        this._symbolButtonComponent.initialise(this._symbolApplyUiAction);
        this._symbolLinkButtonComponent.initialise(this._toggleSymbolLinkingUiAction);
        this._rollUpButtonComponent.initialise(this._rollUpUiAction);
        this._rollDownButtonComponent.initialise(this._expandUiAction);
        this._filterButtonComponent.initialise(this._filterUiAction);
        this._filterEditComponent.initialise(this._filterEditUiAction);
        this._autoSizeColumnWidthsButtonComponent.initialise(this._autoSizeColumnWidthsUiAction);
        this._columnsButtonComponent.initialise(this._columnsUiAction);

        this._frame.open();
    }

    private commitSymbol(typeId: UiAction.CommitTypeId) {
        const dataIvemId = this._symbolInputUiAction.value;
        if (dataIvemId !== undefined) {
            this._frame.setDataIvemIdFromDitem(dataIvemId);
        }
        this.pushValid();
    }

    private pushSymbolLinkSelectState() {
        if (this._frame.dataIvemIdLinked) {
            this._toggleSymbolLinkingUiAction.pushSelected();
        } else {
            this._toggleSymbolLinkingUiAction.pushUnselected();
        }
    }

    private pushFilterSelectState() {
        if (this._frame.filterActive) {
            this._filterUiAction.pushSelected();
        } else {
            this._filterUiAction.pushUnselected();
        }
    }

    private pushFilterEditValue() {
        const filterXrefs = this._frame.filterXrefs;
        const value = CommaText.fromStringArray(filterXrefs);
        this._filterEditUiAction.pushValue(value);
    }

    private pushAccepted() {
        this._symbolApplyUiAction.pushAccepted();
    }

    private pushValid() {
        this._symbolApplyUiAction.pushValidOrMissing();
    }

    private showLayoutEditor() {
        this.isLayoutEditorVisible = true;
        const allowedFieldColumnLayoutDefinition = this._frame.createAllowedSourcedFieldsColumnLayoutDefinitions();

        const closePromise = DepthColumnLayoutsDialogNgComponent.open(
            this._layoutEditorContainer,
            this._frame.opener,
            Strings[StringId.Depth_ColumnsDialogCaption],
            allowedFieldColumnLayoutDefinition
        );
        closePromise.then(
            (layouts) => {
                if (layouts !== undefined) {
                    this._frame.applyColumnLayoutDefinitions(layouts);
                }
                this.closeLayoutEditor();
            },
            (reason: unknown) => {
                const errorText = getErrorMessage(reason);
                window.motifLogger.logError(`DepthInput Layout Editor error: ${errorText}`);
                this.closeLayoutEditor();
            }
        );

        this.markForCheck();
    }

    private closeLayoutEditor() {
        this._layoutEditorContainer.clear();
        this.isLayoutEditorVisible = false;
        this.markForCheck();
    }
}

export namespace DepthDitemNgComponent {
    export const stateSchemaVersion = '2';
}
