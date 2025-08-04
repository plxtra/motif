import { AfterViewInit, ChangeDetectionStrategy, Component, effect, ElementRef, inject, OnDestroy, untracked, viewChild, viewChildren } from '@angular/core';
import { delay1Tick, HtmlTypes, JsonElement, ModifierKey, ModifierKeyId, numberToPixels } from '@pbkware/js-utils';
import { BooleanUiAction, UiAction } from '@pbkware/ui-action';
import {
    ButtonUiAction,
    ColorScheme,
    IconButtonUiAction,
    InternalCommand,
    OrderPad,
    OrderRequestType,
    StringId,
    Strings
} from '@plxtra/motif-core';
import {
    AdiNgService,
    DecimalFactoryNgService,
    MarketsNgService,
    SymbolDetailCacheNgService,
    SymbolsNgService
} from 'component-services-ng-api';
import { OrderRequestStepFrame } from 'content-internal-api';
import {
    OrderRequestStepComponentNgDirective
} from 'content-ng-api';
import { ButtonInputNgComponent, CaptionedCheckboxNgComponent, SvgButtonNgComponent } from 'controls-ng-api';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { OrderRequestDitemFrame } from '../order-request-ditem-frame';

@Component({
    selector: 'app-order-request-ditem',
    templateUrl: './order-request-ditem-ng.component.html',
    styleUrls: ['./order-request-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class OrderRequestDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements OnDestroy, AfterViewInit, OrderRequestDitemFrame.ComponentAccess {
    private static typeInstanceCreateCount = 0;

    public StepId = OrderRequestDitemFrame.StepId;
    public stepId: OrderRequestStepFrame.StepId;
    public panelDividerColor: string;

    public linkButtonDisplayed: boolean;
    public reviewMessageCheckboxDisplayed: boolean;

    public reviewBackSectionDisplayed = false;
    public reviewBackSectionWidth: string = HtmlTypes.Width.MaxContent;
    public reviewButtonInitDisplayed: boolean;

    public newAmendRequestPossibleFlagVisibility = HtmlTypes.Visibility.Hidden;
    public newAmendRequestPossibleFlagChar = Strings[StringId.OrderRequest_NewAmendPossibleFlagChar];

    private readonly _padElementRefSignal = viewChild.required<ElementRef<HTMLDivElement>>('pad');
    private readonly _primaryButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('primaryButton');
    private readonly _symbolLinkButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('symbolLinkButton');
    private readonly _accountLinkButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('accountLinkButton');
    private readonly _reviewMessageCheckBoxComponentSignal = viewChild.required<CaptionedCheckboxNgComponent>('reviewMessageCheckBox');
    private readonly _newButtonComponentSignal = viewChild.required<ButtonInputNgComponent>('newButton');
    private readonly _reviewBackSectionElementSignal = viewChild.required<ElementRef<HTMLElement>>('reviewBackSection');
    private readonly _backButtonComponentSignal = viewChild.required<ButtonInputNgComponent>('backButton');
    private readonly _reviewButtonComponentSignal = viewChild.required<ButtonInputNgComponent>('reviewButton');
    private readonly _sendButtonComponentSignal = viewChild.required<ButtonInputNgComponent>('sendButton');
    // @viewChild.required('padStep', { static: true }) private _padStepFrameContainerSignal: PadOrderRequestStepComponent;
    // @viewChild.required('reviewStep', { static: true }) private _reviewStepFrameContainerSignal: ReviewOrderRequestStepComponent;
    // @viewChild.required('resultStep', { static: true }) private _resultStepFrameContainerSignal: ResultOrderRequestStepComponent;

    private readonly _stepComponentsSignal = viewChildren<OrderRequestStepComponentNgDirective>('padStep, reviewStep, resultStep');

    private readonly _primaryUiAction: IconButtonUiAction;
    private readonly _toggleSymbolLinkingUiAction: IconButtonUiAction;
    private readonly _toggleAccountLinkingUiAction: IconButtonUiAction;
    private readonly _reviewZenithMessageActiveUiAction: BooleanUiAction;
    private readonly _newUiAction: ButtonUiAction;
    private readonly _backUiAction: ButtonUiAction;
    private readonly _reviewUiAction: ButtonUiAction;
    private readonly _sendUiAction: ButtonUiAction;

    private readonly _frame: OrderRequestDitemFrame;

    private _padElementRef: ElementRef<HTMLDivElement>;
    private _primaryButtonComponent: SvgButtonNgComponent;
    private _symbolLinkButtonComponent: SvgButtonNgComponent;
    private _accountLinkButtonComponent: SvgButtonNgComponent;
    private _reviewMessageCheckBoxComponent: CaptionedCheckboxNgComponent;
    private _newButtonComponent: ButtonInputNgComponent;
    private _reviewBackSectionElement: ElementRef<HTMLElement>;
    private _backButtonComponent: ButtonInputNgComponent;
    private _reviewButtonComponent: ButtonInputNgComponent;
    private _sendButtonComponent: ButtonInputNgComponent;

    private _padHtmlElement: HTMLDivElement;

    constructor() {
        super(++OrderRequestDitemNgComponent.typeInstanceCreateCount);

        const decimalFactoryNgService = inject(DecimalFactoryNgService);
        const marketsNgService = inject(MarketsNgService);
        const desktopAccessNgService = inject(DesktopAccessNgService);
        const adiNgService = inject(AdiNgService);
        const symbolsNgService = inject(SymbolsNgService);
        const symbolDetailCacheNgService = inject(SymbolDetailCacheNgService);

        this._frame = new OrderRequestDitemFrame(
            this,
            decimalFactoryNgService.service,
            this.settingsService,
            marketsNgService.service,
            this.commandRegisterService,
            desktopAccessNgService.service,
            symbolsNgService.service,
            adiNgService.service,
            symbolDetailCacheNgService.service,
        );

        this._primaryUiAction = this.createPrimaryUiAction();
        this._toggleSymbolLinkingUiAction = this.createToggleSymbolLinkingUiAction();
        this._toggleAccountLinkingUiAction = this.createToggleAccountLinkingUiAction();
        this._reviewZenithMessageActiveUiAction = this.createReviewZenithMessageActiveUiAction();
        this._newUiAction = this.createNewUiAction();
        this._backUiAction = this.createBackUiAction();
        this._reviewUiAction = this.createReviewUiAction();
        this._sendUiAction = this.createSendUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());

        this.reviewButtonInitDisplayed = this.settingsService.scalar.orderPad_ReviewEnabled;

        this.pushPrimarySelectState();
        this.pushSymbolLinkedSelectState();
        this.pushAccountLinkedSelectState();
        this.pushSymbolAccountIncomingLinkableChanged();

        effect(() => {
            const stepComponents = this._stepComponentsSignal();
            untracked(() => {
                if (stepComponents.length > 0) {
                    const firstStepComponent = stepComponents[0];
                    const firstStepFrame = firstStepComponent.frame;
                    delay1Tick(() => this._frame.setActiveStepFrame(firstStepFrame));
                }
            });
        });
    }

    get frame() { return this._frame; }
    get ditemFrame() { return this._frame; }

    protected get stateSchemaVersion() { return OrderRequestDitemNgComponent.stateSchemaVersion; }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._padElementRef = this._padElementRefSignal();
        this._primaryButtonComponent = this._primaryButtonComponentSignal();
        this._symbolLinkButtonComponent = this._symbolLinkButtonComponentSignal();
        this._accountLinkButtonComponent = this._accountLinkButtonComponentSignal();
        this._reviewMessageCheckBoxComponent = this._reviewMessageCheckBoxComponentSignal();
        this._newButtonComponent = this._newButtonComponentSignal();
        this._reviewBackSectionElement = this._reviewBackSectionElementSignal();
        this._backButtonComponent = this._backButtonComponentSignal();
        this._reviewButtonComponent = this._reviewButtonComponentSignal();
        this._sendButtonComponent = this._sendButtonComponentSignal();

        delay1Tick(() => this.initialise());
    }

    setOrderPad(pad: OrderPad) {
        this._frame.setOrderPad(pad);
    }

    // component access methods
    public pushStepId(stepId: OrderRequestStepFrame.StepId) {
        if (stepId === OrderRequestStepFrame.StepId.Pad) {
            this._padHtmlElement.style.width = HtmlTypes.Width.MaxContent;
            this._padHtmlElement.style.height = HtmlTypes.Height.MaxContent;
        } else {
            if (this.stepId === OrderRequestStepFrame.StepId.Pad) {
                const padWidth = this._padHtmlElement.offsetWidth;
                if (padWidth > 0) {
                    this._padHtmlElement.style.width = numberToPixels(padWidth);
                }
                const padHeight = this._padHtmlElement.offsetHeight;
                if (padHeight > 0) {
                    this._padHtmlElement.style.height = numberToPixels(padHeight);
                }
            }
        }

        this.stepId = stepId;
        this.markForCheck();
    }

    public orderPadApplied() {
        const requestTypeDisplay = OrderRequestType.idToDisplay(this._frame.orderPad.requestTypeId);
        this._sendUiAction.pushCaption(`${Strings[StringId.OrderRequest_SendCaption]} ${requestTypeDisplay}`);
    }

    public pushSymbolAccountIncomingLinkableChanged() {
        if (this._frame.symbolAccountIncomingLinkable !== this.linkButtonDisplayed) {
            this.linkButtonDisplayed = this._frame.symbolAccountIncomingLinkable;
            this.markForCheck();
        }
    }

    public pushSendEnabled(enabled: boolean) {
        if (enabled) {
            this._sendUiAction.pushAccepted();
        } else {
            this._sendUiAction.pushDisabled();
        }
    }

    public pushReviewBackNotDisplayed() {
        this.pushReviewBackSectionDisplayed(false);
    }

    public pushBackButtonEnabled(value: boolean) {
        this.pushBackButtonDisplayedTrue(); // make sure visible
        if (value) {
            this._backUiAction.pushAccepted();
        } else {
            this._backUiAction.pushDisabled();
        }
    }

    public pushReviewEnabled(value: boolean) {
        this.pushReviewButtonDisplayedTrue();
        if (value) {
            this._reviewUiAction.pushAccepted();
        } else {
            this._reviewUiAction.pushDisabled();
        }
    }

    public pushNewAmendRequestPossible(value: boolean) {
        if (value) {
            this.newAmendRequestPossibleFlagVisibility = HtmlTypes.Visibility.Visible;
        } else {
            this.newAmendRequestPossibleFlagVisibility = HtmlTypes.Visibility.Hidden;
        }
        this.markForCheck();
    }

    public pushReviewZenithMessageNotDisplayed() {
        this.pushReviewMessageCheckboxDisplayed(false);
    }

    public pushReviewZenithMessageActive(value: boolean) {
        this.pushReviewMessageCheckboxDisplayed(true);
        this._reviewZenithMessageActiveUiAction.pushValue(value);
    }

    public override processPrimaryChanged() {
        this.pushPrimarySelectState();
    }

    public override processSymbolLinkedChanged() {
        this.pushSymbolLinkedSelectState();
    }

    public override processBrokerageAccountGroupLinkedChanged() {
        this.pushAccountLinkedSelectState();
    }

    public pushReviewBackSectionDisplayed(value: boolean) {
        if (this.reviewBackSectionDisplayed !== value) {
            this.reviewBackSectionDisplayed = value;

            this.markForCheck();
        }
    }

    public pushReviewButtonDisplayedTrue() {
        this.pushReviewBackSectionDisplayed(true); // make sure visible
        if (this._reviewButtonComponent.noneDisplayOverrideActive()) {
            this.reviewBackSectionWidth = HtmlTypes.Width.MaxContent;
            this._backButtonComponent.noneDisplayOverrideActive.set(true);
            this._reviewButtonComponent.noneDisplayOverrideActive.set(false);

            this.markForCheck();
        }
    }

    public pushBackButtonDisplayedTrue() {
        this.pushReviewBackSectionDisplayed(true); // make sure visible
        if (this._backButtonComponent.noneDisplayOverrideActive()) {
            if (this._reviewButtonComponent.noneDisplayOverrideActive()) {
                this.reviewBackSectionWidth = HtmlTypes.Width.MaxContent;
            } else {
                const sectionWidth = this._reviewBackSectionElement.nativeElement.offsetWidth;
                if (sectionWidth > 0) {
                    this.reviewBackSectionWidth = numberToPixels(sectionWidth);
                } else {
                    this.reviewBackSectionWidth = HtmlTypes.Width.MaxContent;
                }
                this._reviewButtonComponent.noneDisplayOverrideActive.set(true);
            }
            this._backButtonComponent.noneDisplayOverrideActive.set(false);

            this.markForCheck();
        }
    }

    protected override initialise() {
        this._padHtmlElement = this._padElementRef.nativeElement;

        const componentStateElement = this.getInitialComponentStateJsonElement();
        this._frame.initialise(componentStateElement);

        this._primaryButtonComponent.initialise(this._primaryUiAction);
        this._symbolLinkButtonComponent.initialise(this._toggleSymbolLinkingUiAction);
        this._accountLinkButtonComponent.initialise(this._toggleAccountLinkingUiAction);
        this._reviewMessageCheckBoxComponent.initialise(this._reviewZenithMessageActiveUiAction);
        this._newButtonComponent.initialise(this._newUiAction);
        this._backButtonComponent.initialise(this._backUiAction);
        this._backButtonComponent.noneDisplayOverrideActive.set(true); // make sure not displayed initially
        this._reviewButtonComponent.initialise(this._reviewUiAction);
        this._sendButtonComponent.initialise(this._sendUiAction);

        super.initialise();
    }

    protected override finalise() {
        this._primaryUiAction.finalise();
        this._toggleSymbolLinkingUiAction.finalise();
        this._toggleAccountLinkingUiAction.finalise();
        this._reviewZenithMessageActiveUiAction.finalise();
        this._newUiAction.finalise();
        this._backUiAction.finalise();
        this._reviewUiAction.finalise();
        this._sendUiAction.finalise();

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

    protected override applySettings() {
        this.panelDividerColor = this.settingsService.color.getFore(ColorScheme.ItemId.Panel_Divider);
        this.markForCheck();
        super.applySettings();
    }

    private handlePrimaryUiActionSignalEvent() {
        this._frame.primary = !this._frame.primary;
    }

    private handleSymbolLinkUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this._frame.dataIvemIdLinked = !this._frame.dataIvemIdLinked;
    }

    private handleAccountLinkUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this._frame.brokerageAccountGroupLinked = !this._frame.brokerageAccountGroupLinked;
    }

    private handleReviewZenithMessageActiveCommitEvent() {
        this._frame.setReviewZenithMessageActive(this._reviewZenithMessageActiveUiAction.definedValue);
    }

    private handleNewUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        if (ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Shift)) {
            this._frame.newPlaceOrderPadFromPrevious();
        } else {
            if (ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Ctrl)) {
                this._frame.newAmendOrderPadFromResult();
            } else {
                this._frame.newOrderPad();
            }
        }
    }

    private handleBackUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this._frame.back();
    }

    private handleReviewUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this._frame.review();
    }

    private handleSendUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this._frame.send();
    }

    private createPrimaryUiAction() {
        const commandName = InternalCommand.Id.OrderRequest_TogglePrimary;
        const displayId = StringId.OrderRequest_PrimaryCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.OrderRequest_PrimaryTitle]);
        action.pushIcon(IconButtonUiAction.IconId.PrimaryDitemFrame);
        action.signalEvent = () => this.handlePrimaryUiActionSignalEvent();
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

    private createToggleAccountLinkingUiAction() {
        const commandName = InternalCommand.Id.ToggleAccountLinking;
        const displayId = StringId.ToggleAccountLinkingCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ToggleAccountLinkingTitle]);
        action.pushIcon(IconButtonUiAction.IconId.AccountGroupLink);
        action.signalEvent = (signalTypeId, downKeys) => this.handleAccountLinkUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private createReviewZenithMessageActiveUiAction() {
        const action = new BooleanUiAction();
        action.pushTitle(Strings[StringId.OrderRequest_ReviewZenithMessageActiveTitle]);
        action.pushCaption(Strings[StringId.OrderRequest_ReviewZenithMessageActiveCaption]);
        action.commitEvent = () => this.handleReviewZenithMessageActiveCommitEvent();
        return action;
    }

    private createNewUiAction() {
        const commandName = InternalCommand.Id.OrderRequest_New;
        const displayId = StringId.OrderRequest_NewCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.OrderRequest_NewTitle]);
        action.signalEvent = (signalTypeId, downKeys) => this.handleNewUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private createBackUiAction() {
        const commandName = InternalCommand.Id.OrderRequest_Back;
        const displayId = StringId.OrderRequest_BackCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.OrderRequest_BackTitle]);
        action.signalEvent = (signalTypeId, downKeys) => this.handleBackUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private createReviewUiAction() {
        const commandName = InternalCommand.Id.OrderRequest_Review;
        const displayId = StringId.OrderRequest_ReviewCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.OrderRequest_ReviewTitle]);
        action.signalEvent = (signalTypeId, downKeys) => this.handleReviewUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private createSendUiAction() {
        const commandName = InternalCommand.Id.OrderRequest_Send;
        const displayId = StringId.OrderRequest_SendCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.OrderRequest_SendTitle]);
        action.signalEvent = (signalTypeId, downKeys) => this.handleSendUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private pushPrimarySelectState() {
        if (this._frame.primary) {
            this._primaryUiAction.pushSelected();
        } else {
            this._primaryUiAction.pushUnselected();
        }
    }

    private pushSymbolLinkedSelectState() {
        if (this._frame.dataIvemIdLinked) {
            this._toggleSymbolLinkingUiAction.pushSelected();
        } else {
            this._toggleSymbolLinkingUiAction.pushUnselected();
        }
    }

    private pushAccountLinkedSelectState() {
        if (this._frame.brokerageAccountGroupLinked) {
            this._toggleAccountLinkingUiAction.pushSelected();
        } else {
            this._toggleAccountLinkingUiAction.pushUnselected();
        }
    }

    private pushReviewMessageCheckboxDisplayed(value: boolean) {
        if (value !== this.reviewMessageCheckboxDisplayed) {
            this.reviewMessageCheckboxDisplayed = value;
            this.markForCheck();
        }
    }
}

export namespace OrderRequestDitemNgComponent {
    export const stateSchemaVersion = '2';
}
