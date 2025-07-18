import { ChangeDetectionStrategy, Component, ElementRef } from '@angular/core';
import { ContentComponentBaseNgDirective } from 'content-ng-api';

@Component({
    selector: 'app-bottom-advert-strip',
    templateUrl: './bottom-advert-strip-ng.component.html',
    styleUrls: ['./bottom-advert-strip-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class BottomAdvertStripNgComponent extends ContentComponentBaseNgDirective {
    private static typeInstanceCreateCount = 0;

    constructor(elRef: ElementRef<HTMLElement>) {
        super(elRef, ++BottomAdvertStripNgComponent.typeInstanceCreateCount);
    }
    // private readonly _advertTickerComponentSignal = viewChild.required<AdvertTickerNgComponent>('advertTicker');
    // private readonly _bannerAdvertComponentSignal = viewChild.required<BannerAdvertNgComponent>('bannerAdvert');

    // private _advertTickerComponent: AdvertTickerNgComponent;
    // private _bannerAdvertComponent: BannerAdvertNgComponent;
}
