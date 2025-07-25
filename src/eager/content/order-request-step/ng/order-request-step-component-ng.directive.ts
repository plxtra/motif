import { ChangeDetectorRef, Directive, ElementRef } from '@angular/core';
import { Integer } from '@pbkware/js-utils';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { OrderRequestStepFrame } from '../order-request-step-frame';

@Directive()
export abstract class OrderRequestStepComponentNgDirective extends ContentComponentBaseNgDirective {
    constructor(elRef: ElementRef<HTMLElement>, typeInstanceCreateId: Integer, private _cdr: ChangeDetectorRef) {
        super(elRef, typeInstanceCreateId);
    }

    abstract get frame(): OrderRequestStepFrame;

    protected markForCheck() {
        this._cdr.markForCheck();
    }
}
