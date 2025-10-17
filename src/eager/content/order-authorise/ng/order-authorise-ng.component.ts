import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DelayedBadnessGridSourceNgDirective } from '../../delayed-badness-grid-source/ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { OrderAuthoriseFrame } from '../order-authorise-frame';
import { DelayedBadnessNgComponent } from '../../delayed-badness/ng/delayed-badness-ng.component';

@Component({
    selector: 'app-order-authorise',
    templateUrl: './order-authorise-ng.component.html',
    styleUrls: ['./order-authorise-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DelayedBadnessNgComponent]
})
export class OrderAuthoriseNgComponent extends DelayedBadnessGridSourceNgDirective {
    private static typeInstanceCreateCount = 0;

    declare frame: OrderAuthoriseFrame;

    constructor() {
        const contentNgService = inject(ContentNgService);

        const frame = contentNgService.createOrderAuthoriseFrame();
        super(++OrderAuthoriseNgComponent.typeInstanceCreateCount, frame);
        frame.setComponentAccess(this);
    }
}
