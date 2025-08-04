import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, ViewContainerRef, inject, viewChild } from '@angular/core';
import { AssertInternalError, delay1Tick } from '@pbkware/js-utils';
import { Badness } from '@plxtra/motif-core';
import { DelayedBadnessNgComponent } from '../../../delayed-badness/ng-api';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';
import { ContentNgService } from '../../../ng/content-ng.service';
import { DataMarketsWithBoardsFrame } from '../data-markets-with-boards-frame';

@Component({
    selector: 'app-data-markets-with-boards',
    templateUrl: './data-markets-with-boards-ng.component.html',
    styleUrls: ['./data-markets-with-boards-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DataMarketsWithBoardsNgComponent extends ContentComponentBaseNgDirective implements DataMarketsWithBoardsFrame.ComponentAccess, OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    public displayRecords: DataMarketsWithBoardsFrame.DisplayRecord[];

    private _cdr = inject(ChangeDetectorRef);

    private readonly _delayedBadnessComponentSignal = viewChild.required<DelayedBadnessNgComponent>('delayedBadness', { debugName: 'delayedBadness' });

    private _delayedBadnessComponent: DelayedBadnessNgComponent;
    private _frame: DataMarketsWithBoardsFrame;

    constructor() {
        const contentService = inject(ContentNgService);

        super(++DataMarketsWithBoardsNgComponent.typeInstanceCreateCount);

        this._frame = contentService.createDataMarketsWithBoardsFrame(this);
        this.displayRecords = this._frame.displayRecords;
    }

    ngOnDestroy() {
        this._frame.finalise();
    }

    ngAfterViewInit(): void {
        this._delayedBadnessComponent = this._delayedBadnessComponentSignal();
        delay1Tick(() => this._frame.initialise());
    }

    public notifyDisplayRecordsChanged() {
        this.displayRecords = this._frame.displayRecords;
        this._cdr.markForCheck();
    }

    public setBadness(value: Badness) {
        this._delayedBadnessComponent.setBadness(value);
    }

    public hideBadnessWithVisibleDelay(badness: Badness) {
        this._delayedBadnessComponent.hideWithVisibleDelay(badness);
    }
}

export namespace DataMarketsWithBoardsNgComponent {
    export function create(container: ViewContainerRef) {
        container.clear();
        const componentRef = container.createComponent(DataMarketsWithBoardsNgComponent);
        const instance = componentRef.instance;
        if (!(instance instanceof DataMarketsWithBoardsNgComponent)) {
            throw new AssertInternalError('MCCI129953235');
        } else {
            return instance;
        }
    }
}
