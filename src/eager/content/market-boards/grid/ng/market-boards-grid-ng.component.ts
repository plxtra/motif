import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AssertInternalError, ChangeSubscribableComparableList, LockOpenListItem } from '@pbkware/js-utils';
import { MarketBoard, StringId, Strings } from '@plxtra/motif-core';
import { CoreInjectionTokens, ToastNgService } from 'component-services-ng-api';
import { GridSourceNgDirective } from '../../../grid-source/ng-api';
import { ContentNgService } from '../../../ng/content-ng.service';
import { MarketBoardsGridFrame } from '../market-boards-grid-frame';


@Component({
    selector: 'app-market-boards-grid',
    templateUrl: './market-boards-grid-ng.component.html',
    styleUrls: ['./market-boards-grid-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketBoardsGridNgComponent extends GridSourceNgDirective {
    declare frame: MarketBoardsGridNgComponent.Frame;

    private readonly _toastNgService = inject(ToastNgService);
    private readonly _opener = inject<LockOpenListItem.Opener>(CoreInjectionTokens.lockOpenListItemOpener);

    constructor() {
        const contentNgService = inject(ContentNgService);

        const frame: MarketBoardsGridNgComponent.Frame = contentNgService.createMarketBoardsGridFrame();
        super(++MarketBoardsGridNgComponent.typeInstanceCreateCount, frame);
        frame.setComponentAccess(this);
    }

    initialise() {
        this.frame.initialise(this._opener, undefined, false);
    }

    setList(value: ChangeSubscribableComparableList<MarketBoard> | undefined) {
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

export namespace MarketBoardsGridNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;
    export type Frame = MarketBoardsGridFrame;
}
