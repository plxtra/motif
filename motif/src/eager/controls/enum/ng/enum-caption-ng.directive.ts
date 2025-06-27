import { ChangeDetectorRef, Directive, ElementRef, OnDestroy, input } from '@angular/core';
import { Integer } from '@pbkware/js-utils';
import { SettingsService } from '@plxtra/motif-core';
import { ControlComponentBaseNgDirective } from '../../ng/control-component-base-ng.directive';
import { SelectItemUiActionNgDirective } from './select-item-ui-action-ng.directive';

@Directive()
export class EnumCaptionNgComponent<T> extends SelectItemUiActionNgDirective<T> implements OnDestroy {
    readonly for = input<string>();

    constructor(elRef: ElementRef<HTMLElement>, typeInstanceCreateId: Integer, cdr: ChangeDetectorRef, settingsService: SettingsService, undefinedValue: T,) {
        super(
            elRef,
            typeInstanceCreateId,
            cdr,
            settingsService,
            ControlComponentBaseNgDirective.labelStateColorItemIdArray,
            undefinedValue,
        );
    }

    override ngOnDestroy() {
        this.finalise();
    }

    protected override applyValue(_value: T | undefined, _edited: boolean) {
        this.markForCheck();
    }
}
