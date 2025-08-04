
import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy, viewChild, ViewContainerRef } from '@angular/core';
import { delay1Tick, JsonElement } from '@pbkware/js-utils';
import { StringId, Strings } from '@plxtra/motif-core';
import { AdiNgService, MarketsNgService, SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import { ExchangeEnvironmentsNgComponent, ExchangesNgComponent, FeedsNgComponent, MarketBoardsNgComponent, StatusSummaryNgComponent, ZenithStatusNgComponent } from 'content-ng-api';
import { DataMarketsNgComponent } from '../../../content/data-markets/ng-api';
import { TradingMarketsNgComponent } from '../../../content/trading-markets/ng-api';
import { TabListNgComponent } from '../../../controls/ng-api';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { StatusDitemFrame } from '../status-ditem-frame';

@Component({
    selector: 'app-status-ditem',
    templateUrl: './status-ditem-ng.component.html',
    styleUrls: ['./status-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class StatusDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    private readonly _tabListComponentSignal = viewChild.required<TabListNgComponent>('tabList');
    private readonly _statusContainerSignal = viewChild.required('statusContainer', { read: ViewContainerRef });

    private readonly _frame: StatusDitemFrame;

    private _tabListComponent: TabListNgComponent;
    private _statusContainer: ViewContainerRef;

    constructor() {
        super(++StatusDitemNgComponent.typeInstanceCreateCount);

        const settingsNgService = inject(SettingsNgService);
        const marketsNgService = inject(MarketsNgService);
        const desktopAccessNgService = inject(DesktopAccessNgService);
        const symbolsNgService = inject(SymbolsNgService);
        const adiNgService = inject(AdiNgService);

        this._frame = new StatusDitemFrame(
            this,
            settingsNgService.service,
            marketsNgService.service,
            this.commandRegisterService,
            desktopAccessNgService.service,
            symbolsNgService.service,
            adiNgService.service
        );
    }

    override get ditemFrame() { return this._frame; }
    protected override get stateSchemaVersion() { return StatusDitemNgComponent.stateSchemaVersion; }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._tabListComponent = this._tabListComponentSignal();
        this._statusContainer = this._statusContainerSignal();

        delay1Tick(() => this.initialise());
    }

    // component access methods
    public loadConstructLayoutConfig(element: JsonElement | undefined) {
        if (element !== undefined) {
            // no code
        }
    }

    public createLayoutConfig() {
        const element = new JsonElement();
        return element;
    }

    protected override initialise() {
        this.initialiseTabs();
        StatusSummaryNgComponent.create(this._statusContainer);
        super.initialise();
    }

    protected override finalise() {
        this._statusContainer.clear();
        this._frame.finalise();
        super.finalise();
    }

    protected save(element: JsonElement) {
        // nothing to save
    }

    private initialiseTabs() {
        const tabDefinitions: TabListNgComponent.TabDefinition[] = [
            {
                caption: Strings[StringId.StatusDitem_Summary],
                initialActive: true,
                initialDisabled: false,
                activeChangedEventer: (tab) => {
                    if (tab.active) {
                        StatusSummaryNgComponent.create(this._statusContainer);
                    }
                },
            },
            {
                caption: Strings[StringId.StatusDitem_Feeds],
                initialActive: false,
                initialDisabled: false,
                activeChangedEventer: (tab) => {
                    if (tab.active) {
                        FeedsNgComponent.create(this._statusContainer, this._frame.opener);
                    }
                },
            },
            {
                caption: Strings[StringId.StatusDitem_ExchangeEnvironments],
                initialActive: false,
                initialDisabled: false,
                activeChangedEventer: (tab) => {
                    if (tab.active) {
                        ExchangeEnvironmentsNgComponent.create(this._statusContainer, this._frame.opener);
                    }
                },
            },
            {
                caption: Strings[StringId.StatusDitem_Exchanges],
                initialActive: false,
                initialDisabled: false,
                activeChangedEventer: (tab) => {
                    if (tab.active) {
                        ExchangesNgComponent.create(this._statusContainer, this._frame.opener);
                    }
                },
            },
            {
                caption: Strings[StringId.StatusDitem_MarketBoards],
                initialActive: false,
                initialDisabled: false,
                activeChangedEventer: (tab) => {
                    if (tab.active) {
                        MarketBoardsNgComponent.create(this._statusContainer, this._frame.opener);
                    }
                },
            },
            {
                caption: Strings[StringId.StatusDitem_DataMarkets],
                initialActive: false,
                initialDisabled: false,
                activeChangedEventer: (tab) => {
                    if (tab.active) {
                        DataMarketsNgComponent.create(this._statusContainer, this._frame.opener);
                    }
                },
            },
            {
                caption: Strings[StringId.StatusDitem_TradingMarkets],
                initialActive: false,
                initialDisabled: false,
                activeChangedEventer: (tab) => {
                    if (tab.active) {
                        TradingMarketsNgComponent.create(this._statusContainer, this._frame.opener);
                    }
                },
            },
            {
                caption: Strings[StringId.StatusDitem_Zenith],
                initialActive: false,
                initialDisabled: false,
                activeChangedEventer: (tab) => {
                    if (tab.active) {
                        ZenithStatusNgComponent.create(this._statusContainer);
                    }
                },
            },
        ];
        this._tabListComponent.setTabs(tabDefinitions);
    }
}

export namespace StatusDitemNgComponent {
    export const stateSchemaVersion = '2';
}
