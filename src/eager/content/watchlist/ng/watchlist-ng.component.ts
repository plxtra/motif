import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { numberToPixels } from '@pbkware/js-utils';
import { DelayedBadnessGridSourceNgDirective } from '../../delayed-badness-grid-source/ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { WatchlistFrame } from '../watchlist-frame';

@Component({
    selector: 'app-watchlist',
    templateUrl: './watchlist-ng.component.html',
    styleUrls: ['./watchlist-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class WatchlistNgComponent extends DelayedBadnessGridSourceNgDirective {
    private static typeInstanceCreateCount = 0;

    declare frame: WatchlistNgComponent.Frame;

    public gridHostFlexBasis = '';

    constructor() {
        const contentNgService = inject(ContentNgService);

        const frame = contentNgService.createWatchlistFrame();
        super(++WatchlistNgComponent.typeInstanceCreateCount, frame);
        frame.setComponentAccess(this);

        frame.setGridHostFlexBasisEventer = (value) => {
            const newFlexBasis = numberToPixels(value);
            if (newFlexBasis !== this.gridHostFlexBasis) {
                this.gridHostFlexBasis = newFlexBasis;
                this._cdr.markForCheck();
            }
        }
    }
}

export namespace WatchlistNgComponent {
    export type Frame = WatchlistFrame;
}
