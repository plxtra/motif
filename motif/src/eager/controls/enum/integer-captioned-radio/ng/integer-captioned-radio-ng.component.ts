import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy } from '@angular/core';
import { Integer } from '@pbkware/js-utils';
import { SelectItemUiAction } from '@pbkware/ui-action';
import { SettingsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { CaptionedRadioNgDirective } from '../../ng/ng-api';

@Component({
    selector: 'app-integer-captioned-radio',
    templateUrl: './integer-captioned-radio-ng.component.html',
    styleUrls: ['./integer-captioned-radio-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class IntegerCaptionedRadioNgComponent extends CaptionedRadioNgDirective<Integer> implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
    ) {
        super(
            elRef,
            ++IntegerCaptionedRadioNgComponent.typeInstanceCreateCount,
            cdr,
            settingsNgService.service,
            ControlComponentBaseNgDirective.clickControlStateColorItemIdArray,
            SelectItemUiAction.integerUndefinedValue,
        );
        this.inputId.set('IntegerCaptionedRadio' + this.typeInstanceId);
    }
}
