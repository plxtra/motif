import {
    AfterViewInit,
    ChangeDetectorRef,
    Directive,
    ElementRef,
    OnDestroy,
    viewChild
} from '@angular/core';
import { Integer } from '@pbkware/js-utils';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { GridSourceFrame } from '../grid-source-frame';

@Directive()
export abstract class GridSourceNgDirective extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit, GridSourceFrame.ComponentAccess {
    private readonly _gridHostSignal = viewChild.required<ElementRef<HTMLElement>>('gridHost', { debugName: 'gridHost' });

    constructor(
        elRef: ElementRef<HTMLElement>,
        typeInstanceCreateId: Integer,
        protected readonly _cdr: ChangeDetectorRef,
        readonly frame: GridSourceFrame,
    ) {
        super(elRef, typeInstanceCreateId);
    }

    get gridHost(): HTMLElement { return this._gridHostSignal().nativeElement; }
    get gridRowHeight() { return this.frame.gridRowHeight; }
    get emWidth() { return this.frame.emWidth; }

    // Component Access members

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit() {
        this.processAfterViewInit();
    }

    getHeaderPlusFixedLineHeight() {
        return this.frame.calculateHeaderPlusFixedRowsHeight();
    }

    protected finalise() {
        this.frame.finalise();
    }

    protected processAfterViewInit(): void {
        // This method can be overridden by subclasses to perform additional setup after the view has been initialized.
    }
}

export namespace GridSourceNgDirective {
    export namespace JsonName {
        export const frame = 'frame';
    }
}
