import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, viewChild } from '@angular/core';
import { Badness } from '@plxtra/motif-core';
import { DelayedBadnessNgComponent } from '../../delayed-badness/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { ContentNgService } from '../../ng/content-ng.service';
import { TradesFrame } from '../trades-frame';

@Component({
    selector: 'app-trades',
    templateUrl: './trades-ng.component.html',
    styleUrls: ['./trades-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class TradesNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit, TradesFrame.ComponentAccess {
    private static typeInstanceCreateCount = 0;

    private readonly _gridHostSignal = viewChild.required<ElementRef<HTMLElement>>('gridHost');
    private readonly _delayedBadnessComponentSignal = viewChild.required<DelayedBadnessNgComponent>('delayedBadness');

    private readonly _frame: TradesFrame;

    private _delayedBadnessComponent: DelayedBadnessNgComponent;

    constructor(elRef: ElementRef<HTMLElement>, contentService: ContentNgService) {
        super(elRef, ++TradesNgComponent.typeInstanceCreateCount);

        this._frame = contentService.createTradesFrame(this);
    }

    get frame(): TradesFrame { return this._frame; }
    get id(): string { return this.typeInstanceId; }
    get gridHost(): HTMLElement { return this._gridHostSignal().nativeElement; }

    ngOnDestroy() {
        // this._onAutoAdjustColumnWidths = undefined;
        this.frame.finalise();
    }

    ngAfterViewInit(): void {
        this._delayedBadnessComponent = this._delayedBadnessComponentSignal();
    }

    public setBadness(value: Badness) {
        this._delayedBadnessComponent.setBadness(value);
    }

    public hideBadnessWithVisibleDelay(badness: Badness) {
        this._delayedBadnessComponent.hideWithVisibleDelay(badness);
    }
}

export namespace TradesNgComponent {
    export namespace JsonName {
        export const frame = 'frame';
    }
}
