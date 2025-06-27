import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, Renderer2 } from '@angular/core';
import { Integer } from '@pbkware/js-utils';
import { SettingsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { ItemsCheckboxNgDirective } from '../../ng/items-checkbox-ng.directive';

@Component({
    selector: 'app-enum-array-checkbox',
    templateUrl: './enum-array-checkbox-ng.component.html',
    styleUrls: ['./enum-array-checkbox-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class EnumArrayCheckboxNgComponent extends ItemsCheckboxNgDirective<Integer> implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    constructor(elRef: ElementRef<HTMLElement>, private _renderer: Renderer2, cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(
            elRef,
            ++EnumArrayCheckboxNgComponent.typeInstanceCreateCount,
            cdr,
            settingsNgService.service,
            ControlComponentBaseNgDirective.clickControlStateColorItemIdArray,
            Number.MIN_SAFE_INTEGER,
        );
        this.inputId.set(`EnumArrayCheckbox:${this.typeInstanceId}`);
    }
}
