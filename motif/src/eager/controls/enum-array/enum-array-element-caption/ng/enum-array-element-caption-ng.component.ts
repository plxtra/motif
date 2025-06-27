import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, input } from '@angular/core';
import { Integer } from '@pbkware/js-utils';
import { SettingsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { ListItemSelectItemsUiActionNgDirective } from '../../ng/list-item-select-items-ui-action-ng.directive';

@Component({
    selector: 'app-enum-array-element-caption',
    templateUrl: './enum-array-element-caption-ng.component.html',
    styleUrls: ['./enum-array-element-caption-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class EnumArrayElementCaptionNgComponent extends ListItemSelectItemsUiActionNgDirective<Integer> implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    readonly for = input<string>();

    constructor(elRef: ElementRef<HTMLElement>, cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(
            elRef,
            ++EnumArrayElementCaptionNgComponent.typeInstanceCreateCount,
            cdr,
            settingsNgService.service,
            ControlComponentBaseNgDirective.labelStateColorItemIdArray,
            Number.MIN_SAFE_INTEGER,
        );
    }

    override ngOnDestroy() {
        this.finalise();
    }
}
