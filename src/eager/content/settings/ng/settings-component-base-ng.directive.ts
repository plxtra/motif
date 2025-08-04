import { ChangeDetectorRef, Directive, inject } from '@angular/core';
import { Integer, MultiEvent } from '@pbkware/js-utils';
import { ColorSettings, ScalarSettings, SettingsService } from '@plxtra/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Directive()
export abstract class SettingsComponentBaseNgDirective extends ContentComponentBaseNgDirective {
    private readonly _cdr = inject(ChangeDetectorRef);
    private readonly _settingsService: SettingsService;

    private _scalarSettings: ScalarSettings;
    private _colorSettings: ColorSettings;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(typeInstanceCreateId: Integer) {
        super(typeInstanceCreateId);

        const settingsNgService = inject(SettingsNgService);
        this._settingsService = settingsNgService.service;
        this._scalarSettings = this._settingsService.scalar;
        this._colorSettings = this._settingsService.color;
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.handleSettingsChangedEvent());
    }

    protected get settingsService() { return this._settingsService; }
    protected get userSettings() { return this._scalarSettings; }
    protected get colorSettings() { return this._colorSettings; }

    protected markForCheck() {
        this._cdr.markForCheck();
    }
    protected detectChanges() {
        this._cdr.detectChanges();
    }

    protected finalise() {
        if (this._settingsChangedSubscriptionId !== undefined) {
            this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
            this._settingsChangedSubscriptionId = undefined;
        }
    }

    private handleSettingsChangedEvent() {
        this.processSettingsChanged();
    }

    protected abstract processSettingsChanged(): void;
}
