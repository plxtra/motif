import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';
import { NgSelectOverlayNgComponent } from '../../ng-select-overlay/ng-api';
import { OverlayComponentBaseNgDirective } from '../../ng/overlay-component-base-ng.directive';

@Component({
    selector: 'app-overlay-origin',
    templateUrl: './overlay-origin-ng.component.html',
    styleUrls: ['./overlay-origin-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class OverlayOriginNgComponent extends OverlayComponentBaseNgDirective implements AfterViewInit {
    private static typeInstanceCreateCount = 0;

    private readonly _ngSelectOverlayComponentSignal = viewChild.required<NgSelectOverlayNgComponent>('ngSelectOverlay');

    private _ngSelectOverlayComponent: NgSelectOverlayNgComponent;

    constructor(elRef: ElementRef<HTMLElement>) {
        super(elRef, ++OverlayOriginNgComponent.typeInstanceCreateCount);
    }

    ngAfterViewInit(): void {
        this._ngSelectOverlayComponent = this._ngSelectOverlayComponentSignal();
    }

    updateMeasure(fontFamily: string, fontSize: string) {
        this._ngSelectOverlayComponent.updateMeasure(fontFamily, fontSize);
    }
}
