import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Integer } from '@pbkware/js-utils';
import { SelectItemUiAction } from '@pbkware/ui-action';
import { EnumCaptionNgComponent } from '../../ng/ng-api';
import { NgStyle } from '@angular/common';

@Component({
    selector: 'app-integer-enum-caption',
    templateUrl: './integer-enum-caption-ng.component.html',
    styleUrls: ['./integer-enum-caption-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgStyle]
})
export class IntegerEnumCaptionNgComponent extends EnumCaptionNgComponent<Integer> implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    constructor() {
        super(
            ++IntegerEnumCaptionNgComponent.typeInstanceCreateCount,
            SelectItemUiAction.integerUndefinedValue,
        );
    }
}
