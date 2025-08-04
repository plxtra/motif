import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy, viewChild } from '@angular/core';
import { delay1Tick, JsonElement } from '@pbkware/js-utils';
import {
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
import { BrokerageAccountsNgComponent } from 'content-ng-api';
import { SvgButtonNgComponent } from 'controls-ng-api';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { BrokerageAccountsDitemFrame } from '../brokerage-accounts-ditem-frame';

@Component({
    selector: 'app-brokerage-accounts-ditem',
    templateUrl: './brokerage-accounts-ditem-ng.component.html',
    styleUrls: ['./brokerage-accounts-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class BrokerageAccountsDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    private readonly _brokerageAccountsComponentSignal = viewChild.required<BrokerageAccountsNgComponent>('brokerageAccounts');
    private readonly _accountLinkButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('accountLinkButton');

    private readonly _frame: BrokerageAccountsDitemFrame;
    private readonly _toggleAccountLinkingUiAction: IconButtonUiAction;

    private _brokerageAccountsComponent: BrokerageAccountsNgComponent;
    private _accountLinkButtonComponent: SvgButtonNgComponent;

    constructor() {
        super(++BrokerageAccountsDitemNgComponent.typeInstanceCreateCount);

        const marketsNgService = inject(MarketsNgService);
        const desktopAccessNgService = inject(DesktopAccessNgService);
        const symbolsNgService = inject(SymbolsNgService);
        const adiNgService = inject(AdiNgService);
        const toastNgService = inject(ToastNgService);

        this._frame = new BrokerageAccountsDitemFrame(
            this,
            this.settingsService,
            marketsNgService.service,
            this.commandRegisterService,
            desktopAccessNgService.service,
            symbolsNgService.service,
            adiNgService.service,
            toastNgService.service,
        );

        this._toggleAccountLinkingUiAction = this.createToggleAccountLinkingUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());
        this.pushAccountLinkButtonState();
    }

    get ditemFrame() { return this._frame; }

    protected get stateSchemaVersion() { return BrokerageAccountsDitemNgComponent.stateSchemaVersion; }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._brokerageAccountsComponent = this._brokerageAccountsComponentSignal();
        this._accountLinkButtonComponent = this._accountLinkButtonComponentSignal();

        delay1Tick(() => this.initialise());
    }

    public override processBrokerageAccountGroupLinkedChanged() {
        this.pushAccountLinkButtonState();
    }

    // public setFilter(value: string) {

    // }

    protected override initialise() {
        const componentStateElement = this.getInitialComponentStateJsonElement();
        const ditemFrameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        this._frame.initialise(ditemFrameElement, this._brokerageAccountsComponent.frame);

        this.initialiseChildComponents(); // was previously delay1Tick

        super.initialise();
    }

    protected override finalise() {
        this._toggleAccountLinkingUiAction.finalise();

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

    private createToggleAccountLinkingUiAction() {
        const commandName = InternalCommand.Id.ToggleAccountLinking;
        const displayId = StringId.ToggleAccountLinkingCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ToggleAccountLinkingTitle]);
        action.pushIcon(IconButtonUiAction.IconId.AccountGroupLink);
        action.signalEvent = () => this.handleAccountLinkButtonSignalEvent();
        return action;
    }

    private handleAccountLinkButtonSignalEvent() {
        this._frame.brokerageAccountGroupLinked = !this._frame.brokerageAccountGroupLinked;
    }

    private initialiseChildComponents() {
        this._accountLinkButtonComponent.initialise(this._toggleAccountLinkingUiAction);
    }

    private pushAccountLinkButtonState() {
        if (this._frame.brokerageAccountGroupLinked) {
            this._toggleAccountLinkingUiAction.pushSelected();
        } else {
            this._toggleAccountLinkingUiAction.pushUnselected();
        }
    }
}

export namespace BrokerageAccountsDitemNgComponent {
    export const stateSchemaVersion = '2';
}
