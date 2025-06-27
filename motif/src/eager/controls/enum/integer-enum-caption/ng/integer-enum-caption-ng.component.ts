import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy } from '@angular/core';
import { Integer } from '@pbkware/js-utils';
import { SelectItemUiAction } from '@pbkware/ui-action';
import { SettingsNgService } from 'component-services-ng-api';
import { EnumCaptionNgComponent } from '../../ng/ng-api';

@Component({
    selector: 'app-integer-enum-caption',
    templateUrl: './integer-enum-caption-ng.component.html',
    styleUrls: ['./integer-enum-caption-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class IntegerEnumCaptionNgComponent extends EnumCaptionNgComponent<Integer> implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    constructor(elRef: ElementRef<HTMLElement>, cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(
            elRef,
            ++IntegerEnumCaptionNgComponent.typeInstanceCreateCount,
            cdr,
            settingsNgService.service,
            SelectItemUiAction.integerUndefinedValue,
        );
    }
}
