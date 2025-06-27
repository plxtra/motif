import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, OnDestroy, output } from '@angular/core';
import { MultiEvent } from '@pbkware/js-utils';
import { ColorScheme, ColorSettings, ExtensionInfo, SettingsService } from '@plxtra/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-extensions-sidebar',
    templateUrl: './extensions-sidebar-ng.component.html',
    styleUrls: ['./extensions-sidebar-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ExtensionsSidebarNgComponent extends ContentComponentBaseNgDirective implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    @HostBinding('style.background-color') bkgdColor: string;

    readonly infoFocusEmitter = output<ExtensionInfo>();
    readonly listTransitionStartEmitter = output<ExtensionInfo>();
    readonly listTransitionFinishEmitter = output<ExtensionInfo>();

    public splitterGutterSize = 3;

    private readonly _settingsService: SettingsService;
    private readonly _colorSettings: ColorSettings;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(elRef: ElementRef<HTMLElement>, settingsNgService: SettingsNgService) {
        super(elRef, ++ExtensionsSidebarNgComponent.typeInstanceCreateCount);

        this._settingsService = settingsNgService.service;
        this._colorSettings = this._settingsService.color;
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.applySettings());
        this.applySettings();
    }

    get width() {
        const domRect = (this.rootHtmlElement).getBoundingClientRect();
        return Math.round(domRect.width);
    }

    ngOnDestroy() {
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
    }

    public handleAvailableInfoFocus(info: ExtensionInfo) {
        this.infoFocusEmitter.emit(info);
    }

    public handleAvailableInfoListTransitionStart(info: ExtensionInfo) {
        this.listTransitionStartEmitter.emit(info);
    }

    public handleAvailableInfoListTransitionFinish(info: ExtensionInfo) {
        this.listTransitionFinishEmitter.emit(info);
    }

    public handleInstalledInfoFocus(info: ExtensionInfo) {
        this.infoFocusEmitter.emit(info);
    }

    public handleInstalledInfoListTransitionStart(info: ExtensionInfo) {
        this.listTransitionStartEmitter.emit(info);
    }

    public handleInstalledInfoListTransitionFinish(info: ExtensionInfo) {
        this.listTransitionFinishEmitter.emit(info);
    }

    private applySettings() {
        this.bkgdColor = this._colorSettings.getBkgd(ColorScheme.ItemId.Panel_Hoisted);
    }
}
