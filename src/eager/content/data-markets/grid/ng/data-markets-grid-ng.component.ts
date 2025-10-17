import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AssertInternalError, ChangeSubscribableComparableList, LockOpenListItem } from '@pbkware/js-utils';
import { DataMarket, StringId, Strings } from '@plxtra/motif-core';
import { CoreInjectionTokens, ToastNgService } from 'component-services-ng-api';
import { DelayedBadnessGridSourceNgDirective } from '../../../delayed-badness-grid-source/ng-api';
import { ContentNgService } from '../../../ng/content-ng.service';
import { DataMarketsGridFrame } from '../data-markets-grid-frame';
import { DelayedBadnessNgComponent } from '../../../delayed-badness/ng/delayed-badness-ng.component';


@Component({
    selector: 'app-data-markets-grid',
    templateUrl: './data-markets-grid-ng.component.html',
    styleUrls: ['./data-markets-grid-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DelayedBadnessNgComponent]
})
export class DataMarketsGridNgComponent extends DelayedBadnessGridSourceNgDirective {
    declare frame: DataMarketsGridNgComponent.Frame;

    private readonly _toastNgService = inject(ToastNgService);
    private readonly _opener = inject<LockOpenListItem.Opener>(CoreInjectionTokens.lockOpenListItemOpener);

    constructor() {
        const contentNgService = inject(ContentNgService);

        const frame: DataMarketsGridNgComponent.Frame = contentNgService.createDataMarketsGridFrame();
        super(++DataMarketsGridNgComponent.typeInstanceCreateCount, frame);
        frame.setComponentAccess(this);
    }

    initialise() {
        this.frame.initialise(this._opener, undefined, false);
    }

    setList(value: ChangeSubscribableComparableList<DataMarket> | undefined) {
        if (value === undefined) {
            this.frame.closeGridSource(true);
        } else {
            const openPromise = this.frame.tryOpenList(value, true);
            openPromise.then(
                (result) => {
                    if (result.isErr()) {
                        this._toastNgService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.ScanFieldEditorFramesGrid]}: ${result.error}`);
                    }
                },
                (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'EEGNCSL50139') }
            );
        }
    }
}

export namespace DataMarketsGridNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;
    export type Frame = DataMarketsGridFrame;
}
