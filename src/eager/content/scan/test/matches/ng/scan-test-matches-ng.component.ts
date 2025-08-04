import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LockOpenListItem } from '@pbkware/js-utils';
import { CoreInjectionTokens } from 'component-services-ng-api';
import { DelayedBadnessGridSourceNgDirective } from '../../../../delayed-badness-grid-source/ng-api';
import { ContentNgService } from '../../../../ng/content-ng.service';
import { ScanTestMatchesFrame } from '../scan-test-matches-frame';

@Component({
    selector: 'app-scan-test-matches',
    templateUrl: './scan-test-matches-ng.component.html',
    styleUrls: ['./scan-test-matches-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ScanTestMatchesNgComponent extends DelayedBadnessGridSourceNgDirective {
    private static typeInstanceCreateCount = 0;

    readonly declare frame: ScanTestMatchesFrame;

    private readonly _opener = inject<LockOpenListItem.Opener>(CoreInjectionTokens.lockOpenListItemOpener);

    constructor() {
        const contentNgService = inject(ContentNgService);

        const frame = contentNgService.createScanTestMatchesFrame();
        super(++ScanTestMatchesNgComponent.typeInstanceCreateCount, frame);
        frame.setComponentAccess(this);
    }

    initialise() {
        this.frame.initialise(this._opener, undefined, false);
    }
}
