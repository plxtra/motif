import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy } from '@angular/core';
import { Exchange } from '@plxtra/motif-core';
import { MarketsNgService, SettingsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { CaptionedRadioNgDirective } from '../../ng/ng-api';

@Component({
    selector: 'app-exchange-captioned-radio',
    templateUrl: './exchange-captioned-radio-ng.component.html',
    styleUrls: ['./exchange-captioned-radio-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ExchangeCaptionedRadioNgComponent extends CaptionedRadioNgDirective<Exchange> implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        marketsNgService: MarketsNgService,
    ) {
        super(
            elRef,
            ++ExchangeCaptionedRadioNgComponent.typeInstanceCreateCount,
            cdr,
            settingsNgService.service,
            ControlComponentBaseNgDirective.clickControlStateColorItemIdArray,
            marketsNgService.service.genericUnknownExchange,
        );
        this.inputId.set('ExchangeCaptionedRadio' + this.typeInstanceId);
    }
}
