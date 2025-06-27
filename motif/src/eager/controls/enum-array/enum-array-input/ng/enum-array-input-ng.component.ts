import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewEncapsulation } from '@angular/core';
import { Integer } from '@pbkware/js-utils';
import { SettingsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { NgSelectOverlayNgService } from '../../../ng/ng-select-overlay-ng.service';
import { SelectItemsNgDirective } from '../../ng/select-items-ng.directive';

@Component({
    selector: 'app-enum-array-input',
    templateUrl: './enum-array-input-ng.component.html',
    styleUrls: ['./enum-array-input-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class EnumArrayInputNgComponent extends SelectItemsNgDirective<Integer> implements AfterViewInit {
    private static typeInstanceCreateCount = 0;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        ngSelectOverlayNgService: NgSelectOverlayNgService,
        settingsNgService: SettingsNgService
    ) {
        super(
            elRef,
            ++EnumArrayInputNgComponent.typeInstanceCreateCount,
            cdr,
            ngSelectOverlayNgService,
            settingsNgService.service,
            ControlComponentBaseNgDirective.textControlStateColorItemIdArray,
        );

        this.inputId.set(`EnumArrayInput:${this.typeInstanceId}`);
    }
}
