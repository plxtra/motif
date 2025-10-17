import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, ViewContainerRef, inject, viewChild } from '@angular/core';
import { AssertInternalError, JsonElement, LockOpenListItem, ModifierKey, ModifierKeyId, delay1Tick } from '@pbkware/js-utils';
import { IntegerListSelectItemUiAction, UiAction } from '@pbkware/ui-action';
import {
    AllowedSourcedFieldsColumnLayoutDefinition,
    ButtonUiAction,
    ColumnLayoutOrReference,
    IconButtonUiAction,
    InternalCommand,
    NotificationDistributionMethod,
    StringId,
    Strings
} from '@plxtra/motif-core';
import { AdiNgService, CoreInjectionTokens, LockOpenListItemOpenerNgUseClass, MarketsNgService, NotificationChannelsNgService, SymbolsNgService, ToastNgService } from 'component-services-ng-api';
import { LockOpenNotificationChannelPropertiesNgComponent, LockOpenNotificationChannelsGridNgComponent, NameableColumnLayoutEditorDialogNgComponent } from 'content-ng-api';
import { ButtonInputNgComponent, IntegerEnumInputNgComponent, SvgButtonNgComponent } from 'controls-ng-api';
import { RevColumnLayoutOrReferenceDefinition } from 'revgrid';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { NotificationChannelsDitemFrame } from '../notification-channels-ditem-frame';
import { SplitComponent, SplitAreaComponent } from 'angular-split';

@Component({
    selector: 'app-notifications-ditem-ng',
    templateUrl: './notification-channels-ditem-ng.component.html',
    styleUrls: ['./notification-channels-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: CoreInjectionTokens.lockOpenListItemOpener, useClass: LockOpenListItemOpenerNgUseClass }],
    imports: [IntegerEnumInputNgComponent, SvgButtonNgComponent, SplitComponent, SplitAreaComponent, LockOpenNotificationChannelsGridNgComponent, ButtonInputNgComponent, LockOpenNotificationChannelPropertiesNgComponent]
})
export class NotificationChannelsDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    public listAreaWidth = 540;
    public listAreaMinWidth = 50;
    public splitterGutterSize = 3;

    public dialogActive = false;

    private readonly _toastNgService = inject(ToastNgService);
    private readonly _opener = inject<LockOpenListItem.Opener>(CoreInjectionTokens.lockOpenListItemOpener, { self: true });

    private readonly _addControlComponentSignal = viewChild.required<IntegerEnumInputNgComponent>('addControl');
    private readonly _deleteSelectedControlComponentSignal = viewChild.required<SvgButtonNgComponent>('deleteSelectedControl');
    private readonly _selectAllControlComponentSignal = viewChild.required<SvgButtonNgComponent>('selectAllControl');
    private readonly _columnsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('columnsButton');
    private readonly _autoSizeColumnWidthsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('autoSizeColumnWidthsButton');
    private readonly _gridComponentSignal = viewChild.required<LockOpenNotificationChannelsGridNgComponent>('grid');
    private readonly _refreshListControlComponentSignal = viewChild.required<ButtonInputNgComponent>('refreshListControl');
    private readonly _propertiesComponentSignal = viewChild.required<LockOpenNotificationChannelPropertiesNgComponent>('properties');
    private readonly _dialogContainerSignal = viewChild.required('dialogContainer', { read: ViewContainerRef });

    private readonly _refreshListUiAction: ButtonUiAction;
    private readonly _addUiAction: IntegerListSelectItemUiAction;
    private readonly _deleteSelectedUiAction: IconButtonUiAction;
    private readonly _selectAllUiAction: IconButtonUiAction;
    private readonly _autoSizeColumnWidthsUiAction: IconButtonUiAction;
    private readonly _columnsUiAction: IconButtonUiAction;

    private readonly _frame: NotificationChannelsDitemFrame;

    // recordFocusEventer: ScansNgComponent.RecordFocusEventer;
    // gridClickEventer: ScansNgComponent.GridClickEventer;
    // columnsViewWithsChangedEventer: ScansNgComponent.ColumnsViewWithsChangedEventer;

    private _addControlComponent: IntegerEnumInputNgComponent;
    private _deleteSelectedControlComponent: SvgButtonNgComponent;
    private _selectAllControlComponent: SvgButtonNgComponent;
    private _columnsButtonComponent: SvgButtonNgComponent;
    private _autoSizeColumnWidthsButtonComponent: SvgButtonNgComponent;
    private _gridComponent: LockOpenNotificationChannelsGridNgComponent;
    private _refreshListControlComponent: ButtonInputNgComponent;
    private _propertiesComponent: LockOpenNotificationChannelPropertiesNgComponent;
    private _dialogContainer: ViewContainerRef;

    constructor() {
        super(++NotificationChannelsDitemNgComponent.typeInstanceCreateCount);

        const marketsNgService = inject(MarketsNgService);
        const desktopAccessNgService = inject(DesktopAccessNgService);
        const symbolsNgService = inject(SymbolsNgService);
        const adiNgService = inject(AdiNgService);
        const notificationChannelsNgService = inject(NotificationChannelsNgService);

        this._opener = {
            lockerName: `${Strings[StringId.Notifications]}:${NotificationChannelsDitemNgComponent.typeInstanceCreateCount}`,
        };

        this._frame = new NotificationChannelsDitemFrame(
            this,
            this.settingsService,
            marketsNgService.service,
            this.commandRegisterService,
            desktopAccessNgService.service,
            symbolsNgService.service,
            adiNgService.service,
            notificationChannelsNgService.service,
            this._toastNgService.service,
            this._opener,
            (channel) => this._propertiesComponent.setLockOpenNotificationChannel(channel, false),
        );

        this._refreshListUiAction = this.createRefreshListUiAction();
        this._addUiAction = this.createAddUiAction();
        this._deleteSelectedUiAction = this.createDeleteSelectedUiAction();
        this._selectAllUiAction = this.createSelectAllUiAction();
        this._autoSizeColumnWidthsUiAction = this.createAutoSizeColumnWidthsUiAction();
        this._columnsUiAction = this.createColumnsUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());
    }

    get ditemFrame() { return this._frame; }
    protected get stateSchemaVersion() { return NotificationChannelsDitemNgComponent.stateSchemaVersion; }

    public ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._addControlComponent = this._addControlComponentSignal();
        this._deleteSelectedControlComponent = this._deleteSelectedControlComponentSignal();
        this._selectAllControlComponent = this._selectAllControlComponentSignal();
        this._columnsButtonComponent = this._columnsButtonComponentSignal();
        this._autoSizeColumnWidthsButtonComponent = this._autoSizeColumnWidthsButtonComponentSignal();
        this._gridComponent = this._gridComponentSignal();
        this._refreshListControlComponent = this._refreshListControlComponentSignal();
        this._propertiesComponent = this._propertiesComponentSignal();
        this._dialogContainer = this._dialogContainerSignal();

        delay1Tick(() => this.initialise());
    }

    handleSplitterDragEnd() {
        //
    }

    protected override initialise() {
        this.initialiseChildComponents();

        const componentStateElement = this.getInitialComponentStateJsonElement();
        const frameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        this._frame.initialise(frameElement, this._gridComponent.frame);

        this._frame.gridSelectionChangedEventer = () => { this.pushDeleteSelectedEnabledDisabled(); }
        this.pushDeleteSelectedEnabledDisabled();

        // this._frame.open();

        super.initialise();
    }

    protected override finalise() {
        this._propertiesComponent.setLockOpenNotificationChannel(undefined, true);

        this._refreshListUiAction.finalise();
        this._deleteSelectedUiAction.finalise();
        this._selectAllUiAction.finalise();
        this._addUiAction.finalise();
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

    private handleAutoSizeColumnWidthsUiActionSignalEvent(_signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        const widenOnly = ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Shift);
        this._frame.autoSizeAllColumnWidths(widenOnly);
    }

    private handleColumnsUiActionSignalEvent() {
        const allowedSourcedFieldsColumnLayoutDefinition = this._frame.createAllowedSourcedFieldsColumnLayoutDefinition();

        const closePromise = NameableColumnLayoutEditorDialogNgComponent.open(
            this._dialogContainer,
            this._opener,
            Strings[StringId.Scans_ColumnsDialogCaption],
            allowedSourcedFieldsColumnLayoutDefinition,
        );

        closePromise.then(
            (layoutOrReferenceDefinition) => {
                if (layoutOrReferenceDefinition !== undefined) {
                    const openPromise = this._frame.tryOpenColumnLayoutOrReferenceDefinition(layoutOrReferenceDefinition);
                    openPromise.then(
                        (openResult) => {
                            if (openResult.isErr()) {
                                const error = ColumnLayoutOrReference.formatError(openResult.error);
                                this._toastNgService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.NotificationChannels]} ${Strings[StringId.ColumnLayout]}: ${error}`);
                            }
                        },
                        (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'LIILENDHCSEOP56668'); }
                    );
                }
                this.closeDialog();
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'SDNCHCUASE44534'); }
        );

        this.dialogActive = true;
        this.markForCheck();
    }

    private createRefreshListUiAction(): ButtonUiAction {
        const commandName = InternalCommand.Id.NotificationChannels_RefreshAll;
        const displayId = StringId.NotificationChannels_RefreshAllCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.NotificationChannels_RefreshAllDescription]);
        action.pushUnselected();
        action.signalEvent = () => {
            this._frame.refreshList();
        };
        return action;
    }

    private createAddUiAction() {
        const action = new IntegerListSelectItemUiAction(false);
        action.pushCaption(Strings[StringId.NotificationChannels_AddCaption]);
        action.pushPlaceholder(Strings[StringId.NotificationChannels_AddCaption]);
        action.pushTitle(Strings[StringId.NotificationChannels_AddDescription]);
        this.pushAddElements();
        action.commitEvent = () => {
            const methodId = this._addUiAction.definedValue;
            this._frame.add(methodId);
            delay1Tick(() => this._addUiAction.pushValue(undefined));
        };
        return action;
    }

    private pushAddElements() {
        const getPromise = this._frame.getSupportedDistributionMethodIds();
        getPromise.then(
            (ids) => {
                if (ids !== undefined) { // ignore if undefined as error or closing down
                    const list = ids.map<IntegerListSelectItemUiAction.ItemProperties>(
                        (id) => (
                            {
                                item: id,
                                caption: NotificationDistributionMethod.idToDisplay(id),
                                title: '',
                            }
                        )
                    );
                    this._addUiAction.pushList(list, undefined);
                }
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'NCDNCPAE55667'); }
        )
    }

    private createDeleteSelectedUiAction() {
        const commandName = InternalCommand.Id.Grid_RemoveSelected;
        const displayId = StringId.NotificationChannels_RemoveSelectedCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.NotificationChannels_RemoveSelectedDescription]);
        action.pushIcon(IconButtonUiAction.IconId.Delete);
        action.signalEvent = () => {
            this._frame.deleteGridSelected();
        }
        return action;
    }

    private createSelectAllUiAction() {
        const commandName = InternalCommand.Id.Grid_SelectAll;
        const displayId = StringId.NotificationChannels_SelectAllCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.NotificationChannels_SelectAllDescription]);
        action.pushIcon(IconButtonUiAction.IconId.MarkAll);
        action.signalEvent = () => {
            this._frame.selectAllInGrid();
        }
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
        action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }

    private initialiseChildComponents() {
        this._refreshListControlComponent.initialise(this._refreshListUiAction);
        this._deleteSelectedControlComponent.initialise(this._deleteSelectedUiAction);
        this._selectAllControlComponent.initialise(this._selectAllUiAction);
        this._addControlComponent.initialise(this._addUiAction);
        this._autoSizeColumnWidthsButtonComponent.initialise(this._autoSizeColumnWidthsUiAction);
        this._columnsButtonComponent.initialise(this._columnsUiAction);

        this._gridComponent.initialise();

        this._propertiesComponent.editGridColumnsEventer = (
            caption,
            allowedFieldsAndLayoutDefinition
        ) => this.openGridColumnsEditorDialog(caption, allowedFieldsAndLayoutDefinition);
    }

    private pushDeleteSelectedEnabledDisabled() {
        if (this._frame.gridSelectedCount > 0) {
            this._deleteSelectedUiAction.pushValidOrMissing();
        } else {
            this._deleteSelectedUiAction.pushDisabled();
    }
    }

    private openGridColumnsEditorDialog(caption: string, allowedFieldsAndLayoutDefinition: AllowedSourcedFieldsColumnLayoutDefinition) {
        this.dialogActive = true;

        // We cannot just return the promise from the dialog as we need to close the dialog as well.
        // So return a separate promise which is resolved when dialog is closed.
        let definitonResolveFtn: (this: void, definition: RevColumnLayoutOrReferenceDefinition | undefined) => void;

        const definitionPromise = new Promise<RevColumnLayoutOrReferenceDefinition | undefined>(
            (resolve) => {
                definitonResolveFtn = resolve;
            }
        )

        const closePromise = NameableColumnLayoutEditorDialogNgComponent.open(
            this._dialogContainer,
            this._frame.opener,
            caption,
            allowedFieldsAndLayoutDefinition,
        );
        closePromise.then(
            (definition) => {
                definitonResolveFtn(definition);
                this.closeDialog();
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'ODNCSLEDCPTR20987'); }
        );

        this.markForCheck();

        return definitionPromise;
    }

    private closeDialog() {
        this._dialogContainer.clear();
        this.dialogActive = false;
        this.markForCheck();
    }
}

export namespace NotificationChannelsDitemNgComponent {
    export const stateSchemaVersion = '2';
}
