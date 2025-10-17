import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContentComponentBaseNgDirective } from 'content-ng-api';
import { AdvertTickerNgComponent } from '../../../content/advert/advert-ticker/ng/advert-ticker-ng.component';
import { BannerAdvertNgComponent } from '../../../content/advert/banner-advert/ng/banner-advert-ng.component';

@Component({
    selector: 'app-bottom-advert-strip',
    templateUrl: './bottom-advert-strip-ng.component.html',
    styleUrls: ['./bottom-advert-strip-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AdvertTickerNgComponent, BannerAdvertNgComponent]
})
export class BottomAdvertStripNgComponent extends ContentComponentBaseNgDirective {
    private static typeInstanceCreateCount = 0;

    constructor() {
        super(++BottomAdvertStripNgComponent.typeInstanceCreateCount);
    }
    // private readonly _advertTickerComponentSignal = viewChild.required<AdvertTickerNgComponent>('advertTicker');
    // private readonly _bannerAdvertComponentSignal = viewChild.required<BannerAdvertNgComponent>('bannerAdvert');

    // private _advertTickerComponent: AdvertTickerNgComponent;
    // private _bannerAdvertComponent: BannerAdvertNgComponent;
}
