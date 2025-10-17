import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy, viewChild, ViewContainerRef } from '@angular/core';
import {
    AssertInternalError,
    delay1Tick,
    getErrorMessage,
    Integer,
    JsonElement,
    UnreachableCaseError
} from '@pbkware/js-utils';
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
import { NameableColumnLayoutEditorDialogNgComponent, OrderAuthoriseNgComponent } from 'content-ng-api';
import { BrokerageAccountGroupInputNgComponent, SvgButtonNgComponent } from 'controls-ng-api';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { OrderAuthoriseDitemFrame } from '../order-authorise-ditem-frame';

@Component({
    selector: 'app-order-authorise-ditem',
    templateUrl: './order-authorise-ditem-ng.component.html',
    styleUrls: ['./order-authorise-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BrokerageAccountGroupInputNgComponent, SvgButtonNgComponent, OrderAuthoriseNgComponent]
})
export class OrderAuthoriseDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    private readonly _toastNgService = inject(ToastNgService);

    private readonly _orderAuthoriseComponentSignal = viewChild.required<OrderAuthoriseNgComponent>('orderAuthorise');
    private readonly _accountGroupInputComponentSignal = viewChild.required<BrokerageAccountGroupInputNgComponent>('accountGroupInput');
    // @viewChild.required('buyButton', { static: true }) private _buyButtonComponentSignal: SvgButtonNgComponent;
    // @viewChild.required('sellButton', { static: true }) private _sellButtonComponentSignal: SvgButtonNgComponent;
    // @viewChild.required('amendButton', { static: true }) private _amendButtonComponentSignal: SvgButtonNgComponent;
    // @viewChild.required('cancelButton', { static: true }) private _cancelButtonComponentSignal: SvgButtonNgComponent;
    // @viewChild.required('moveButton', { static: true }) private _moveButtonComponentSignal: SvgButtonNgComponent;
    private readonly _columnsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('columnsButton');
    private readonly _autoSizeColumnWidthsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('autoSizeColumnWidthsButton');
    private readonly _symbolLinkButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('symbolLinkButton');
    private readonly _accountLinkButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('accountLinkButton');
    private readonly _dialogContainerSignal = viewChild.required('dialogContainer', { read: ViewContainerRef });

    private readonly _accountGroupUiAction: BrokerageAccountGroupUiAction;
    // private readonly _buyUiAction: IconButtonUiAction;
    // private readonly _sellUiAction: IconButtonUiAction;
    // private readonly _amendUiAction: IconButtonUiAction;
    // private readonly _cancelUiAction: IconButtonUiAction;
    // private readonly _moveUiAction: IconButtonUiAction;
    private readonly _columnsUiAction: IconButtonUiAction;
    private readonly _autoSizeColumnWidthsUiAction: IconButtonUiAction;
    private readonly _toggleSymbolLinkingUiAction: IconButtonUiAction;
    private readonly _toggleAccountGroupLinkingUiAction: IconButtonUiAction;

    private readonly _frame: OrderAuthoriseDitemFrame;

    private _orderAuthoriseComponent: OrderAuthoriseNgComponent;
    private _accountGroupInputComponent: BrokerageAccountGroupInputNgComponent;
    private _columnsButtonComponent: SvgButtonNgComponent;
    private _autoSizeColumnWidthsButtonComponent: SvgButtonNgComponent;
    private _symbolLinkButtonComponent: SvgButtonNgComponent;
    private _accountLinkButtonComponent: SvgButtonNgComponent;
    private _dialogContainer: ViewContainerRef;

    private _modeId = OrderAuthoriseDitemNgComponent.ModeId.Main;

    constructor() {
        super(++OrderAuthoriseDitemNgComponent.typeInstanceCreateCount);

        const decimalFactoryNgService = inject(DecimalFactoryNgService);
        const marketsNgService = inject(MarketsNgService);
        const desktopAccessNgService = inject(DesktopAccessNgService);
        const adiNgService = inject(AdiNgService);
        const symbolsNgService = inject(SymbolsNgService);
        const symbolDetailCacheNgService = inject(SymbolDetailCacheNgService);

        this._frame = new OrderAuthoriseDitemFrame(
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
        // this._buyUiAction = this.createBuyUiAction();
        // this._sellUiAction = this.createSellUiAction();
        // this._amendUiAction = this.createAmendUiAction();
        // this._cancelUiAction = this.createCancelUiAction();
        // this._moveUiAction = this.createMoveUiAction();

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

    protected get stateSchemaVersion() { return OrderAuthoriseDitemNgComponent.stateSchemaVersion; }

    public ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._orderAuthoriseComponent = this._orderAuthoriseComponentSignal();
        this._accountGroupInputComponent = this._accountGroupInputComponentSignal();
        this._columnsButtonComponent = this._columnsButtonComponentSignal();
        this._autoSizeColumnWidthsButtonComponent = this._autoSizeColumnWidthsButtonComponentSignal();
        this._symbolLinkButtonComponent = this._symbolLinkButtonComponentSignal();
        this._accountLinkButtonComponent = this._accountLinkButtonComponentSignal();
        this._dialogContainer = this._dialogContainerSignal();

        delay1Tick(() => this.initialise());
    }

    public isMainMode() {
        return this._modeId === OrderAuthoriseDitemNgComponent.ModeId.Main;
    }

    public isDialogMode() {
        switch (this._modeId) {
            case OrderAuthoriseDitemNgComponent.ModeId.LayoutDialog:
                return true;
            case OrderAuthoriseDitemNgComponent.ModeId.Main:
                return false;
            default:
                throw new UnreachableCaseError('OADNCIDM65312', this._modeId);
        }
    }

    public override processSymbolLinkedChanged() {
        this.pushSymbolLinkButtonState();
    }

    public override processBrokerageAccountGroupLinkedChanged() {
        this.pushAccountLinkButtonState();
    }

    protected override initialise() {
        this._accountGroupInputComponent.initialise(this._accountGroupUiAction);
        // this._buyButtonComponent.initialise(this._buyUiAction);
        // this._sellButtonComponent.initialise(this._sellUiAction);
        // this._amendButtonComponent.initialise(this._amendUiAction);
        // this._cancelButtonComponent.initialise(this._cancelUiAction);
        // this._moveButtonComponent.initialise(this._moveUiAction);
        this._columnsButtonComponent.initialise(this._columnsUiAction);
        this._autoSizeColumnWidthsButtonComponent.initialise(this._autoSizeColumnWidthsUiAction);
        this._symbolLinkButtonComponent.initialise(this._toggleSymbolLinkingUiAction);
        this._accountLinkButtonComponent.initialise(this._toggleAccountGroupLinkingUiAction);

        const componentStateElement = this.getInitialComponentStateJsonElement();
        const frameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        this._frame.initialise(frameElement, this._orderAuthoriseComponent.frame);

        // this.pushAmendCancelButtonState(this._frame.focusedRecordIndex);

        super.initialise();
    }

    protected override finalise() {
        this._accountGroupUiAction.finalise();
        // this._buyUiAction.finalise();
        // this._sellUiAction.finalise();
        // this._amendUiAction.finalise();
        // this._cancelUiAction.finalise();
        // this._moveUiAction.finalise();
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
        // this.pushAmendCancelButtonState(recordIndex);
    }

    private handleGridSourceOpenedEvent(group: BrokerageAccountGroup) {
        this._accountGroupUiAction.pushValue(group);
    }

    private handleColumnsUiActionSignalEvent() {
        this.showLayoutEditor();
    }

    private handleAutoSizeColumnWidthsUiActionSignalEvent() {
        // this._frame.autoSizeAllColumnWidths();
    }

    private handleAccountLinkSignalEvent() {
        this._frame.brokerageAccountGroupLinked = !this._frame.brokerageAccountGroupLinked;
    }

    private handleSymbolLinkSignalEvent() {
        this._frame.dataIvemIdLinked = !this._frame.dataIvemIdLinked;
    }

    private showLayoutEditor() {
        this._modeId = OrderAuthoriseDitemNgComponent.ModeId.LayoutDialog;

        const allowedFieldsAndLayoutDefinition = this._frame.createAllowedFieldsAndLayoutDefinition();

        const closePromise = NameableColumnLayoutEditorDialogNgComponent.open(
            this._dialogContainer,
            this._frame.opener,
            Strings[StringId.OrderAuthorise_ColumnsDialogCaption],
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
                                this._toastNgService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.OrderAuthorise]} ${Strings[StringId.ColumnLayout]}: ${error}`);
                            }
                        },
                        (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'OADNCSLECPOP68823'); }
                    );
                }
                this.closeDialog();
            },
            (reason: unknown) => {
                const errorText = getErrorMessage(reason);
                window.motifLogger.logError(`Orders Authorise Ditem Layout Dialog error: ${errorText}`);
                this.closeDialog();
            }
        );

        this.markForCheck();
    }

    private closeDialog() {
        this._dialogContainer.clear();
        this._modeId = OrderAuthoriseDitemNgComponent.ModeId.Main;
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

    // private createBuyUiAction() {
    //     const commandName = InternalCommand.Id.BuyOrderPad;
    //     const displayId = StringId.BuyOrderPadCaption;
    //     const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
    //     const action = new IconButtonUiAction(command);
    //     action.pushTitle(Strings[StringId.BuyOrderPadTitle]);
    //     action.pushIcon(IconButtonUiAction.IconId.BuyOrderPad);
    //     action.pushUnselected();
    //     action.signalEvent = () => this.handleBuySignalEvent();
    //     return action;
    // }

    // private createSellUiAction() {
    //     const commandName = InternalCommand.Id.SellOrderPad;
    //     const displayId = StringId.SellOrderPadCaption;
    //     const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
    //     const action = new IconButtonUiAction(command);
    //     action.pushTitle(Strings[StringId.SellOrderPadTitle]);
    //     action.pushIcon(IconButtonUiAction.IconId.SellOrderPad);
    //     action.pushUnselected();
    //     action.signalEvent = () => this.handleSellSignalEvent();
    //     return action;
    // }

    // private createAmendUiAction() {
    //     const commandName = InternalCommand.Id.AmendOrderPad;
    //     const displayId = StringId.AmendOrderPadCaption;
    //     const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
    //     const action = new IconButtonUiAction(command);
    //     action.pushTitle(Strings[StringId.AmendOrderPadTitle]);
    //     action.pushIcon(IconButtonUiAction.IconId.AmendOrderPad);
    //     action.pushUnselected();
    //     action.signalEvent = () => this.handleAmendSignalEvent();
    //     return action;
    // }

    // private createCancelUiAction() {
    //     const commandName = InternalCommand.Id.CancelOrderPad;
    //     const displayId = StringId.CancelOrderPadCaption;
    //     const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
    //     const action = new IconButtonUiAction(command);
    //     action.pushTitle(Strings[StringId.CancelOrderPadTitle]);
    //     action.pushIcon(IconButtonUiAction.IconId.CancelOrderPad);
    //     action.pushUnselected();
    //     action.signalEvent = () => this.handleCancelSignalEvent();
    //     return action;
    // }

    // private createMoveUiAction() {
    //     const commandName = InternalCommand.Id.MoveOrderPad;
    //     const displayId = StringId.MoveOrderPadCaption;
    //     const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
    //     const action = new IconButtonUiAction(command);
    //     action.pushTitle(Strings[StringId.MoveOrderPadTitle]);
    //     action.pushIcon(IconButtonUiAction.IconId.MoveOrderPad);
    //     action.pushUnselected();
    //     action.signalEvent = () => this.handleMoveSignalEvent();
    //     return action;
    // }

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
        action.signalEvent = () => this.handleAutoSizeColumnWidthsUiActionSignalEvent();
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

    // private pushAmendCancelButtonState(newRecordIndex: Integer | undefined) {
    //     if (newRecordIndex === undefined) {
    //         this._amendUiAction.pushDisabled();
    //         this._cancelUiAction.pushDisabled();
    //         this._moveUiAction.pushDisabled();
    //     } else {
    //         // TODO should also subscribe to order in case amend or cancel become possible/impossible
    //         if (this._frame.canAmendFocusedOrder()) {
    //             this._amendUiAction.pushValid();
    //         } else {
    //             this._amendUiAction.pushDisabled();
    //         }

    //         if (this._frame.canCancelFocusedOrder()) {
    //             this._cancelUiAction.pushValid();
    //         } else {
    //             this._cancelUiAction.pushDisabled();
    //         }

    //         this._moveUiAction.pushValid();
    //     }
    // }

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

export namespace OrderAuthoriseDitemNgComponent {
    export const stateSchemaVersion = '2';

    export const enum ModeId {
        Main,
        LayoutDialog,
    }
}
