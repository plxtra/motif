import { AfterViewInit, ChangeDetectionStrategy, Component, Injector, OnDestroy, ViewContainerRef, createNgModule, inject, viewChild } from '@angular/core';
import { AssertInternalError, JsonElement, delay1Tick } from '@pbkware/js-utils';
import { AdiNgService, MarketsNgService, SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import { TabListNgComponent } from 'controls-ng-api';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { DiagnosticsDitemFrame } from '../diagnostics-ditem-frame';

@Component({
    selector: 'app-diagnostics-ditem',
    templateUrl: './diagnostics-ditem-ng.component.html',
    styleUrls: ['./diagnostics-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TabListNgComponent]
})
export class DiagnosticsDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    private readonly _injector = inject(Injector);

    private readonly _tabListComponentSignal = viewChild.required<TabListNgComponent>('tabList');
    private readonly _groupContainerSignal = viewChild.required('groupContainer', { read: ViewContainerRef });

    private readonly _frame: DiagnosticsDitemFrame;

    private _tabListComponent: TabListNgComponent;
    private _groupContainer: ViewContainerRef;

    private _diagnosticsGroupId: DiagnosticsDitemFrame.GroupId;

    constructor() {
        super(++DiagnosticsDitemNgComponent.typeInstanceCreateCount);

        const settingsNgService = inject(SettingsNgService);
        const marketsNgService = inject(MarketsNgService);
        const desktopAccessNgService = inject(DesktopAccessNgService);
        const symbolsNgService = inject(SymbolsNgService);
        const adiNgService = inject(AdiNgService);

        this._frame = new DiagnosticsDitemFrame(
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
    protected override get stateSchemaVersion() { return DiagnosticsDitemNgComponent.stateSchemaVersion; }

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
        this.setGroupId(DiagnosticsDitemFrame.GroupId.Debug);
        super.initialise();
    }

    protected override finalise() {
        this._frame.finalise();
        super.finalise();
    }

    protected save(element: JsonElement) {
        // nothing to save
    }

    private handleActiveTabChangedEvent(groupId: DiagnosticsDitemFrame.GroupId, tab: TabListNgComponent.Tab) {
        if (tab.active) {
            this.setGroupId(groupId);
        }
    }

    private initialiseTabs() {
        const tabDefinitions: TabListNgComponent.TabDefinition[] = [
            {
                caption: DiagnosticsDitemFrame.Group.idToCaption(DiagnosticsDitemFrame.GroupId.Debug),
                initialActive: true,
                initialDisabled: false,
                activeChangedEventer: (tab) => this.handleActiveTabChangedEvent(DiagnosticsDitemFrame.GroupId.Debug, tab),
            },
        ];
        this._tabListComponent.setTabs(tabDefinitions);
    }

    private setGroupId(groupId: DiagnosticsDitemFrame.GroupId) {
        const promise = this.asyncSetGroupId(groupId);
        AssertInternalError.throwErrorIfPromiseRejected(
            promise,
            'DDNCSGI41499',
            DiagnosticsDitemFrame.Group.idToCaption(groupId),
            AssertInternalError.ExtraFormatting.PrependWithColonSpace
        );
    }

    private async asyncSetGroupId(value: DiagnosticsDitemFrame.GroupId) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (value !== this._diagnosticsGroupId) {
            this._groupContainer.clear();

            switch (value) {
                case DiagnosticsDitemFrame.GroupId.Debug: {
                    const moduleInstance = await this.getDiagnosticsModuleInstance();
                    const componentType = moduleInstance.debugComponentType;
                    this._groupContainer.createComponent(componentType);
                    break;
                }
            }

            this._diagnosticsGroupId = value;
            this.markForCheck();
        }
    }

    private async getDiagnosticsModuleInstance() {
        // https://stackoverflow.com/questions/75883330/how-to-load-lazy-modules-programmatically-in-angular-app
        const { DiagnosticsNgModule } = await import('diagnostics-ng-api')
        return createNgModule(DiagnosticsNgModule, this._injector).instance;
    }
}

export namespace DiagnosticsDitemNgComponent {
    export const stateSchemaVersion = '2';
}
