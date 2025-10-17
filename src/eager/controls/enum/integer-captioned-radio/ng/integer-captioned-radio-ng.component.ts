import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Integer } from '@pbkware/js-utils';
import { SelectItemUiAction } from '@pbkware/ui-action';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { CaptionedRadioNgDirective } from '../../ng/ng-api';
import { NgStyle } from '@angular/common';

@Component({
    selector: 'app-integer-captioned-radio',
    templateUrl: './integer-captioned-radio-ng.component.html',
    styleUrls: ['./integer-captioned-radio-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgStyle]
})
export class IntegerCaptionedRadioNgComponent extends CaptionedRadioNgDirective<Integer> implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    constructor() {
        super(
            ++IntegerCaptionedRadioNgComponent.typeInstanceCreateCount,
            ControlComponentBaseNgDirective.clickControlStateColorItemIdArray,
            SelectItemUiAction.integerUndefinedValue,
        );
        this.inputId.set('IntegerCaptionedRadio' + this.typeInstanceId);
    }
}
