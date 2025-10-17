import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DelayedBadnessGridSourceNgDirective } from '../../delayed-badness-grid-source/ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { BalancesFrame } from '../balances-frame';
import { DelayedBadnessNgComponent } from '../../delayed-badness/ng/delayed-badness-ng.component';

@Component({
    selector: 'app-balances',
    templateUrl: './balances-ng.component.html',
    styleUrls: ['./balances-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DelayedBadnessNgComponent]
})
export class BalancesNgComponent extends DelayedBadnessGridSourceNgDirective {
    private static typeInstanceCreateCount = 0;

    declare frame: BalancesNgComponent.Frame;

    constructor() {
        const contentNgService = inject(ContentNgService);

        const frame: BalancesNgComponent.Frame = contentNgService.createBalancesFrame();
        super(++BalancesNgComponent.typeInstanceCreateCount, frame);
        frame.setComponentAccess(this);
    }
}

export namespace BalancesNgComponent {
    export type Frame = BalancesFrame;
}
