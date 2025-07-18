import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    OnDestroy,
    ViewEncapsulation,
    output
} from '@angular/core';
import {
    Integer,
    MultiEvent,
} from '@pbkware/js-utils';
import {
    ColorScheme,
    ExtensionInfo,
    SettingsService,
    StringId,
    Strings
} from '@plxtra/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';
import { ExtensionsAccessService } from '../../extensions-access-service';
import { ExtensionsAccessNgService } from '../../ng/extensions-access-ng.service';

@Component({
    selector: 'app-installed-extension-list',
    templateUrl: './installed-extension-list-ng.component.html',
    styleUrls: ['./installed-extension-list-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class InstalledExtensionListNgComponent extends ContentComponentBaseNgDirective implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    @HostBinding('style.--color-grid-base-bkgd') gridBkgdColor: string;
    @HostBinding('style.--color-grid-base-alt-bkgd') gridAltBkgdColor: string;
    @HostBinding('style.border-color') borderColor: string;
    @HostBinding('style.--item-hover-background-color') itemHoverBackgroundColor: string;

    readonly focusEmitter = output<ExtensionInfo>();
    readonly infoListTransitionStartEmitter = output<ExtensionInfo>();
    readonly infoListTransitionFinishEmitter = output<ExtensionInfo>();

    public headingCaption = Strings[StringId.Extensions_InstalledExtensionsHeadingCaption];

    private readonly _settingsService: SettingsService;
    private readonly _extensionsAccessService: ExtensionsAccessService;

    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _installedListChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private readonly _cdr: ChangeDetectorRef,
        extensionsAccessNgService: ExtensionsAccessNgService,
        settingsNgService: SettingsNgService
    ) {
        super(elRef, ++InstalledExtensionListNgComponent.typeInstanceCreateCount);

        this._extensionsAccessService = extensionsAccessNgService.service;
        this._settingsService = settingsNgService.service;
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(
            () => this.applySettings()
        );

        this._installedListChangedSubscriptionId = this._extensionsAccessService.subscribeInstalledListChangedEvent(
            (listChangeTypeId, idx, info, listTransitioning) =>
                this.handleInstalledListChangedEvent(
                    listChangeTypeId,
                    idx,
                    info,
                    listTransitioning
                )
        );

        this.applySettings();
    }

    public get installedExtensions() {
        return this._extensionsAccessService.installedArray;
    }

    ngOnDestroy() {
        this._extensionsAccessService.unsubscribeInstalledListChangedEvent(
            this._installedListChangedSubscriptionId
        );
        this._settingsService.unsubscribeSettingsChangedEvent(
            this._settingsChangedSubscriptionId
        );
    }

    public handleInstallSignal(info: ExtensionInfo) {
        this._extensionsAccessService.installExtension(info, true);
    }

    public handleFocus(info: ExtensionInfo) {
        this.focusEmitter.emit(info);
    }

    private handleInstalledListChangedEvent(
        listChangeTypeId: ExtensionsAccessService.ListChangeTypeId,
        idx: Integer,
        info: ExtensionInfo,
        listTransitioning: boolean
    ) {
        if (listTransitioning) {
            switch (listChangeTypeId) {
                case ExtensionsAccessService.ListChangeTypeId.Insert:
                    this.infoListTransitionFinishEmitter.emit(info);
                    break;
                case ExtensionsAccessService.ListChangeTypeId.Remove:
                    this.infoListTransitionStartEmitter.emit(info);
                    break;
            }
        }
        this._cdr.markForCheck(); // probably will not work
    }

    private applySettings() {
        this.gridBkgdColor = this._settingsService.color.getBkgd(ColorScheme.ItemId.Grid_Base);
        this.gridAltBkgdColor = this._settingsService.color.getBkgd(ColorScheme.ItemId.Grid_BaseAlt);

        this.borderColor = this._settingsService.color.getFore(
            ColorScheme.ItemId.Panel_Divider
        );
        this.itemHoverBackgroundColor = this._settingsService.color.getBkgd(
            ColorScheme.ItemId.Panel_ItemHover
        );
    }
}
