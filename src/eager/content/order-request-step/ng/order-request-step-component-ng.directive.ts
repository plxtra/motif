import { ChangeDetectorRef, Directive, inject } from '@angular/core';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { OrderRequestStepFrame } from '../order-request-step-frame';

@Directive()
export abstract class OrderRequestStepComponentNgDirective extends ContentComponentBaseNgDirective {
    private readonly _cdr = inject(ChangeDetectorRef);

    abstract get frame(): OrderRequestStepFrame;

    protected markForCheck() {
        this._cdr.markForCheck();
    }
}
