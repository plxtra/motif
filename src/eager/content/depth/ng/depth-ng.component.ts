import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, viewChild } from '@angular/core';
import { Integer, numberToPixels } from '@pbkware/js-utils';
import { Badness } from '@plxtra/motif-core';
import { SplitComponent } from 'angular-split';
import { DelayedBadnessNgComponent } from '../../delayed-badness/ng-api';
import { DepthSideNgComponent } from '../../depth-side/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { ContentNgService } from '../../ng/content-ng.service';
import { DepthFrame } from '../depth-frame';

@Component({
    selector: 'app-depth',
    templateUrl: './depth-ng.component.html',
    styleUrls: ['./depth-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DepthNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit, DepthFrame.ComponentAccess {
    private static typeInstanceCreateCount = 0;

    readonly bidComponentSignal = viewChild.required<DepthSideNgComponent>('bidSide');
    readonly askComponentSignal = viewChild.required<DepthSideNgComponent>('askSide');

    public bidActiveWidth = '120px';
    public bidWidthPercent = 50;
    public askActiveWidth = '120px';
    public askWidthPercent = 50;
    public splitterGutterSize = 3;

    private readonly _cdr = inject(ChangeDetectorRef);

    private readonly _delayedBadnessComponentSignal = viewChild.required<DelayedBadnessNgComponent>('delayedBadness');
    private readonly _splitSignal = viewChild.required(SplitComponent);
    private readonly _bidComponentSignal = viewChild.required<DepthSideNgComponent>('bidSide');
    private readonly _askComponentSignal = viewChild.required<DepthSideNgComponent>('askSide');

    private _delayedBadnessComponent: DelayedBadnessNgComponent;
    private _split: SplitComponent;
    private _bidComponent: DepthSideNgComponent;
    private _askComponent: DepthSideNgComponent;

    private readonly _frame: DepthFrame;

    constructor() {
        const contentService = inject(ContentNgService);

        super(++DepthNgComponent.typeInstanceCreateCount);

        this._frame = contentService.createDepthFrame(this);
    }

    public get frame(): DepthFrame { return this._frame; }
    public get bidDepthSideFrame() { return this._bidComponent.frame; }
    public get askDepthSideFrame() { return this._askComponent.frame; }

    ngOnDestroy() {
        this._frame.finalise();
    }

    ngAfterViewInit(): void {
        this._delayedBadnessComponent = this._delayedBadnessComponentSignal();
        this._split = this._splitSignal();
        this._bidComponent = this._bidComponentSignal();
        this._askComponent = this._askComponentSignal();
    }

    // Component Access Methods

    public setBidActiveWidth(pixels: Integer) {
        this.bidActiveWidth = numberToPixels(pixels);
        this._cdr.markForCheck();
    }

    public setAskActiveWidth(pixels: Integer) {
        this.askActiveWidth = numberToPixels(pixels);
        this._cdr.markForCheck();
    }

    // public getSplitAreaSizes() {
    //     return this._split.getVisibleAreaSizes();
    // }

    public setBadness(value: Badness) {
        this._delayedBadnessComponent.setBadness(value);
    }

    public hideBadnessWithVisibleDelay(badness: Badness) {
        this._delayedBadnessComponent.hideWithVisibleDelay(badness);
    }

    public setActiveWidths(bidActiveWidth: number, askActiveWidth: number) {
        this.bidActiveWidth = numberToPixels(bidActiveWidth);
        this.askActiveWidth = numberToPixels(askActiveWidth);
        this._cdr.markForCheck();
    }
}
