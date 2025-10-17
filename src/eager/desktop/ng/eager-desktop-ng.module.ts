import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EagerControlsNgModule } from 'controls-ng-api';
import { DesktopBannerNgComponent } from '../desktop-banner/ng-api';
import { DesktopNgComponent } from '../desktop/ng-api';
import { GoldenLayoutHostNgComponent } from '../golden-layout-host/ng-api';
import { LayoutNgComponent } from '../layout/ng-api';
import { StaticInitialise } from '../static-initialise';

@NgModule({
    imports: [
        CommonModule,
        EagerControlsNgModule,
        DesktopNgComponent,
        DesktopBannerNgComponent,
        LayoutNgComponent,
        GoldenLayoutHostNgComponent,
    ],
    exports: [
        DesktopNgComponent,
    ],
})

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class EagerDesktopNgModule {
    constructor() {
        StaticInitialise.initialise();
    }
}
