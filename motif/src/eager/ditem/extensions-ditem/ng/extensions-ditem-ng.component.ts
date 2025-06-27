import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    Inject,
    OnDestroy,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { AssertInternalError, delay1Tick, JsonElement } from '@pbkware/js-utils';
import { ColorScheme, ExtensionId, ExtensionInfo } from '@plxtra/motif-core';
import { SplitAreaSize, SplitComponent, SplitUnit } from 'angular-split';
import { AdiNgService, CommandRegisterNgService, MarketsNgService, SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import { ExtensionsSidebarNgComponent } from 'content-ng-api';
import { ComponentContainer } from 'golden-layout';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { ExtensionsDitemFrame } from '../extensions-ditem-frame';

@Component({
    selector: 'app-extensions-ditem',
    templateUrl: './extensions-ditem-ng.component.html',
    styleUrls: ['./extensions-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class ExtensionsDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    @HostBinding('style.--splitter-background-color') splitterBackgroundColor: string;

    public focusedInfo: ExtensionInfo | undefined;

    public splitterUnit: SplitUnit = 'percent';
    public splitterGutterSize = 3;
    public sidebarSplitAreaSize = 20;
    public detailSplitAreaSize: SplitAreaSize = 80;

    private readonly _splitterComponentSignal = viewChild.required<SplitComponent>('splitter');
    private readonly _sideBarComponentSignal = viewChild.required<ExtensionsSidebarNgComponent>('sidebar');

    private readonly _frame: ExtensionsDitemFrame;

    private _splitterComponent: SplitComponent;
    private _sideBarComponent: ExtensionsSidebarNgComponent;

    private _listTransitioningInfo: ExtensionInfo | undefined;

    private explicitSidbarWidth = false;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        @Inject(BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken) container: ComponentContainer,
        settingsNgService: SettingsNgService,
        marketsNgService: MarketsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        desktopAccessNgService: DesktopAccessNgService,
        symbolsNgService: SymbolsNgService,
        adiNgService: AdiNgService,
    ) {
        super(
            elRef,
            ++ExtensionsDitemNgComponent.typeInstanceCreateCount,
            cdr,
            container,
            settingsNgService.service,
            commandRegisterNgService.service
        );

        this._frame = new ExtensionsDitemFrame(this, this.settingsService, marketsNgService.service, this.commandRegisterService,
            desktopAccessNgService.service, symbolsNgService.service, adiNgService.service);

        elRef.nativeElement.style.position = 'absolute';
        elRef.nativeElement.style.overflow = 'hidden';

        this.constructLoad(this.getInitialComponentStateJsonElement());

        this.applySettings();
    }

    get ditemFrame() { return this._frame; }
    protected get stateSchemaVersion() { return ExtensionsDitemNgComponent.stateSchemaVersion; }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._splitterComponent = this._splitterComponentSignal();
        this._sideBarComponent = this._sideBarComponentSignal();

        delay1Tick(() => this.initialise());
    }

    public handleInfoFocus(info: ExtensionInfo): void {
        this.focusedInfo = info;
        this.markForCheck();
    }

    public handleListTransitionStart(info: ExtensionInfo) {
        this._listTransitioningInfo = info;
    }

    public handleListTransitionFinish(info: ExtensionInfo) {
        if (this._listTransitioningInfo === undefined) {
            throw new AssertInternalError('EDCHLTFU755433424');
        } else {
            if (!ExtensionId.isEqual(this._listTransitioningInfo, info)) {
                throw new AssertInternalError('EDCHLTFM755433424');
            } else {
                this.focusedInfo = info;
                this._listTransitioningInfo = undefined;
            }
        }
    }

    public splitDragEnd() {
        this.explicitSidbarWidth = true;
    }

    protected override initialise() {
        this.checkSetSidebarPixelWidth();

        // this._detailSplitAreaDirective.size = null;
        // this._sidebarSplitAreaDirective.size = width;
        super.initialise();
    }

    protected override finalise() {
        this._frame.finalise();
        super.finalise();
    }

    protected constructLoad(element: JsonElement | undefined) {
        const frameElement = this.tryGetChildFrameJsonElement(element);
        this._frame.constructLoad(frameElement);

        if (element === undefined) {
            this.explicitSidbarWidth = false;
        } else {
            const sidebarWidthResult = element.tryGetNumber(ExtensionsDitemNgComponent.JsonName.sidebarWidth);
            if (sidebarWidthResult.isErr()) {
                this.explicitSidbarWidth = false;
            } else {
                this.sidebarSplitAreaSize = sidebarWidthResult.value;
                this.detailSplitAreaSize = '*';
                this.splitterUnit = 'pixel';
                this.explicitSidbarWidth = true;
                this.markForCheck();
            }
        }
    }

    protected save(element: JsonElement) {
        if (this.explicitSidbarWidth) {
            const sidebarWidth = this.getSidebarWidth();
            element.setNumber(ExtensionsDitemNgComponent.JsonName.sidebarWidth, sidebarWidth);
        }
        const frameElement = this.createChildFrameJsonElement(element);
        this._frame.save(frameElement);
    }

    protected override applySettings() {
        this.splitterBackgroundColor = this.settingsService.color.getBkgd(ColorScheme.ItemId.Panel_Hoisted);
        super.applySettings();
        this.markForCheck();
    }

    protected override processShown() {
        this.checkSetSidebarPixelWidth();
    }

    private checkSetSidebarPixelWidth() {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!this.explicitSidbarWidth && this._splitterComponent !== undefined) {
            if (this._splitterComponent.unit() !== 'pixel') {
                const width = this._sideBarComponent.width;
                if (width > 0) {
                    this.splitterUnit = 'pixel';
                    this.sidebarSplitAreaSize = width;
                    this.detailSplitAreaSize = '*';
                    // this._splitterComponent.setVisibleAreaSizes([width, '*']);
                }
            }
        }
    }

    private getSidebarWidth(): number {
        const rect = this._sideBarComponent.elRef.nativeElement.getBoundingClientRect();
        return rect.width;
    }
}

export namespace ExtensionsDitemNgComponent {
    export const stateSchemaVersion = '2';

    export namespace JsonName {
        export const sidebarWidth = 'sidebarWidth';
    }
}
