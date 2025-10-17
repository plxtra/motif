import { AfterViewInit, ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { NgSelectOverlayNgComponent } from '../../ng-select-overlay/ng-api';
import { OverlayComponentBaseNgDirective } from '../../ng/overlay-component-base-ng.directive';
import { NgSelectOverlayNgComponent as NgSelectOverlayNgComponent_1 } from '../../ng-select-overlay/ng/ng-select-overlay-ng.component';
import { MenuBarOverlayNgComponent } from '../../../controls/menu-bar/menu-bar-overlay/ng/menu-bar-overlay-ng.component';

@Component({
    selector: 'app-overlay-origin',
    templateUrl: './overlay-origin-ng.component.html',
    styleUrls: ['./overlay-origin-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgSelectOverlayNgComponent_1, MenuBarOverlayNgComponent]
})
export class OverlayOriginNgComponent extends OverlayComponentBaseNgDirective implements AfterViewInit {
    private static typeInstanceCreateCount = 0;

    private readonly _ngSelectOverlayComponentSignal = viewChild.required<NgSelectOverlayNgComponent>('ngSelectOverlay');

    private _ngSelectOverlayComponent: NgSelectOverlayNgComponent;

    constructor() {
        super(++OverlayOriginNgComponent.typeInstanceCreateCount);
    }

    ngAfterViewInit(): void {
        this._ngSelectOverlayComponent = this._ngSelectOverlayComponentSignal();
    }

    updateMeasure(fontFamily: string, fontSize: string) {
        this._ngSelectOverlayComponent.updateMeasure(fontFamily, fontSize);
    }
}
