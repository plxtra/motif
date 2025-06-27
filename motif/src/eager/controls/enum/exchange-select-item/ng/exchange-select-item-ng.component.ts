import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewEncapsulation } from '@angular/core';
import { Integer } from '@pbkware/js-utils';
import { SelectItemUiAction } from '@pbkware/ui-action';
import { SettingsNgService } from 'component-services-ng-api';
import { NgSelectOverlayNgService } from '../../../ng/ng-select-overlay-ng.service';
import { SelectItemNgDirective } from '../../ng/ng-api';

@Component({
    selector: 'app-exchange-select-item', // should be xxx-enum-select
    templateUrl: './exchange-select-item-ng.component.html',
    styleUrls: ['./exchange-select-item-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class ExchangeSelectItemNgComponent extends SelectItemNgDirective<Integer> {
    private static typeInstanceCreateCount = 0;

    constructor(
        elRef: ElementRef<HTMLElement>,
        ngSelectOverlayNgService: NgSelectOverlayNgService,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
    ) {
        super(
            elRef,
            ++ExchangeSelectItemNgComponent.typeInstanceCreateCount,
            ngSelectOverlayNgService,
            cdr,
            settingsNgService.service,
            SelectItemUiAction.integerUndefinedValue,
        );
    }
}
