import { ChangeDetectionStrategy, Component, ElementRef } from '@angular/core';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-extension-lists',
    templateUrl: './extension-lists-ng.component.html',
    styleUrls: ['./extension-lists-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ExtensionListsNgComponent extends ContentComponentBaseNgDirective {
    private static typeInstanceCreateCount = 0;

    constructor(elRef: ElementRef<HTMLElement>) {
        super(elRef, ++ExtensionListsNgComponent.typeInstanceCreateCount);
    }
}
