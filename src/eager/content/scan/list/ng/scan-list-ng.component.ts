import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DelayedBadnessGridSourceNgDirective } from '../../../delayed-badness-grid-source/ng-api';
import { ContentNgService } from '../../../ng/content-ng.service';
import { ScanListFrame } from '../scan-list-frame';
import { DelayedBadnessNgComponent } from '../../../delayed-badness/ng/delayed-badness-ng.component';

@Component({
    selector: 'app-scan-list',
    templateUrl: './scan-list-ng.component.html',
    styleUrls: ['./scan-list-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DelayedBadnessNgComponent]
})
export class ScanListNgComponent extends DelayedBadnessGridSourceNgDirective {
    private static typeInstanceCreateCount = 0;

    declare frame: ScanListFrame;

    constructor() {
        const contentNgService = inject(ContentNgService);

        const frame = contentNgService.createScanListFrame();
        super(++ScanListNgComponent.typeInstanceCreateCount, frame);
        frame.setComponentAccess(this);
    }
}
