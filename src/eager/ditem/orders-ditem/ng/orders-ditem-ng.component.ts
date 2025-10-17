import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, ViewContainerRef, inject, viewChild } from '@angular/core';
import { AssertInternalError, Integer, JsonElement, ModifierKey, ModifierKeyId, delay1Tick } from '@pbkware/js-utils';
import { UiAction } from '@pbkware/ui-action';
import {
    BrokerageAccountGroup,
    BrokerageAccountGroupUiAction,
    ColumnLayoutOrReference,
    IconButtonUiAction,
    InternalCommand,
    StringId,
    Strings
} from '@plxtra/motif-core';
import {
    AdiNgService,
    DecimalFactoryNgService,
    MarketsNgService,
    SymbolDetailCacheNgService,
    SymbolsNgService,
    ToastNgService
} from 'component-services-ng-api';
import { NameableColumnLayoutEditorDialogNgComponent, OrdersNgComponent } from 'content-ng-api';
import { BrokerageAccountGroupInputNgComponent, SvgButtonNgComponent } from 'controls-ng-api';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { OrdersDitemFrame } from '../orders-ditem-frame';

@Component({
    selector: 'app-orders-ditem',
    templateUrl: './orders-ditem-ng.component.html',
    styleUrls: ['./orders-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BrokerageAccountGroupInputNgComponent, SvgButtonNgComponent, OrdersNgComponent]
})
export class OrdersDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    private readonly _toastNgService = inject(ToastNgService);

    private readonly _ordersComponentSignal = viewChild.required<OrdersNgComponent>('orders');
    private readonly _accountGroupInputComponentSignal = viewChild.required<BrokerageAccountGroupInputNgComponent>('accountGroupInput');
    private readonly _buyButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('buyButton');
    private readonly _sellButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('sellButton');
    private readonly _amendButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('amendButton');
    private readonly _cancelButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('cancelButton');
    private readonly _moveButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('moveButton');
    private readonly _columnsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('columnsButton');
    private readonly _autoSizeColumnWidthsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('autoSizeColumnWidthsButton');
    private readonly _symbolLinkButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('symbolLinkButton');
    private readonly _accountLinkButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('accountLinkButton');
    private readonly _dialogContainerSignal = viewChild.required('dialogContainer', { read: ViewContainerRef });

    private readonly _frame: OrdersDitemFrame;

    private readonly _accountGroupUiAction: BrokerageAccountGroupUiAction;
    private readonly _buyUiAction: IconButtonUiAction;
    private readonly _sellUiAction: IconButtonUiAction;
    private readonly _amendUiAction: IconButtonUiAction;
    private readonly _cancelUiAction: IconButtonUiAction;
    private readonly _moveUiAction: IconButtonUiAction;
    private readonly _columnsUiAction: IconButtonUiAction;
    private readonly _autoSizeColumnWidthsUiAction: IconButtonUiAction;
    private readonly _toggleSymbolLinkingUiAction: IconButtonUiAction;
    private readonly _toggleAccountGroupLinkingUiAction: IconButtonUiAction;

    private _ordersComponent: OrdersNgComponent;
    private _accountGroupInputComponent: BrokerageAccountGroupInputNgComponent;
    private _buyButtonComponent: SvgButtonNgComponent;
    private _sellButtonComponent: SvgButtonNgComponent;
    private _amendButtonComponent: SvgButtonNgComponent;
    private _cancelButtonComponent: SvgButtonNgComponent;
    private _moveButtonComponent: SvgButtonNgComponent;
    private _columnsButtonComponent: SvgButtonNgComponent;
    private _autoSizeColumnWidthsButtonComponent: SvgButtonNgComponent;
    private _symbolLinkButtonComponent: SvgButtonNgComponent;
    private _accountLinkButtonComponent: SvgButtonNgComponent;
    private _dialogContainer: ViewContainerRef;

    private _activeDialogTypeId = OrdersDitemNgComponent.ActiveDialogTypeId.None;

    constructor() {
        super(++OrdersDitemNgComponent.typeInstanceCreateCount);

        const decimalFactoryNgService = inject(DecimalFactoryNgService);
        const marketsNgService = inject(MarketsNgService);
        const desktopAccessNgService = inject(DesktopAccessNgService);
        const adiNgService = inject(AdiNgService);
        const symbolsNgService = inject(SymbolsNgService);
        const symbolDetailCacheNgService = inject(SymbolDetailCacheNgService);

        this._frame = new OrdersDitemFrame(
            this,
            decimalFactoryNgService.service,
            this.settingsService,
            marketsNgService.service,
            this.commandRegisterService,
            desktopAccessNgService.service,
            symbolsNgService.service,
            adiNgService.service,
            symbolDetailCacheNgService.service,
            this._toastNgService.service,
            (group) => this.handleGridSourceOpenedEvent(group),
            (recordIndex) => this.handleRecordFocusedEvent(recordIndex),
        );

        this._accountGroupUiAction = this.createAccountIdUiAction();
        this._buyUiAction = this.createBuyUiAction();
        this._sellUiAction = this.createSellUiAction();
        this._amendUiAction = this.createAmendUiAction();
        this._cancelUiAction = this.createCancelUiAction();
        this._moveUiAction = this.createMoveUiAction();

        this._columnsUiAction = this.createColumnsUiAction();
        this._autoSizeColumnWidthsUiAction = this.createAutoSizeColumnWidthsUiAction();

        this._toggleSymbolLinkingUiAction = this.createToggleSymbolLinkingUiAction();
        this._toggleAccountGroupLinkingUiAction = this.createToggleAccountGroupLinkingUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());

        this.pushAccountLinkButtonState();
        this.pushSymbolLinkButtonState();
        this._accountGroupUiAction.pushValue(BrokerageAccountGroup.createAll());
    }

    get ditemFrame() { return this._frame; }

    protected get stateSchemaVersion() { return OrdersDitemNgComponent.stateSchemaVersion; }

    public ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._ordersComponent = this._ordersComponentSignal();
        this._accountGroupInputComponent = this._accountGroupInputComponentSignal();
        this._buyButtonComponent = this._buyButtonComponentSignal();
        this._sellButtonComponent = this._sellButtonComponentSignal();
        this._amendButtonComponent = this._amendButtonComponentSignal();
        this._cancelButtonComponent = this._cancelButtonComponentSignal();
        this._moveButtonComponent = this._moveButtonComponentSignal();
        this._columnsButtonComponent = this._columnsButtonComponentSignal();
        this._autoSizeColumnWidthsButtonComponent = this._autoSizeColumnWidthsButtonComponentSignal();
        this._symbolLinkButtonComponent = this._symbolLinkButtonComponentSignal();
        this._accountLinkButtonComponent = this._accountLinkButtonComponentSignal();
        this._dialogContainer = this._dialogContainerSignal();

        delay1Tick(() => this.initialise());
    }

    public isDialogActive() {
        return this._activeDialogTypeId !== OrdersDitemNgComponent.ActiveDialogTypeId.None;
    }

    public override processSymbolLinkedChanged() {
        this.pushSymbolLinkButtonState();
    }

    public override processBrokerageAccountGroupLinkedChanged() {
        this.pushAccountLinkButtonState();
    }

    protected override initialise() {
        this._accountGroupInputComponent.initialise(this._accountGroupUiAction);
        this._buyButtonComponent.initialise(this._buyUiAction);
        this._sellButtonComponent.initialise(this._sellUiAction);
        this._amendButtonComponent.initialise(this._amendUiAction);
        this._cancelButtonComponent.initialise(this._cancelUiAction);
        this._moveButtonComponent.initialise(this._moveUiAction);
        this._columnsButtonComponent.initialise(this._columnsUiAction);
        this._autoSizeColumnWidthsButtonComponent.initialise(this._autoSizeColumnWidthsUiAction);
        this._symbolLinkButtonComponent.initialise(this._toggleSymbolLinkingUiAction);
        this._accountLinkButtonComponent.initialise(this._toggleAccountGroupLinkingUiAction);

        const componentStateElement = this.getInitialComponentStateJsonElement();
        const frameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        this._frame.initialise(frameElement, this._ordersComponent.frame);

        this.pushAmendCancelButtonState(this._frame.focusedRecordIndex);

        super.initialise();
    }

    protected override finalise() {
        this._accountGroupUiAction.finalise();
        this._buyUiAction.finalise();
        this._sellUiAction.finalise();
        this._amendUiAction.finalise();
        this._cancelUiAction.finalise();
        this._moveUiAction.finalise();
        this._columnsUiAction.finalise();
        this._autoSizeColumnWidthsUiAction.finalise();
        this._toggleSymbolLinkingUiAction.finalise();
        this._toggleAccountGroupLinkingUiAction.finalise();

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

    private handleAccountGroupCommitEvent(typeId: UiAction.CommitTypeId) {
        const group = this._accountGroupUiAction.definedValue;
        this._frame.setBrokerageAccountGroupFromDitem(group);
    }

    private handleBuySignalEvent() {
        this._frame.buyFocused();
    }

    private handleSellSignalEvent() {
        this._frame.sellFocused();
    }

    private handleAmendSignalEvent() {
        this._frame.amendFocused();
    }

    private handleCancelSignalEvent() {
        this._frame.cancelFocused();
    }

    private handleMoveSignalEvent() {
        this._frame.moveFocused();
    }

    private handleRecordFocusedEvent(recordIndex: Integer | undefined) {
        this.pushAmendCancelButtonState(recordIndex);
    }

    private handleGridSourceOpenedEvent(group: BrokerageAccountGroup) {
        this._accountGroupUiAction.pushValue(group);
        const contentName = group.isAll() ? undefined : group.display;
        this.setTitle(this._frame.baseTabDisplay, contentName);
    }

    private handleColumnsUiActionSignalEvent() {
        this.showLayoutEditorDialog();
    }

    private handleAutoSizeColumnWidthsUiActionSignalEvent(_signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        const widenOnly = ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Shift);
        this._frame.autoSizeAllColumnWidths(widenOnly);
    }

    private handleAccountLinkSignalEvent() {
        this._frame.brokerageAccountGroupLinked = !this._frame.brokerageAccountGroupLinked;
    }

    private handleSymbolLinkSignalEvent() {
        this._frame.dataIvemIdLinked = !this._frame.dataIvemIdLinked;
    }

    private showLayoutEditorDialog() {
        this._activeDialogTypeId = OrdersDitemNgComponent.ActiveDialogTypeId.Layout;

        const allowedFieldsAndLayoutDefinition = this._frame.createAllowedFieldsAndLayoutDefinition();

        const closePromise = NameableColumnLayoutEditorDialogNgComponent.open(
            this._dialogContainer,
            this._frame.opener,
            Strings[StringId.Orders_ColumnsDialogCaption],
            allowedFieldsAndLayoutDefinition
        );
        closePromise.then(
            (layoutOrReferenceDefinition) => {
                if (layoutOrReferenceDefinition !== undefined) {
                    const openPromise = this._frame.tryOpenColumnLayoutOrReferenceDefinition(layoutOrReferenceDefinition);
                    openPromise.then(
                        (openResult) => {
                            if (openResult.isErr()) {
                                const error = ColumnLayoutOrReference.formatError(openResult.error);
                                this._toastNgService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.Orders]} ${Strings[StringId.ColumnLayout]}: ${error}`);
                            }
                        },
                        (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'OADNCSLECPOP68823'); }
                    );
                }
                this.closeDialog();
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'ODNCSLEDCPTR20987'); }
        );

        this.markForCheck();
    }

    private closeDialog() {
        this._dialogContainer.clear();
        this._activeDialogTypeId = OrdersDitemNgComponent.ActiveDialogTypeId.None;
        this.markForCheck();
    }

    private createAccountIdUiAction() {
        const action = new BrokerageAccountGroupUiAction();
        action.pushOptions({ allAllowed: true });
        action.pushTitle(Strings[StringId.SelectAccountTitle]);
        action.pushPlaceholder(Strings[StringId.BrokerageAccountIdInputPlaceholderText]);
        action.commitEvent = (typeId) => this.handleAccountGroupCommitEvent(typeId);
        return action;
    }

    private createBuyUiAction() {
        const commandName = InternalCommand.Id.BuyOrderPad;
        const displayId = StringId.BuyOrderPadCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.BuyOrderPadTitle]);
        action.pushIcon(IconButtonUiAction.IconId.BuyOrderPad);
        action.pushUnselected();
        action.signalEvent = () => this.handleBuySignalEvent();
        return action;
    }

    private createSellUiAction() {
        const commandName = InternalCommand.Id.SellOrderPad;
        const displayId = StringId.SellOrderPadCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.SellOrderPadTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SellOrderPad);
        action.pushUnselected();
        action.signalEvent = () => this.handleSellSignalEvent();
        return action;
    }

    private createAmendUiAction() {
        const commandName = InternalCommand.Id.AmendOrderPad;
        const displayId = StringId.AmendOrderPadCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.AmendOrderPadTitle]);
        action.pushIcon(IconButtonUiAction.IconId.AmendOrderPad);
        action.pushUnselected();
        action.signalEvent = () => this.handleAmendSignalEvent();
        return action;
    }

    private createCancelUiAction() {
        const commandName = InternalCommand.Id.CancelOrderPad;
        const displayId = StringId.CancelOrderPadCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.CancelOrderPadTitle]);
        action.pushIcon(IconButtonUiAction.IconId.CancelOrderPad);
        action.pushUnselected();
        action.signalEvent = () => this.handleCancelSignalEvent();
        return action;
    }

    private createMoveUiAction() {
        const commandName = InternalCommand.Id.MoveOrderPad;
        const displayId = StringId.MoveOrderPadCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.MoveOrderPadTitle]);
        action.pushIcon(IconButtonUiAction.IconId.MoveOrderPad);
        action.pushUnselected();
        action.signalEvent = () => this.handleMoveSignalEvent();
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

    private createToggleSymbolLinkingUiAction() {
        const commandName = InternalCommand.Id.ToggleSymbolLinking;
        const displayId = StringId.ToggleSymbolLinkingCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ToggleSymbolLinkingTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SymbolLink);
        action.signalEvent = () => this.handleSymbolLinkSignalEvent();
        return action;
    }

    private createToggleAccountGroupLinkingUiAction() {
        const commandName = InternalCommand.Id.ToggleAccountLinking;
        const displayId = StringId.ToggleAccountLinkingCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ToggleAccountLinkingTitle]);
        action.pushIcon(IconButtonUiAction.IconId.AccountGroupLink);
        action.signalEvent = () => this.handleAccountLinkSignalEvent();
        return action;
    }

    private pushAmendCancelButtonState(newRecordIndex: Integer | undefined) {
        if (newRecordIndex === undefined) {
            this._amendUiAction.pushDisabled();
            this._cancelUiAction.pushDisabled();
            this._moveUiAction.pushDisabled();
        } else {
            // TODO should also subscribe to order in case amend or cancel become possible/impossible
            if (this._frame.canAmendFocusedOrder()) {
                this._amendUiAction.pushValidOrMissing();
            } else {
                this._amendUiAction.pushDisabled();
            }

            if (this._frame.canCancelFocusedOrder()) {
                this._cancelUiAction.pushValidOrMissing();
            } else {
                this._cancelUiAction.pushDisabled();
            }

            if (this._frame.canMoveFocusedOrder()) {
                this._moveUiAction.pushValidOrMissing();
            } else {
                this._moveUiAction.pushDisabled();
            }
        }
    }

    private pushAccountLinkButtonState() {
        if (this._frame.brokerageAccountGroupLinked) {
            this._toggleAccountGroupLinkingUiAction.pushSelected();
        } else {
            this._toggleAccountGroupLinkingUiAction.pushUnselected();
        }
    }

    private pushSymbolLinkButtonState() {
        if (this._frame.dataIvemIdLinked) {
            this._toggleSymbolLinkingUiAction.pushSelected();
        } else {
            this._toggleSymbolLinkingUiAction.pushUnselected();
        }
    }
}

export namespace OrdersDitemNgComponent {
    export const stateSchemaVersion = '2';

    export const enum ActiveDialogTypeId {
        None,
        Layout,
    }
}
