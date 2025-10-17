import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DelayedBadnessGridSourceNgDirective } from '../../delayed-badness-grid-source/ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { BrokerageAccountsFrame } from '../brokerage-accounts-frame';
import { DelayedBadnessNgComponent } from '../../delayed-badness/ng/delayed-badness-ng.component';

@Component({
    selector: 'app-brokerage-accounts',
    templateUrl: './brokerage-accounts-ng.component.html',
    styleUrls: ['./brokerage-accounts-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DelayedBadnessNgComponent]
})
export class BrokerageAccountsNgComponent extends DelayedBadnessGridSourceNgDirective {
    private static typeInstanceCreateCount = 0;

    declare frame: BrokerageAccountsFrame;

    constructor() {
        const contentNgService = inject(ContentNgService);

        const frame = contentNgService.createBrokerageAccountsFrame();
        super(++BrokerageAccountsNgComponent.typeInstanceCreateCount, frame);
        frame.setComponentAccess(this);
    }
}
