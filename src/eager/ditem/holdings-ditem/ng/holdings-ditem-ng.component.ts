import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, ViewContainerRef, inject, viewChild } from '@angular/core';
import { AssertInternalError, Integer, JsonElement, ModifierKey, ModifierKeyId, delay1Tick } from '@pbkware/js-utils';
import { UiAction } from '@pbkware/ui-action';
import {
    BrokerageAccountGroup,
    BrokerageAccountGroupUiAction,
    IconButtonUiAction,
    InternalCommand,
    OrderPad,
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
import { BalancesNgComponent, HoldingsColumnLayoutsDialogNgComponent, HoldingsNgComponent } from 'content-ng-api';
import { BrokerageAccountGroupInputNgComponent, SvgButtonNgComponent } from 'controls-ng-api';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { HoldingsDitemFrame } from '../holdings-ditem-frame';
import { SplitComponent, SplitAreaComponent } from 'angular-split';

@Component({
    selector: 'app-holdings-ditem',
    templateUrl: './holdings-ditem-ng.component.html',
    styleUrls: ['./holdings-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BrokerageAccountGroupInputNgComponent, SvgButtonNgComponent, SplitComponent, SplitAreaComponent, BalancesNgComponent, HoldingsNgComponent]
})
export class HoldingsDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements OnDestroy, AfterViewInit, HoldingsDitemFrame.ComponentAccess {
    private static typeInstanceCreateCount = 0;

    public splitterGutterSize = 3;
    public balancesVisible = false;
    public balancesHeight = 50;

    private readonly _balancesComponentSignal = viewChild.required<BalancesNgComponent>('balances');
    private readonly _holdingsComponentSignal = viewChild.required<HoldingsNgComponent>('holdings');
    private readonly _accountGroupInputComponentSignal = viewChild.required<BrokerageAccountGroupInputNgComponent>('accountGroupInput');
    private readonly _sellButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('sellButton');
    private readonly _columnsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('columnsButton');
    private readonly _autoSizeColumnWidthsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('autoSizeColumnWidthsButton');
    private readonly _accountLinkButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('accountLinkButton');
    private readonly _symbolLinkButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('symbolLinkButton');
    private readonly _dialogContainerSignal = viewChild.required('dialogContainer', { read: ViewContainerRef });

    private readonly _frame: HoldingsDitemFrame;

    private readonly _accountGroupUiAction: BrokerageAccountGroupUiAction;
    private readonly _sellUiAction: IconButtonUiAction;
    private readonly _columnsUiAction: IconButtonUiAction;
    private readonly _autoSizeColumnWidthsUiAction: IconButtonUiAction;
    private readonly _accountGroupLinkUiAction: IconButtonUiAction;
    private readonly _toggleSymbolLinkingUiAction: IconButtonUiAction;

    private _balancesComponent: BalancesNgComponent;
    private _holdingsComponent: HoldingsNgComponent;
    private _accountGroupInputComponent: BrokerageAccountGroupInputNgComponent;
    private _sellButtonComponent: SvgButtonNgComponent;
    private _columnsButtonComponent: SvgButtonNgComponent;
    private _autoSizeColumnWidthsButtonComponent: SvgButtonNgComponent;
    private _accountLinkButtonComponent: SvgButtonNgComponent;
    private _symbolLinkButtonComponent: SvgButtonNgComponent;
    private _dialogContainer: ViewContainerRef;

    private _activeDialogTypeId = HoldingsDitemNgComponent.ActiveDialogTypeId.None;
    private _explicitBalancesHeight = false;

    constructor() {
        super(++HoldingsDitemNgComponent.typeInstanceCreateCount);

        const decimalFactoryNgService = inject(DecimalFactoryNgService);
        const marketsNgService = inject(MarketsNgService);
        const desktopAccessNgService = inject(DesktopAccessNgService);
        const adiNgService = inject(AdiNgService);
        const symbolsNgService = inject(SymbolsNgService);
        const symbolDetailCacheNgService = inject(SymbolDetailCacheNgService);
        const toastNgService = inject(ToastNgService);

        this._frame = new HoldingsDitemFrame(
            this,
            decimalFactoryNgService.service,
            this.settingsService,
            marketsNgService.service,
            this.commandRegisterService,
            desktopAccessNgService.service,
            symbolsNgService.service,
            adiNgService.service,
            // textFormatterNgService.service,
            symbolDetailCacheNgService.service,
            toastNgService.service,
            (group) => this.handleGridSourceOpenedEvent(group),
            (recordIndex) => this.handleHoldingsRecordFocusEvent(recordIndex),
        );
        this._accountGroupUiAction = this.createAccountIdUiAction();
        this._sellUiAction = this.createSellUiAction();
        this._columnsUiAction = this.createColumnsUiAction();
        this._autoSizeColumnWidthsUiAction = this.createAutoSizeColumnWidthsUiAction();
        this._toggleSymbolLinkingUiAction = this.createToggleSymbolLinkingUiAction();
        this._accountGroupLinkUiAction = this.createToggleAccountGroupLinkingUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());

        this.pushAccountLinkButtonState();
        this.pushSymbolLinkButtonState();
        this._accountGroupUiAction.pushValue(BrokerageAccountGroup.createAll());
    }

    get ditemFrame() { return this._frame; }

    protected get stateSchemaVersion() { return HoldingsDitemNgComponent.stateSchemaVersion; }

    public ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._balancesComponent = this._balancesComponentSignal();
        this._holdingsComponent = this._holdingsComponentSignal();
        this._accountGroupInputComponent = this._accountGroupInputComponentSignal();
        this._sellButtonComponent = this._sellButtonComponentSignal();
        this._columnsButtonComponent = this._columnsButtonComponentSignal();
        this._autoSizeColumnWidthsButtonComponent = this._autoSizeColumnWidthsButtonComponentSignal();
        this._accountLinkButtonComponent = this._accountLinkButtonComponentSignal();
        this._symbolLinkButtonComponent = this._symbolLinkButtonComponentSignal();
        this._dialogContainer = this._dialogContainerSignal();

        delay1Tick(() => this.initialise());
    }

    public isDialogActive() {
        return this._activeDialogTypeId !== HoldingsDitemNgComponent.ActiveDialogTypeId.None;
    }

    public splitDragEnd() {
        this._explicitBalancesHeight = true;
    }

    // component interface methods

    public loadConstructLayoutConfig(config: JsonElement | undefined) {
        if (config === undefined) {
            this._explicitBalancesHeight = false;
        } else {
            const balancesHeightResult = config.tryGetInteger(HoldingsDitemNgComponent.JsonName.balancesHeight);
            if (balancesHeightResult.isErr()) {
                this._explicitBalancesHeight = false;
            } else {
                this.balancesHeight = balancesHeightResult.value;
                this._explicitBalancesHeight = true;
            }
        }
    }

    public setBalancesVisible(value: boolean) {
        if (value !== this.balancesVisible) {
            this.balancesVisible = value;
            this.markForCheck();
        }
    }

    public updateSellFocusedDisabled() {
        const focusedHolding = this._frame.focusedHolding;
        if (focusedHolding === undefined) {
            this._sellUiAction.pushDisabled();
        } else {
            if (OrderPad.canLoadFromHolding(focusedHolding)) {
                this._sellUiAction.pushValidOrMissing();
            } else {
                this._sellUiAction.pushDisabled();
            }
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
        this._sellButtonComponent.initialise(this._sellUiAction);
        this._columnsButtonComponent.initialise(this._columnsUiAction);
        this._autoSizeColumnWidthsButtonComponent.initialise(this._autoSizeColumnWidthsUiAction);
        this._symbolLinkButtonComponent.initialise(this._toggleSymbolLinkingUiAction);
        this._accountLinkButtonComponent.initialise(this._accountGroupLinkUiAction);

        const componentStateElement = this.getInitialComponentStateJsonElement();
        const frameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        const holdingsFrame = this._holdingsComponent.frame;
        const balancesFrame = this._balancesComponent.frame;
        this._frame.initialise(
            frameElement,
            holdingsFrame,
            balancesFrame,
        );

        if (!this._explicitBalancesHeight) {
            const gridRowHeight = this._balancesComponent.gridRowHeight;
            const gridHeaderHeight = this._balancesComponent.getHeaderPlusFixedLineHeight();
            const gridHorizontalScrollbarInsideOverlap = balancesFrame.gridHorizontalScrollbarInsideOverlap;
            this.balancesHeight = gridHeaderHeight + gridRowHeight + gridHorizontalScrollbarInsideOverlap;
            this.markForCheck();
        }

        this.pushSellButtonState(this._frame.focusedRecordIndex);

        super.initialise();
    }

    protected override finalise() {
        this._accountGroupUiAction.finalise();
        this._sellUiAction.finalise();
        this._columnsUiAction.finalise();
        this._autoSizeColumnWidthsUiAction.finalise();
        this._accountGroupLinkUiAction.finalise();
        this._toggleSymbolLinkingUiAction.finalise();

        this._frame.finalise();
        super.finalise();
    }

    protected constructLoad(element: JsonElement | undefined) {
        const frameElement = this.tryGetChildFrameJsonElement(element);
        this._frame.constructLoad(frameElement);

        if (element === undefined) {
            this._explicitBalancesHeight = false;
        } else {
            const balancesHeightResult = element.tryGetNumber(HoldingsDitemNgComponent.JsonName.balancesHeight);
            if (balancesHeightResult.isErr()) {
                this._explicitBalancesHeight = false;
            } else {
                this.balancesHeight = balancesHeightResult.value;
                this._explicitBalancesHeight = true;
            }
        }
    }

    protected save(element: JsonElement) {
        if (this._explicitBalancesHeight) {
            const balancesHeight = this.getBalancesHeight();
            element.setNumber(HoldingsDitemNgComponent.JsonName.balancesHeight, balancesHeight);
        }

        const frameElement = this.createChildFrameJsonElement(element);
        this._frame.save(frameElement);
    }

    private handleAccountGroupCommitEvent(typeId: UiAction.CommitTypeId) {
        const accountId = this._accountGroupUiAction.definedValue;
        this._frame.setBrokerageAccountGroupFromDitem(accountId);
    }

    private handleSellSignalEvent() {
        this._frame.sellFocused();
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

    private handleToggleSymbolLinkingSignalEvent() {
        this._frame.dataIvemIdLinked = !this._frame.dataIvemIdLinked;
    }

    private handleHoldingsRecordFocusEvent(recordIndex: Integer | undefined) {
        this.pushSellButtonState(this._frame.focusedRecordIndex);
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
        action.signalEvent = () => this.handleToggleSymbolLinkingSignalEvent();
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

    private pushSellButtonState(newRecordIndex: Integer | undefined) {
        if (newRecordIndex === undefined) {
            this._sellUiAction.pushDisabled();
        } else {
            this._sellUiAction.pushValidOrMissing();
        }
    }

    private pushAccountLinkButtonState() {
        if (this._frame.brokerageAccountGroupLinked) {
            this._accountGroupLinkUiAction.pushSelected();
        } else {
            this._accountGroupLinkUiAction.pushUnselected();
        }
    }

    private pushSymbolLinkButtonState() {
        if (this._frame.dataIvemIdLinked) {
            this._toggleSymbolLinkingUiAction.pushSelected();
        } else {
            this._toggleSymbolLinkingUiAction.pushUnselected();
        }
    }

    private getBalancesHeight() {
        const rect = this._balancesComponent.elRef.nativeElement.getBoundingClientRect();
        return rect.height;
    }

    private showLayoutEditorDialog() {
        this._activeDialogTypeId = HoldingsDitemNgComponent.ActiveDialogTypeId.Layout;

        const allowedFieldsAndLayoutDefinitions = this._frame.createAllowedFieldsAndLayoutDefinition();

        const closePromise = HoldingsColumnLayoutsDialogNgComponent.open(
            this._dialogContainer,
            this._frame.opener,
            Strings[StringId.Holdings_ColumnsDialogCaption],
            allowedFieldsAndLayoutDefinitions
        );
        closePromise.then(
            (layoutOrReferenceDefinition) => {
                if (layoutOrReferenceDefinition !== undefined) {
                    this._frame.openColumnLayoutOrReferenceDefinition(layoutOrReferenceDefinition);
                }
                this.closeDialog();
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'HDNCSLEDCPTR20987'); }
        );

        this.markForCheck();
    }

    private closeDialog() {
        this._dialogContainer.clear();
        this._activeDialogTypeId = HoldingsDitemNgComponent.ActiveDialogTypeId.None;
        this.markForCheck();
    }
}

export namespace HoldingsDitemNgComponent {
    export const stateSchemaVersion = '2';

    export namespace JsonName {
        export const balancesHeight = 'balancesHeight';
    }

    export const enum ActiveDialogTypeId {
        None,
        Layout,
    }
}
