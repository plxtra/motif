import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AssertInternalError, LockOpenListItem } from '@pbkware/js-utils';
import { BadnessComparableList, StringId, Strings } from '@plxtra/motif-core';
import { CoreInjectionTokens, ToastNgService } from 'component-services-ng-api';
import { GridSourceNgDirective } from '../../../../../../../../grid-source/ng-api';
import { ContentNgService } from '../../../../../../../../ng/content-ng.service';
import { ScanFieldEditorFrame } from '../../field/internal-api';
import { ScanFieldEditorFramesGridFrame } from '../scan-field-editor-frames-grid-frame';

@Component({
    selector: 'app-scan-field-editor-frames-grid',
    templateUrl: './scan-field-editor-frames-grid-ng.component.html',
    styleUrls: ['./scan-field-editor-frames-grid-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScanFieldEditorFramesGridNgComponent extends GridSourceNgDirective {
    declare frame: ScanFieldEditorFramesGridNgComponent.Frame;

    private readonly _toastNgService = inject(ToastNgService);
    private readonly _opener = inject<LockOpenListItem.Opener>(CoreInjectionTokens.lockOpenListItemOpener);

    constructor() {
        const contentNgService = inject(ContentNgService);

        const frame: ScanFieldEditorFramesGridNgComponent.Frame = contentNgService.createScanFieldEditorFramesGridFrame();
        super(++ScanFieldEditorFramesGridNgComponent.typeInstanceCreateCount, frame);
        frame.setComponentAccess(this);
    }

    initialise() {
        this.frame.initialise(this._opener, undefined, false);
    }

    setList(value: BadnessComparableList<ScanFieldEditorFrame> | undefined) {
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
                (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'FNCPR50139') }
            );
        }
    }
}

export namespace ScanFieldEditorFramesGridNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;
    export type Frame = ScanFieldEditorFramesGridFrame;
}
