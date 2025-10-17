import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EagerControlsNgModule } from 'controls-ng-api';
import { NgSelectOverlayNgComponent } from '../ng-select-overlay/ng-api';
import { OverlayOriginNgComponent } from '../overlay-origin/ng-api';

@NgModule({
    imports: [
        CommonModule,
        EagerControlsNgModule,
        NgSelectOverlayNgComponent,
        OverlayOriginNgComponent,
    ],
    exports: [
        OverlayOriginNgComponent,
    ],
})

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class EagerOverlayNgModule {
}
