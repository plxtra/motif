import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    effect,
    ElementRef,
    HostBinding,
    HostListener,
    input,
    OnDestroy,
    output,
    untracked
} from '@angular/core';
import { AssertInternalError, MultiEvent } from '@pbkware/js-utils';
import {
    ColorScheme, ExtensionInfo,
    PublisherId,
    RegisteredExtension,
    SettingsService,
    StringId,
    Strings
} from '@plxtra/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-extension-list-info-item',
    templateUrl: './extension-list-info-item-ng.component.html',
    styleUrls: ['./extension-list-info-item-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ExtensionListInfoItemNgComponent extends ContentComponentBaseNgDirective implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    @HostBinding('style.color') color = '';

    readonly info = input.required<ExtensionInfo>();
    readonly installSignalEmitter = output<ExtensionInfo>();
    readonly focusEmitter = output<ExtensionInfo>();

    public isInstallable = false;

    private readonly _settingsService: SettingsService;

    private _info: ExtensionInfo;
    private _installedExtension: RegisteredExtension | undefined;

    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _installedExtensionLoadedChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private readonly _cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService
    ) {
        super(elRef, ++ExtensionListInfoItemNgComponent.typeInstanceCreateCount);

        this._settingsService = settingsNgService.service;
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(
            () => this.applySettings()
        );

        this.applySettings();

        effect(() => {
            const info = this.info();
            untracked(() => {
                if (info !== this._info) {
                    this.setInfo(info);
                }
            });
        });
    }

    public get abbreviatedPublisherTypeDisplay() {
        return PublisherId.Type.idToAbbreviatedDisplay(this._info.publisherId.typeId);
    }
    public get publisherName() {
        return this._info.publisherId.name;
    }
    public get name() {
        return this._info.name;
    }
    public get version() {
        return this._info.version;
    }
    public get description() {
        return this._info.shortDescription;
    }
    public get installCaption() {
        return Strings[StringId.Extensions_ExtensionInstallCaption];
    }

    @HostListener('click', []) handleHostClick() {
        this.focusEmitter.emit(this._info);
    }

    ngOnDestroy() {
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
        this.checkClearInstalledExtension();
    }

    public handleInstallClick() {
        this.installSignalEmitter.emit(this._info);
    }

    private handleInstalledExtensionLoadedChangedEvent() {
        if (this._installedExtension === undefined) {
            throw new AssertInternalError('ELIICHIELCE2228343');
        } else {
            this.updateEnabledDisabled(this._installedExtension.loaded);
            this._cdr.markForCheck();
        }
    }

    private setInfo(value: ExtensionInfo) {
        this._info = value;
        if (RegisteredExtension.isRegisteredExtension(value)) {
            this.setInstalledExtension(value);
            this.isInstallable = false;
        } else {
            this.checkClearInstalledExtension();
            this.isInstallable = true;
        }
        this._cdr.markForCheck();
    }

    private setInstalledExtension(value: RegisteredExtension) {
        this.checkClearInstalledExtension();

        this._installedExtension = value;
        this.updateEnabledDisabled(this._installedExtension.loaded);

        this._installedExtensionLoadedChangedSubscriptionId = this._installedExtension.subscribeLoadedChangedEvent(
            () => this.handleInstalledExtensionLoadedChangedEvent()
        );
    }

    private checkClearInstalledExtension() {
        if (this._installedExtension !== undefined) {
            this.clearInstalledExtension();
        }
    }

    private clearInstalledExtension() {
        if (this._installedExtension === undefined) {
            throw new AssertInternalError('EDCCIE566583333');
        } else {
            this._installedExtension.unsubscribeLoadedChangedEvent(this._installedExtensionLoadedChangedSubscriptionId);
            this._installedExtensionLoadedChangedSubscriptionId = undefined;
        }
    }

    private updateEnabledDisabled(loaded: boolean) {
        this.color = loaded ? '' : this._settingsService.color.getFore(ColorScheme.ItemId.Text_GreyedOut);
    }

    private applySettings() {
        if (this._installedExtension !== undefined) {
            this.updateEnabledDisabled(this._installedExtension.loaded);
        }
        this._cdr.markForCheck();
    }
}
