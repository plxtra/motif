import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DelayedBadnessGridSourceNgDirective } from '../../delayed-badness-grid-source/ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { OrdersFrame } from '../orders-frame';

@Component({
    selector: 'app-orders',
    templateUrl: './orders-ng.component.html',
    styleUrls: ['./orders-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class OrdersNgComponent extends DelayedBadnessGridSourceNgDirective {
    private static typeInstanceCreateCount = 0;

    declare frame: OrdersFrame;

    constructor() {
        const contentNgService = inject(ContentNgService);

        const frame = contentNgService.createOrdersFrame();
        super(++OrdersNgComponent.typeInstanceCreateCount, frame);
        frame.setComponentAccess(this);
    }
}
