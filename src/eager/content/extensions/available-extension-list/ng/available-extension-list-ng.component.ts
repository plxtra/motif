import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, OnDestroy, ViewEncapsulation, inject, output } from '@angular/core';
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
    selector: 'app-available-extension-list',
    templateUrl: './available-extension-list-ng.component.html',
    styleUrls: ['./available-extension-list-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class AvailableExtensionListNgComponent extends ContentComponentBaseNgDirective implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    @HostBinding('style.--color-grid-base-bkgd') gridBkgdColor: string;
    @HostBinding('style.--color-grid-base-alt-bkgd') gridAltBkgdColor: string;
    @HostBinding('style.border-color') borderColor: string;
    @HostBinding('style.--item-hover-background-color') itemHoverBackgroundColor: string;

    readonly focusEmitter = output<ExtensionInfo>();
    readonly infoListTransitionStartEmitter = output<ExtensionInfo>();
    readonly infoListTransitionFinishEmitter = output<ExtensionInfo>();

    public headingCaption = Strings[StringId.Extensions_AvailableExtensionsHeadingCaption];

    private readonly _cdr = inject(ChangeDetectorRef);

    private readonly _settingsService: SettingsService;
    private readonly _extensionsAccessService: ExtensionsAccessService;

    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _uninstalledBundledListChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor() {
        const extensionsAccessNgService = inject(ExtensionsAccessNgService);
        const settingsNgService = inject(SettingsNgService);

        super(++AvailableExtensionListNgComponent.typeInstanceCreateCount);

        this._extensionsAccessService = extensionsAccessNgService.service;
        this._settingsService = settingsNgService.service;
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(
            () => this.applySettings()
        );

        this._uninstalledBundledListChangedSubscriptionId = this._extensionsAccessService.subscribeUninstalledBundledListChangedEvent(
            (listChangeTypeId, idx, info, listTransitioning) =>
                this.handleUninstalledBundledListChangedEvent(
                    listChangeTypeId,
                    idx,
                    info,
                    listTransitioning
                )
        );

        this.applySettings();
    }

    public get infos() {
        return this._extensionsAccessService.uninstalledBundledArray;
    }

    ngOnDestroy() {
        this._extensionsAccessService.unsubscribeUninstalledBundledListChangedEvent(
            this._uninstalledBundledListChangedSubscriptionId
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

    private handleUninstalledBundledListChangedEvent(
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
