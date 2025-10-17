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
    MarketsNgService,
    SymbolsNgService,
    ToastNgService
} from 'component-services-ng-api';
import { BalancesNgComponent, NameableColumnLayoutEditorDialogNgComponent } from 'content-ng-api';
import { BrokerageAccountGroupInputNgComponent, SvgButtonNgComponent } from 'controls-ng-api';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { BalancesDitemFrame } from '../balances-ditem-frame';

@Component({
    selector: 'app-balances-ditem',
    templateUrl: './balances-ditem-ng.component.html',
    styleUrls: ['./balances-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BrokerageAccountGroupInputNgComponent, SvgButtonNgComponent, BalancesNgComponent]
})
export class BalancesDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    private readonly _toastNgService = inject(ToastNgService);

    private readonly _balancesComponentSignal = viewChild.required<BalancesNgComponent>('balances');
    private readonly _accountGroupInputComponentSignal = viewChild.required<BrokerageAccountGroupInputNgComponent>('accountGroupInput');
    private readonly _accountLinkButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('accountLinkButton');
    private readonly _columnsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('columnsButton');
    private readonly _autoSizeColumnWidthsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('autoSizeColumnWidthsButton');
    private readonly _dialogContainerSignal = viewChild.required('dialogContainer', { read: ViewContainerRef });

    private readonly _frame: BalancesDitemFrame;

    private readonly _accountGroupUiAction: BrokerageAccountGroupUiAction;
    private readonly _toggleAccountGroupLinkingUiAction: IconButtonUiAction;
    private readonly _columnsUiAction: IconButtonUiAction;
    private readonly _autoSizeColumnWidthsUiAction: IconButtonUiAction;

    private _balancesComponent: BalancesNgComponent;
    private _accountGroupInputComponent: BrokerageAccountGroupInputNgComponent;
    private _accountLinkButtonComponent: SvgButtonNgComponent;
    private _columnsButtonComponent: SvgButtonNgComponent;
    private _autoSizeColumnWidthsButtonComponent: SvgButtonNgComponent;
    private _dialogContainer: ViewContainerRef;

    private _activeDialogTypeId = BalancesDitemNgComponent.ActiveDialogTypeId.None;

    constructor() {
        super(
            ++BalancesDitemNgComponent.typeInstanceCreateCount,
        );

        const marketsNgService = inject(MarketsNgService);
        const desktopAccessNgService = inject(DesktopAccessNgService);
        const symbolsNgService = inject(SymbolsNgService);
        const adiNgService = inject(AdiNgService);

        this._frame = new BalancesDitemFrame(
            this,
            this.settingsService,
            marketsNgService.service,
            this.commandRegisterService,
            desktopAccessNgService.service,
            symbolsNgService.service,
            adiNgService.service,
            this._toastNgService.service,
            (group) => this.handleGridSourceOpenedEvent(group),
            (recordIndex) => this.handleRecordFocusedEvent(recordIndex),
        );

        this._accountGroupUiAction = this.createAccountIdUiAction();
        this._toggleAccountGroupLinkingUiAction = this.createToggleAccountGroupLinkingUiAction();
        this._columnsUiAction = this.createColumnsUiAction();
        this._autoSizeColumnWidthsUiAction = this.createAutoSizeColumnWidthsUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());

        this.pushAccountLinkButtonState();
        this._accountGroupUiAction.pushValue(BrokerageAccountGroup.createAll());
    }

    get ditemFrame() { return this._frame; }

    protected get stateSchemaVersion() { return BalancesDitemNgComponent.stateSchemaVersion; }

    public ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._balancesComponent = this._balancesComponentSignal();
        this._accountGroupInputComponent = this._accountGroupInputComponentSignal();
        this._accountLinkButtonComponent = this._accountLinkButtonComponentSignal();
        this._columnsButtonComponent = this._columnsButtonComponentSignal();
        this._autoSizeColumnWidthsButtonComponent = this._autoSizeColumnWidthsButtonComponentSignal();
        this._dialogContainer = this._dialogContainerSignal();

        delay1Tick(() => this.initialise());
    }

    public isDialogActive() {
        return this._activeDialogTypeId !== BalancesDitemNgComponent.ActiveDialogTypeId.None;
    }

    public override processBrokerageAccountGroupLinkedChanged() {
        this.pushAccountLinkButtonState();
    }

    protected override initialise() {
        this._accountGroupInputComponent.initialise(this._accountGroupUiAction);
        this._accountLinkButtonComponent.initialise(this._toggleAccountGroupLinkingUiAction);
        this._columnsButtonComponent.initialise(this._columnsUiAction);
        this._autoSizeColumnWidthsButtonComponent.initialise(this._autoSizeColumnWidthsUiAction);

        const componentStateElement = this.getInitialComponentStateJsonElement();
        const ditemFrameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        this._frame.initialise(ditemFrameElement, this._balancesComponent.frame);

        super.initialise();
    }

    protected override finalise() {
        this._accountGroupUiAction.finalise();
        this._toggleAccountGroupLinkingUiAction.finalise();
        this._columnsUiAction.finalise();
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

    private handleAccountGroupCommitEvent(typeId: UiAction.CommitTypeId) {
        const accountId = this._accountGroupUiAction.definedValue;
        this._frame.setBrokerageAccountGroupFromDitem(accountId);
    }

    private handleAccountLinkSignalEvent() {
        this._frame.brokerageAccountGroupLinked = !this._frame.brokerageAccountGroupLinked;
    }

    private handleColumnsUiActionSignalEvent() {
        this.showLayoutEditorDialog();
    }

    private handleAutoSizeColumnWidthsUiActionSignalEvent(_signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        const widenOnly = ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Shift);
        this._frame.autoSizeAllColumnWidths(widenOnly);
    }

    private handleRecordFocusedEvent(_recordIndex: Integer | undefined) {
        //
    }

    private handleGridSourceOpenedEvent(group: BrokerageAccountGroup) {
        this._accountGroupUiAction.pushValue(group);
        const contentName = group.isAll() ? undefined : group.display;
        this.setTitle(this._frame.baseTabDisplay, contentName);
    }

    private createAccountIdUiAction() {
        const action = new BrokerageAccountGroupUiAction();
        action.pushOptions({ allAllowed: true });
        action.pushTitle(Strings[StringId.SelectAccountTitle]);
        action.pushPlaceholder(Strings[StringId.BrokerageAccountIdInputPlaceholderText]);
        action.commitEvent = (typeId) => this.handleAccountGroupCommitEvent(typeId);
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

    private pushAccountLinkButtonState() {
        if (this._frame.brokerageAccountGroupLinked) {
            this._toggleAccountGroupLinkingUiAction.pushSelected();
        } else {
            this._toggleAccountGroupLinkingUiAction.pushUnselected();
        }
    }

    private showLayoutEditorDialog() {
        this._activeDialogTypeId = BalancesDitemNgComponent.ActiveDialogTypeId.Layout;

        const allowedFieldsAndLayoutDefinition = this._frame.createAllowedSourcedFieldsColumnLayoutDefinition();

        const closePromise = NameableColumnLayoutEditorDialogNgComponent.open(
            this._dialogContainer,
            this._frame.opener,
            Strings[StringId.Balances_ColumnsDialogCaption],
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
                                this._toastNgService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.Balances]} ${Strings[StringId.ColumnLayout]}: ${error}`);
                            }
                        },
                        (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'LIILENDHCSEOP56668'); }
                    );
                }
                this.closeDialog();
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'BDNCSLEDCPTR20987'); }
        );

        this.markForCheck();
    }

    private closeDialog() {
        this._dialogContainer.clear();
        this._activeDialogTypeId = BalancesDitemNgComponent.ActiveDialogTypeId.None;
        this.markForCheck();
    }
}

export namespace BalancesDitemNgComponent {
    export const stateSchemaVersion = '2';

    export const enum ActiveDialogTypeId {
        None,
        Layout,
    }
}
