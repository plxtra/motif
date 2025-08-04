import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LockOpenListItem } from '@pbkware/js-utils';
import { CoreInjectionTokens, ToastNgService } from 'component-services-ng-api';
import { GridSourceNgDirective } from '../../../grid-source/ng-api';
import { ContentNgService } from '../../../ng/content-ng.service';
import { SymbolListDirectoryGridFrame } from '../symbol-list-directory-grid-frame';

@Component({
    selector: 'app-symbol-list-directory-grid',
    templateUrl: './symbol-list-directory-grid-ng.component.html',
    styleUrls: ['./symbol-list-directory-grid-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SymbolListDirectoryGridNgComponent extends GridSourceNgDirective {
    declare frame: SymbolListDirectoryGridNgComponent.Frame;

    private readonly _toastNgService = inject(ToastNgService);
    private readonly _opener: LockOpenListItem.Opener;

    constructor() {
        const contentNgService = inject(ContentNgService);
        const _opener = inject<LockOpenListItem.Opener>(CoreInjectionTokens.lockOpenListItemOpener);
        const frame: SymbolListDirectoryGridNgComponent.Frame = contentNgService.createSymbolListDirectoryGridFrame(_opener);

        super(++SymbolListDirectoryGridNgComponent.typeInstanceCreateCount, frame);
        this._opener = _opener;

        frame.setComponentAccess(this);
    }

    get listFocusedEventer() { return this.frame.listFocusedEventer; }
    set listFocusedEventer(value: SymbolListDirectoryGridFrame.listFocusedEventer | undefined) {
        this.frame.listFocusedEventer = value;
    }

    initialise() {
        this.frame.initialise(this._opener, undefined, false);
    }

    focusList(idOrName: string) {
        return this.frame.focusList(idOrName);
    }
}

export namespace SymbolListDirectoryGridNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;
    export type Frame = SymbolListDirectoryGridFrame;
}
