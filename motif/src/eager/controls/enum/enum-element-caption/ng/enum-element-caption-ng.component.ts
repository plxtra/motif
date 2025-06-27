import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, input } from '@angular/core';
import { Integer } from '@pbkware/js-utils';
import { SettingsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { IntegerEnumElementComponentBaseNgDirective } from '../../ng/ng-api';

@Component({
    selector: 'app-enum-element-caption',
    templateUrl: './enum-element-caption-ng.component.html',
    styleUrls: ['./enum-element-caption-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class EnumElementCaptionNgComponent extends IntegerEnumElementComponentBaseNgDirective implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    readonly for = input<string>();

    constructor(elRef: ElementRef<HTMLElement>, cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(
            elRef,
            ++EnumElementCaptionNgComponent.typeInstanceCreateCount,
            cdr,
            settingsNgService.service,
            ControlComponentBaseNgDirective.labelStateColorItemIdArray
        );
    }

    override ngOnDestroy() {
        this.finalise();
    }

    protected override applyValue(_value: Integer | undefined, _edited: boolean) {
        this.markForCheck();
    }
}
