import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AssertInternalError, ChangeSubscribableComparableList, LockOpenListItem } from '@pbkware/js-utils';
import { StringId, Strings, TradingMarket } from '@plxtra/motif-core';
import { CoreInjectionTokens, ToastNgService } from 'component-services-ng-api';
import { GridSourceNgDirective } from '../../../grid-source/ng-api';
import { ContentNgService } from '../../../ng/content-ng.service';
import { TradingMarketsGridFrame } from '../trading-markets-grid-frame';


@Component({
    selector: 'app-trading-markets-grid',
    templateUrl: './trading-markets-grid-ng.component.html',
    styleUrls: ['./trading-markets-grid-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class TradingMarketsGridNgComponent extends GridSourceNgDirective {
    declare frame: TradingMarketsGridNgComponent.Frame;

    private readonly _toastNgService = inject(ToastNgService);
    private readonly _opener = inject<LockOpenListItem.Opener>(CoreInjectionTokens.lockOpenListItemOpener);

    constructor() {
        const contentNgService = inject(ContentNgService);

        const frame: TradingMarketsGridNgComponent.Frame = contentNgService.createTradingMarketsGridFrame();
        super(++TradingMarketsGridNgComponent.typeInstanceCreateCount, frame);
        frame.setComponentAccess(this);
    }

    initialise() {
        this.frame.initialise(this._opener, undefined, false);
    }

    setList(value: ChangeSubscribableComparableList<TradingMarket> | undefined) {
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

export namespace TradingMarketsGridNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;
    export type Frame = TradingMarketsGridFrame;
}
