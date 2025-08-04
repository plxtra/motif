import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-advert-web-page',
    templateUrl: './advert-web-page-ng.component.html',
    styleUrls: ['./advert-web-page-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class AdvertWebPageNgComponent {
    private readonly _cdr = inject(ChangeDetectorRef);

    public safeResourceUrl: SafeResourceUrl;

    loadPage(safeResourceUrl: SafeResourceUrl) {
        this.safeResourceUrl = safeResourceUrl;
        this._cdr.markForCheck();
    }
}
