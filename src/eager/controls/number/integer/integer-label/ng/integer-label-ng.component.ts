import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ControlComponentBaseNgDirective } from '../../../../ng/control-component-base-ng.directive';
import { IntegerUiActionComponentBaseNgDirective } from '../../ng/integer-ui-action-component-base-ng.directive';
import { NgStyle } from '@angular/common';

@Component({
    selector: 'app-integer-label',
    templateUrl: './integer-label-ng.component.html',
    styleUrls: ['./integer-label-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgStyle]
})
export class IntegerLabelNgComponent extends IntegerUiActionComponentBaseNgDirective {
    private static typeInstanceCreateCount = 0;

    readonly for = input<string>();

    constructor() {
        super(
            ++IntegerLabelNgComponent.typeInstanceCreateCount,
            ControlComponentBaseNgDirective.labelStateColorItemIdArray
        );
    }

    protected override applyValue(_value: number | undefined, _edited: boolean) {
        // not relevant
    }

    protected override testInputValue(_text?: string): boolean {
        // not relevant
        return true;
    }
}
