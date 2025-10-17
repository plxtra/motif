import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy, viewChild, ViewContainerRef } from '@angular/core';
import { delay1Tick, JsonElement } from '@pbkware/js-utils';
import { AdiNgService, MarketsNgService, SymbolsNgService } from 'component-services-ng-api';
import {
    ColorSettingsNgComponent,
    ExchangesSettingsNgComponent,
    GeneralSettingsNgComponent,
    GridSettingsNgComponent,
    OrderPadSettingsNgComponent
} from 'content-ng-api';
import { TabListNgComponent } from 'controls-ng-api';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { SettingsDitemFrame } from '../settings-ditem-frame';
import { TabListNgComponent as TabListNgComponent_1 } from '../../../controls/tab-list/ng/tab-list-ng.component';

@Component({
    selector: 'app-settings-ditem',
    templateUrl: './settings-ditem-ng.component.html',
    styleUrls: ['./settings-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TabListNgComponent_1]
})
export class SettingsDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    private readonly _tabListComponentSignal = viewChild.required<TabListNgComponent>('tabList');
    private readonly _groupContainerSignal = viewChild.required('groupContainer', { read: ViewContainerRef });

    private readonly _frame: SettingsDitemFrame;

    private _tabListComponent: TabListNgComponent;
    private _groupContainer: ViewContainerRef;

    private _settingsGroupId: SettingsDitemFrame.GroupId;

    constructor() {
        super(++SettingsDitemNgComponent.typeInstanceCreateCount);

        const marketsNgService = inject(MarketsNgService);
        const desktopAccessNgService = inject(DesktopAccessNgService);
        const symbolsNgService = inject(SymbolsNgService);
        const adiNgService = inject(AdiNgService);

        this._frame = new SettingsDitemFrame(this, this.settingsService, marketsNgService.service, this.commandRegisterService,
            desktopAccessNgService.service, symbolsNgService.service, adiNgService.service);

        this.constructLoad(this.getInitialComponentStateJsonElement());
    }

    get ditemFrame() { return this._frame; }
    protected get stateSchemaVersion() { return SettingsDitemNgComponent.stateSchemaVersion; }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._tabListComponent = this._tabListComponentSignal();
        this._groupContainer = this._groupContainerSignal();

        delay1Tick(() => this.initialise());
    }

    protected override initialise() {
        this.initialiseTabs();
        this.setGroupId(SettingsDitemFrame.GroupId.General);
        super.initialise();
    }

    protected override finalise() {
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

    private initialiseTabs() {
        const tabDefinitions: TabListNgComponent.TabDefinition[] = [
            {
                caption: SettingsDitemFrame.Group.idToCaption(SettingsDitemFrame.GroupId.General),
                initialActive: true,
                initialDisabled: false,
                activeChangedEventer: (tab) => this.handleActiveTabChangedEvent(SettingsDitemFrame.GroupId.General, tab),
            },
            {
                caption: SettingsDitemFrame.Group.idToCaption(SettingsDitemFrame.GroupId.Grid),
                initialActive: false,
                initialDisabled: false,
                activeChangedEventer: (tab) => this.handleActiveTabChangedEvent(SettingsDitemFrame.GroupId.Grid, tab),
            },
            {
                caption: SettingsDitemFrame.Group.idToCaption(SettingsDitemFrame.GroupId.OrderPad),
                initialActive: false,
                initialDisabled: false,
                activeChangedEventer: (tab) => this.handleActiveTabChangedEvent(SettingsDitemFrame.GroupId.OrderPad, tab),
            },
            {
                caption: SettingsDitemFrame.Group.idToCaption(SettingsDitemFrame.GroupId.Exchanges),
                initialActive: false,
                initialDisabled: false,
                activeChangedEventer: (tab) => this.handleActiveTabChangedEvent(SettingsDitemFrame.GroupId.Exchanges, tab),
            },
            {
                caption: SettingsDitemFrame.Group.idToCaption(SettingsDitemFrame.GroupId.Colors),
                initialActive: false,
                initialDisabled: false,
                activeChangedEventer: (tab) => this.handleActiveTabChangedEvent(SettingsDitemFrame.GroupId.Colors, tab),
            },
        ];
        this._tabListComponent.setTabs(tabDefinitions);
    }

    private handleActiveTabChangedEvent(groupId: SettingsDitemFrame.GroupId, tab: TabListNgComponent.Tab) {
        if (tab.active) {
            this.setGroupId(groupId);
        }
    }

    private setGroupId(value: SettingsDitemFrame.GroupId) {
        if (value !== this._settingsGroupId) {
            this._groupContainer.clear();

            switch (value) {
                case SettingsDitemFrame.GroupId.General:
                    GeneralSettingsNgComponent.create(this._groupContainer);
                    break;
                case SettingsDitemFrame.GroupId.Grid:
                    GridSettingsNgComponent.create(this._groupContainer);
                    break;
                case SettingsDitemFrame.GroupId.OrderPad:
                    OrderPadSettingsNgComponent.create(this._groupContainer);
                    break;
                case SettingsDitemFrame.GroupId.Exchanges:
                    ExchangesSettingsNgComponent.create(this._groupContainer);
                    break;
                case SettingsDitemFrame.GroupId.Colors:
                    ColorSettingsNgComponent.create(this._groupContainer);
                    break;
            }

            this._settingsGroupId = value;
            this.markForCheck();
        }
    }
}

export namespace SettingsDitemNgComponent {
    export const stateSchemaVersion = '2';
}
