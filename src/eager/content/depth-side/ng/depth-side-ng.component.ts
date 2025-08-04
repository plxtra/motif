import { ChangeDetectionStrategy, Component, OnDestroy, inject } from '@angular/core';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { ContentNgService } from '../../ng/content-ng.service';
import { DepthSideFrame } from '../depth-side-frame';

@Component({
    selector: 'app-depth-side',
    templateUrl: './depth-side-ng.component.html',
    styleUrls: ['./depth-side-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DepthSideNgComponent extends ContentComponentBaseNgDirective implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    private _contentService = inject(ContentNgService);

    private readonly _frame: DepthSideFrame;

    constructor() {
        super(++DepthSideNgComponent.typeInstanceCreateCount);

        this._frame = this._contentService.createDepthSideFrame(this.elRef.nativeElement);
    }

    get frame(): DepthSideFrame { return this._frame; }

    ngOnDestroy() {
        this._frame.finalise();
    }
}
