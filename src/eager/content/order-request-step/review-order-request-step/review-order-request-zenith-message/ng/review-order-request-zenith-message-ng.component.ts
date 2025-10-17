import { ChangeDetectionStrategy, Component, OnDestroy, inject, input } from '@angular/core';
import { MultiEvent } from '@pbkware/js-utils';
import { ColorScheme, ColorSettings, SettingsService } from '@plxtra/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { ContentComponentBaseNgDirective } from '../../../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-review-order-zenith-message-definition',
    templateUrl: './review-order-request-zenith-message-ng.component.html',
    styleUrls: ['./review-order-request-zenith-message-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewOrderRequestZenithMessageNgComponent extends ContentComponentBaseNgDirective implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    readonly zenithMessageTitle = input('');
    readonly zenithMessageText = input('');

    public bkgdColor: string;
    public foreColor: string;

    private readonly _settingsService: SettingsService;
    private readonly _colorSettings: ColorSettings;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor() {
        const settingsNgService = inject(SettingsNgService);

        super(++ReviewOrderRequestZenithMessageNgComponent.typeInstanceCreateCount);

        this._settingsService = settingsNgService.service;
        this._colorSettings = this._settingsService.color;

        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.updateColors());
        this.updateColors();
    }

    ngOnDestroy() {
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
    }

    private updateColors() {
        this.bkgdColor = this._colorSettings.getBkgd(ColorScheme.ItemId.Text_ReadonlyMultiline);
        this.foreColor = this._colorSettings.getFore(ColorScheme.ItemId.Text_ReadonlyMultiline);
    }
}
