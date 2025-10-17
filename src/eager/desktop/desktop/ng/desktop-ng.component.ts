import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy, viewChild } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { AssertInternalError, delay1Tick, MultiEvent } from '@pbkware/js-utils';
import {
    ButtonUiAction,
    ColorScheme,
    CommandRegisterService,
    InternalCommand,
    SettingsService,
    StringId
} from '@plxtra/motif-core';
import { ComponentBaseNgDirective } from 'component-ng-api';
import { SignOutService } from 'component-services-internal-api';
import {
    AdiNgService,
    AppStorageNgService,
    BrandingNgService,
    CapabilitiesNgService,
    CommandRegisterNgService,
    DecimalFactoryNgService,
    HideUnloadSaveNgService,
    IdleNgService,
    KeyboardNgService,
    MarketsNgService,
    SettingsNgService,
    SignOutNgService,
    SymbolDetailCacheNgService,
    ToastNgService,
    UserAlertNgService
} from 'component-services-ng-api';
import { ExtensionsAccessNgService, TableFieldSourceDefinitionCachingFactoryNgService, TableRecordSourceFactoryNgService } from 'content-ng-api';
import { ButtonInputNgComponent, CommandBarNgComponent, MenuBarNgService, MenuBarRootMenuNgComponent } from 'controls-ng-api';
import { BuiltinDitemNgComponentBaseNgDirective, DesktopAccessNgService } from 'ditem-ng-api';
import { ComponentItem } from 'golden-layout';
import { GoldenLayoutHostNgComponent } from '../../golden-layout-host/ng-api';
import { DesktopFrame } from '../desktop-frame';
import { DesktopBannerNgComponent } from '../../desktop-banner/ng/desktop-banner-ng.component';

@Component({
    selector: 'app-desktop',
    templateUrl: './desktop-ng.component.html',
    styleUrls: ['./desktop-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DesktopBannerNgComponent, MenuBarRootMenuNgComponent, ButtonInputNgComponent, CommandBarNgComponent, GoldenLayoutHostNgComponent]
})
export class DesktopNgComponent extends ComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    private static typeInstanceCreateCount = 0;

    public readonly environmentDisplayVisible: boolean;
    public readonly advertisingEnabled: boolean;
    public readonly barLeftImageExists: boolean;
    public readonly barLeftImageUrl: SafeResourceUrl;
    public barBkgdColor: string;
    public barForeColor: string;

    private readonly _menuBarRootMenuComponentSignal = viewChild.required<MenuBarRootMenuNgComponent>('menuBarRootMenu');
    private readonly _aboutAdvertisingButtonComponentSignal = viewChild<ButtonInputNgComponent>('aboutAdvertisingButton');
    private readonly _commandBarComponentSignal = viewChild.required<CommandBarNgComponent>('commandBar');
    private readonly _signOutButtonComponentSignal = viewChild.required<ButtonInputNgComponent>('signOutButton');
    private readonly _layoutHostComponentSignal = viewChild.required<GoldenLayoutHostNgComponent>('layoutHost');

    private readonly _commandRegisterService: CommandRegisterService;
    private readonly _settingsService: SettingsService;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    private readonly _desktopFrame: DesktopFrame;

    private readonly _aboutAdvertisingUiAction: ButtonUiAction | undefined;
    private readonly _signOutUiAction: ButtonUiAction;
    // private _commandBarUiAction: CommandBarUiAction;

    private _menuBarRootMenuComponent: MenuBarRootMenuNgComponent;
    private _aboutAdvertisingButtonComponent: ButtonInputNgComponent | undefined;
    private _commandBarComponent: CommandBarNgComponent;
    private _signOutButtonComponent: ButtonInputNgComponent;
    private _layoutHostComponent: GoldenLayoutHostNgComponent;

    constructor() {
        super(++DesktopNgComponent.typeInstanceCreateCount);

        const decimalFactoryNgService = inject(DecimalFactoryNgService);
        const toastNgService = inject(ToastNgService);
        const idleNgService = inject(IdleNgService);
        const appStorageNgService = inject(AppStorageNgService);
        const settingsNgService = inject(SettingsNgService);
        const marketsNgService = inject(MarketsNgService);
        const userAlertNgService = inject(UserAlertNgService);
        const capabilitiesNgService = inject(CapabilitiesNgService);
        const extensionsAccessNgService = inject(ExtensionsAccessNgService);
        const desktopAccessNgService = inject(DesktopAccessNgService);
        const symbolDetailCacheNgService = inject(SymbolDetailCacheNgService);
        const adiNgService = inject(AdiNgService);
        const signOutNgService = inject(SignOutNgService);
        const menuBarNgService = inject(MenuBarNgService);
        const commandRegisterNgService = inject(CommandRegisterNgService);
        const keyboardNgService = inject(KeyboardNgService);
        const tableFieldSourceDefinitionFactoryNgService = inject(TableFieldSourceDefinitionCachingFactoryNgService);
        const tableRecordSourceFactoryNgService = inject(TableRecordSourceFactoryNgService);
        const hideUnloadSaveNgService = inject(HideUnloadSaveNgService);
        const brandingService = inject<BrandingNgService>(BrandingNgService.injectionToken);

        this._commandRegisterService = commandRegisterNgService.service;
        this._settingsService = settingsNgService.service;
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.handleSettingsChangedEvent());

        const signOutService = signOutNgService.service;

        const barLeftImageUrl = brandingService.desktopBarLeftImageUrl;
        if (barLeftImageUrl === undefined) {
            this.barLeftImageExists = false;
            this.barLeftImageUrl = '';
        } else {
            this.barLeftImageExists = true;
            this.barLeftImageUrl = barLeftImageUrl;
        }

        const capabilitiesService = capabilitiesNgService.service;
        this.advertisingEnabled = capabilitiesService.advertisingEnabled;
        const marketsService = marketsNgService.service;

        this._desktopFrame = new DesktopFrame(
            this.rootHtmlElement,
            decimalFactoryNgService.service,
            toastNgService.service,
            idleNgService.service,
            appStorageNgService.service,
            this._settingsService,
            marketsService,
            userAlertNgService.service,
            capabilitiesService,
            extensionsAccessNgService.service,
            symbolDetailCacheNgService.service,
            adiNgService.service,
            signOutService,
            menuBarNgService.service,
            this._commandRegisterService,
            keyboardNgService.service,
            hideUnloadSaveNgService.service,
            brandingService.startupSplashWebPageSafeResourceUrl !== undefined,
            (component) => this.getBuiltinDitemFrameFromGoldenLayoutComponent(component),
        );

        desktopAccessNgService.setService(this._desktopFrame);
        tableFieldSourceDefinitionFactoryNgService.touch();
        tableRecordSourceFactoryNgService.touch();

        this.environmentDisplayVisible = !marketsService.defaultExchangeEnvironment.production;

        if (this.advertisingEnabled) {
            this._aboutAdvertisingUiAction = this.createAboutAdvertisingUiAction();
        }
        this._signOutUiAction = this.createSignOutUiAction(signOutService);
        this.applyColors();
    }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit() {
        this._menuBarRootMenuComponent = this._menuBarRootMenuComponentSignal();
        this._aboutAdvertisingButtonComponent = this._aboutAdvertisingButtonComponentSignal();
        this._commandBarComponent = this._commandBarComponentSignal();
        this._signOutButtonComponent = this._signOutButtonComponentSignal();
        this._layoutHostComponent = this._layoutHostComponentSignal();

        delay1Tick(() => this.initialise());
    }

    private handleSettingsChangedEvent() {
        this.applyColors();
    }

    private initialise() {
        const layoutHostFrame = this._layoutHostComponent.frame;
        this._desktopFrame.initialise(layoutHostFrame);
        if (this._aboutAdvertisingButtonComponent !== undefined && this._aboutAdvertisingUiAction !== undefined) {
            this._aboutAdvertisingButtonComponent.initialise(this._aboutAdvertisingUiAction);
        }
        this._signOutButtonComponent.initialise(this._signOutUiAction);
    }

    private finalise() {
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
        if (this._aboutAdvertisingUiAction !== undefined) {
            this._aboutAdvertisingUiAction.finalise();
        }
        this._signOutUiAction.finalise();
        this._desktopFrame.finalise();

    }

    private applyColors() {
        this.barBkgdColor = this._settingsService.color.getBkgd(ColorScheme.ItemId.DesktopBar);
        this.barForeColor = this._settingsService.color.getFore(ColorScheme.ItemId.DesktopBar);
    }

    private createAboutAdvertisingUiAction() {
        const commandName = InternalCommand.Id.ShowAboutAdvertising;
        const displayId = StringId.Desktop_AboutAdvertisingCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        // action.signalEvent = () => signOutService.signOut();
        return action;
    }

    private createSignOutUiAction(signOutService: SignOutService) {
        const commandName = InternalCommand.Id.SignOut;
        const displayId = StringId.Desktop_SignOutCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.signalEvent = () => signOutService.signOut();
        return action;
    }

    private getBuiltinDitemFrameFromGoldenLayoutComponent(component: ComponentItem.Component) {
        if (typeof component !== 'object' || !(component instanceof BuiltinDitemNgComponentBaseNgDirective)) {
            throw new AssertInternalError('DCGBDFFGLC45559248');
        } else {
            return component.ditemFrame;
        }
    }
}
