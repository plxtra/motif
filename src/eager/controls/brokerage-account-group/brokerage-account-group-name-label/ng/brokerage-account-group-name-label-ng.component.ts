import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, input } from '@angular/core';
import { AdiNgService, MarketsNgService, SettingsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { BrokerageAccountGroupComponentBaseNgDirective } from '../../ng/brokerage-account-group-component-base-ng.directive';

@Component({
    selector: 'app-brokerage-account-group-name-label',
    templateUrl: './brokerage-account-group-name-label-ng.component.html',
    styleUrls: ['./brokerage-account-group-name-label-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class BrokerageAccountGroupNameLabelNgComponent extends BrokerageAccountGroupComponentBaseNgDirective implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    readonly for = input<string>();

    public override caption = '';

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        adiNgService: AdiNgService,
        marketsNgService: MarketsNgService,
    ) {
        super(
            elRef,
            ++BrokerageAccountGroupNameLabelNgComponent.typeInstanceCreateCount,
            cdr,
            settingsNgService.service,
            adiNgService.service,
            marketsNgService.service,
            ControlComponentBaseNgDirective.labelStateColorItemIdArray
        );
    }

    override ngOnDestroy() {
        this.finalise();
    }

    protected override applyValueAsNamedGroup(
        value: BrokerageAccountGroupComponentBaseNgDirective.NamedGroup | undefined,
        _edited: boolean
    ) {
        if (value === undefined) {
            this.caption = '';
        } else {
            this.caption = value.name;
        }

        this.markForCheck();
    }
}
