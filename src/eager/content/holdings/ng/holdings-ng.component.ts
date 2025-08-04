import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DelayedBadnessGridSourceNgDirective } from '../../delayed-badness-grid-source/ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { HoldingsFrame } from '../holdings-frame';

@Component({
    selector: 'app-holdings',
    templateUrl: './holdings-ng.component.html',
    styleUrls: ['./holdings-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class HoldingsNgComponent extends DelayedBadnessGridSourceNgDirective {
    private static typeInstanceCreateCount = 0;

    declare frame: HoldingsFrame;

    constructor() {
        const contentNgService = inject(ContentNgService);

        const frame = contentNgService.createHoldingsFrame();
        super(++HoldingsNgComponent.typeInstanceCreateCount, frame);
        frame.setComponentAccess(this);
    }
}
