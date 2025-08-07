import { AfterViewInit, ChangeDetectorRef, Directive, inject, InjectionToken, OnDestroy, viewChild } from '@angular/core';
import { AssertInternalError, delay1Tick, Integer, LockOpenListItem, MultiEvent } from '@pbkware/js-utils';
import { StringUiAction } from '@pbkware/ui-action';
import {
    AllowedSourcedFieldsColumnLayoutDefinition,
    ColumnLayoutOrReference,
    CommandRegisterService,
    DataIvemBaseDetail,
    DataIvemBaseDetailTableFieldSourceDefinition,
    DataIvemId,
    DataIvemIdComparableListTableRecordSourceDefinition,
    DataIvemIdTableFieldSourceDefinition,
    DataIvemIdUiAction,
    IconButtonUiAction,
    InternalCommand,
    MarketsService,
    StringId,
    Strings,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactory,
    UiComparableList
} from '@plxtra/motif-core';
import {
    CommandRegisterNgService,
    CoreInjectionTokens,
    MarketsNgService,
    ToastNgService
} from 'component-services-ng-api';
import { DataIvemIdSelectNgComponent, SvgButtonNgComponent, TextInputNgComponent } from 'controls-ng-api';
import { RevColumnLayoutOrReferenceDefinition } from 'revgrid';
import { DataIvemIdListNgComponent } from '../../lit-ivem-id-list/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { TableFieldSourceDefinitionCachingFactoryNgService } from '../../ng/table-field-source-definition-caching-factory-ng.service';

@Directive()
export abstract class DataIvemIdListEditorNgDirective extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    public counts = '0';

    editGridColumnsEventer: DataIvemIdListEditorNgDirective.EditGridColumnsEventer | undefined;
    popoutEventer: DataIvemIdListEditorNgDirective.PopoutEventer | undefined;

    readonly list: UiComparableList<DataIvemId>;
    readonly opener = inject<LockOpenListItem.Opener>(CoreInjectionTokens.lockOpenListItemOpener);

    protected readonly _cdr = inject(ChangeDetectorRef);
    private readonly _toastNgService = inject(ToastNgService);

    private readonly _addDataIvemIdControlComponentSignal = viewChild.required<DataIvemIdSelectNgComponent>('addDataIvemIdControl');
    private readonly _selectAllControlComponentSignal = viewChild.required<SvgButtonNgComponent>('selectAllControl');
    private readonly _removeSelectedControlComponentSignal = viewChild.required<SvgButtonNgComponent>('removeSelectedControl');
    private readonly _columnsControlComponentSignal = viewChild.required<SvgButtonNgComponent>('columnsControl');
    private readonly _popoutControlComponentSignal = viewChild<SvgButtonNgComponent>('popoutControl');
    private readonly _filterControlComponentSignal = viewChild.required<TextInputNgComponent>('filterControl');
    private readonly _dataIvemIdListComponentSignal = viewChild.required<DataIvemIdListNgComponent>('grid');

    private readonly _marketsService: MarketsService;
    private readonly _fieldSourceDefinitionRegistryService: TableFieldSourceDefinitionCachingFactory;

    private readonly _addDataIvemIdUiAction: DataIvemIdUiAction;
    private readonly _selectAllUiAction: IconButtonUiAction;
    private readonly _removeSelectedUiAction: IconButtonUiAction;
    private readonly _columnsUiAction: IconButtonUiAction;
    private readonly _popoutUiAction: IconButtonUiAction;
    private readonly _filterUiAction: StringUiAction;

    private _addDataIvemIdControlComponent: DataIvemIdSelectNgComponent;
    private _selectAllControlComponent: SvgButtonNgComponent;
    private _removeSelectedControlComponent: SvgButtonNgComponent;
    private _columnsControlComponent: SvgButtonNgComponent;
    private _popoutControlComponent: SvgButtonNgComponent | undefined;
    private _filterControlComponent: TextInputNgComponent;
    private _dataIvemIdListComponent: DataIvemIdListNgComponent;

    private _enabled = true;

    private _afterListChangedMultiEvent = new MultiEvent<DataIvemIdListEditorNgDirective.AfterListChangedEventHandler>();
    private _listChangeSubscriptionId: MultiEvent.SubscriptionId | undefined;

    constructor(typeInstanceCreateCount: Integer) {
        super(typeInstanceCreateCount);

        const list = inject<UiComparableList<DataIvemId> | null>(DataIvemIdListEditorNgDirective.listInjectionToken, { optional: true });

        const marketsNgService = inject(MarketsNgService);
        const commandRegisterNgService = inject(CommandRegisterNgService);
        const fieldSourceDefinitionCachedFactoryNgService = inject(TableFieldSourceDefinitionCachingFactoryNgService);

        if (list === null) {
            this.list = new UiComparableList<DataIvemId>();
        } else {
            this.list = list;
        }

        this._marketsService = marketsNgService.service;
        this._fieldSourceDefinitionRegistryService = fieldSourceDefinitionCachedFactoryNgService.service;

        const commandRegisterService = commandRegisterNgService.service;

        this._addDataIvemIdUiAction = this.createAddDataIvemIdUiAction();
        this._selectAllUiAction = this.createSelectAllUiAction(commandRegisterService);
        this._removeSelectedUiAction = this.createRemoveSelectedUiAction(commandRegisterService);
        this._columnsUiAction = this.createColumnsUiAction(commandRegisterService);
        this._popoutUiAction = this.createPopoutUiAction(commandRegisterService);
        this._filterUiAction = this.createFilterUiAction();
    }

    get enabled() { return this._enabled; }
    set enabled(value: boolean) {
        if (value !== this._enabled) {
            this._enabled = value;
            this.updateControlsEnabled();
        }
    }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this.processAfterViewInit();
    }

    clearAllControls() {
        this._addDataIvemIdUiAction.pushValue(undefined);
        this._selectAllUiAction.pushValue(undefined);
        this._removeSelectedUiAction.pushValue(undefined);
        this._filterUiAction.pushValue(undefined);
        this.list.clear();
    }

    cancelAllControlsEdited() {
        this._addDataIvemIdUiAction.cancelEdit();
        this._selectAllUiAction.cancelEdit();
        this._removeSelectedUiAction.cancelEdit();
        this._columnsUiAction.cancelEdit();
        this._popoutUiAction.cancelEdit();
        this._filterUiAction.cancelEdit();
    }

    subscribeAfterListChangedEvent(handler: DataIvemIdListEditorNgDirective.AfterListChangedEventHandler) {
        return this._afterListChangedMultiEvent.subscribe(handler);
    }

    unsubscribeAfterListChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._afterListChangedMultiEvent.unsubscribe(subscriptionId);
    }

    protected finalise() {
        this._dataIvemIdListComponent.frame.grid.dataServersRowListChangedEventer = undefined;

        this.list.unsubscribeListChangeEvent(this._listChangeSubscriptionId);
        this._listChangeSubscriptionId = undefined;

        this._addDataIvemIdUiAction.finalise();
        this._selectAllUiAction.finalise();
        this._removeSelectedUiAction.finalise();
        this._columnsUiAction.finalise();
        this._popoutUiAction.finalise();
        this._filterUiAction.finalise();
    }

    protected processAfterViewInit() {
        this._addDataIvemIdControlComponent = this._addDataIvemIdControlComponentSignal();
        this._selectAllControlComponent = this._selectAllControlComponentSignal();
        this._removeSelectedControlComponent = this._removeSelectedControlComponentSignal();
        this._columnsControlComponent = this._columnsControlComponentSignal();
        this._popoutControlComponent = this._popoutControlComponentSignal();
        this._filterControlComponent = this._filterControlComponentSignal();
        this._dataIvemIdListComponent = this._dataIvemIdListComponentSignal();

        delay1Tick(() => this.initialiseComponents());
    }

    protected editGridColumns(allowedFieldsAndLayoutDefinition: AllowedSourcedFieldsColumnLayoutDefinition) {
        if (this.editGridColumnsEventer === undefined) {
            return Promise.resolve(undefined);
        } else {
            return this.editGridColumnsEventer(allowedFieldsAndLayoutDefinition);
        }
    }

    private createAddDataIvemIdUiAction() {
        const action = new DataIvemIdUiAction(this._marketsService.dataMarkets);
        action.valueRequired = false;
        action.pushTitle(Strings[StringId.SymbolInputTitle]);
        action.commitEvent = () => {
            this.list.uiAdd(action.definedValue);
        }
        return action;
    }

    private createSelectAllUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.Grid_SelectAll;
        const displayId = StringId.Grid_SelectAllCaption;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.Grid_SelectAllTitle]);
        action.pushIcon(IconButtonUiAction.IconId.MarkAll);
        action.pushUnselected();
        action.signalEvent = () => {
            this._dataIvemIdListComponent.selectAllRows();
        };
        return action;
    }

    private createRemoveSelectedUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.Grid_RemoveSelected;
        const displayId = StringId.DataIvemIdListEditor_RemoveSelectedCaption;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.DataIvemIdListEditor_RemoveSelectedTitle]);
        action.pushIcon(IconButtonUiAction.IconId.RemoveSelectedFromList);
        action.pushUnselected();
        action.signalEvent = () => {
            const selectedIndices = this._dataIvemIdListComponent.getSelectedRecordIndices();
            this.list.uiRemoveAtIndices(selectedIndices);
        };
        return action;
    }

    private createColumnsUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.SelectGridColumns;
        const displayId = StringId.SelectColumnsCaption;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.SelectColumnsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SelectColumns);
        action.pushUnselected();
        action.signalEvent = () => { this.handleColumnsSignalEvent(); };
        return action;
    }

    private createPopoutUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.Popout;
        const displayId = StringId.DataIvemIdListEditor_PopoutCaption;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.DataIvemIdListEditor_PopoutTitle]);
        action.pushIcon(IconButtonUiAction.IconId.EnlargeToTopLeft);
        action.pushUnselected();
        action.signalEvent = () => {
            if (this.popoutEventer !== undefined) {
                this.popoutEventer(this.list);
            }
        };
        return action;
    }

    private createFilterUiAction() {
        const action = new StringUiAction(false);
        action.pushTitle(Strings[StringId.Filter]);
        action.pushPlaceholder(Strings[StringId.Filter]);
        action.commitEvent = () => {
            this._dataIvemIdListComponent.filterText = action.definedValue;
            this.updateCounts();
        }
        return action;
    }

    private initialiseComponents() {
        this._addDataIvemIdControlComponent.initialise(this._addDataIvemIdUiAction);
        this._selectAllControlComponent.initialise(this._selectAllUiAction);
        this._removeSelectedControlComponent.initialise(this._removeSelectedUiAction);
        this._columnsControlComponent.initialise(this._columnsUiAction);
        if (this._popoutControlComponent !== undefined) {
            this._popoutControlComponent.initialise(this._popoutUiAction);
        }
        this._filterControlComponent.initialise(this._filterUiAction);

        this._listChangeSubscriptionId = this.list.subscribeAfterListChangedEvent(
            (ui) => {
                this.updateControlsEnabled();
                this.notifyListChange(ui);
            }
        );

        this._dataIvemIdListComponent.selectionChangedEventer = () => {
            this.updateControlsEnabled();
            this.updateCounts();
        }

        const layoutDefinition = this.createDefaultLayoutDefinition();
        const columnLayoutOrReferenceDefinition = new RevColumnLayoutOrReferenceDefinition(layoutDefinition);

        this._dataIvemIdListComponent.initialise(this.opener, columnLayoutOrReferenceDefinition, undefined, true);

        const openPromise = this._dataIvemIdListComponent.tryOpenList(this.list, true);
        openPromise.then(
            (openResult) => {
                if (openResult.isErr()) {
                    this._toastNgService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.DataIvemIdListEditor]}: ${openResult.error}`);
                } else {
                    this._dataIvemIdListComponent.frame.grid.dataServersRowListChangedEventer = () => this.updateCounts();
                    this.updateControlsEnabled();
                    this.updateCounts();
                }
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'LIILENCICE56569') }
        );
    }

    private createDefaultLayoutDefinition() {
        const dataIvemIdFieldId: DataIvemIdTableFieldSourceDefinition.FieldId = {
            sourceTypeId: TableFieldSourceDefinition.TypeId.DataIvemId,
            id: DataIvemId.FieldId.DataIvemId,
        };
        const nameFieldId: DataIvemBaseDetailTableFieldSourceDefinition.FieldId = {
            sourceTypeId: TableFieldSourceDefinition.TypeId.DataIvemBaseDetail,
            id: DataIvemBaseDetail.Field.Id.Name,
        };

        return DataIvemIdComparableListTableRecordSourceDefinition.createLayoutDefinition(
            this._fieldSourceDefinitionRegistryService,
            [dataIvemIdFieldId, nameFieldId],
        );
    }

    private handleColumnsSignalEvent() {
        const allowedFieldsAndLayoutDefinition = this._dataIvemIdListComponent.createAllowedSourcedFieldsColumnLayoutDefinition();
        const editFinishPromise = this.editGridColumns(allowedFieldsAndLayoutDefinition);
        editFinishPromise.then(
            (layoutOrReferenceDefinition) => {
                if (layoutOrReferenceDefinition !== undefined) {
                    const openPromise = this._dataIvemIdListComponent.tryOpenColumnLayoutOrReferenceDefinition(layoutOrReferenceDefinition);
                    openPromise.then(
                        (openResult) => {
                            if (openResult.isErr()) {
                                const error = ColumnLayoutOrReference.formatError(openResult.error);
                                this._toastNgService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.DataIvemIdListEditor]} ${Strings[StringId.ColumnLayout]}: ${error}`);
                            }
                        },
                        (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'LIILENDHCSEOP56668'); }
                    );
                }
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'LIILENDHCSEEFP56668'); }
        );
    }

    private updateCounts() {
        const recordCount = this.list.count;
        const counts = `(${this._dataIvemIdListComponent.mainRowCount}/${recordCount})`;

        if (counts !== this.counts) {
            this.counts = counts;
            this._cdr.markForCheck();
        }
    }

    private updateControlsEnabled() {
        if (this._enabled) {
            this._addDataIvemIdUiAction.pushValidOrMissing();
            if (this._dataIvemIdListComponent.areRowsSelected(true)) {
                this._removeSelectedUiAction.pushValidOrMissing();
            } else {
                this._removeSelectedUiAction.pushDisabled();
            }
            this._filterUiAction.pushValidOrMissing();
            if (this.list.count > 0) {
                this._selectAllUiAction.pushValidOrMissing();
            } else {
                this._selectAllUiAction.pushDisabled();
            }
        } else {
            this._addDataIvemIdUiAction.pushDisabled();
            this._selectAllUiAction.pushDisabled();
            this._removeSelectedUiAction.pushDisabled();
            this._filterUiAction.pushDisabled();
        }
    }

    private notifyListChange(ui: boolean) {
        const handlers = this._afterListChangedMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](ui);
        }
    }
}

export namespace DataIvemIdListEditorNgDirective {
    export type AfterListChangedEventHandler = (this: void, ui: boolean) => void;
    export type EditGridColumnsEventer = (this: void, allowedFieldsAndLayoutDefinition: AllowedSourcedFieldsColumnLayoutDefinition) => Promise<RevColumnLayoutOrReferenceDefinition | undefined>;
    export type PopoutEventer = (this: void, list: UiComparableList<DataIvemId>) => void;

    export const listInjectionToken = new InjectionToken<UiComparableList<DataIvemId>>('DataIvemIdListEditorNgDirective.list');

    export const initialCustomGridSettingsProvider: DataIvemIdListNgComponent.InitialCustomGridSettingsProvider = {
        provide: DataIvemIdListNgComponent.initialCustomGridSettingsInjectionToken,
        useValue: {
            fixedColumnCount: 1,
            switchNewRectangleSelectionToRowOrColumn: 'row',
        }
    }
}
