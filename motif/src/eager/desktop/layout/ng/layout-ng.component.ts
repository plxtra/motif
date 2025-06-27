import { ChangeDetectionStrategy, Component, ElementRef } from '@angular/core';
import { ComponentBaseNgDirective } from 'component-ng-api';

@Component({
    selector: 'app-layout',
    templateUrl: './layout-ng.component.html',
    styleUrls: ['./layout-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class LayoutNgComponent extends ComponentBaseNgDirective  {
    private static typeInstanceCreateCount = 0;


    constructor(elRef: ElementRef<HTMLElement>) {
        super(elRef, ++LayoutNgComponent.typeInstanceCreateCount);
    }

    loadButtonClick(): void {
        // this.desktopService.loadLayout();
    }

    saveButtonClick(): void {
        // this.desktopService.saveLayout();
    }

    resetButtonClick(): void {
        // this.desktopService.resetLayout();
    }

}
