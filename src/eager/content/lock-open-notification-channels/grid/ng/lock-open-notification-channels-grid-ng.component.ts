import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LockOpenListItem } from '@pbkware/js-utils';
import { CoreInjectionTokens, ToastNgService } from 'component-services-ng-api';
import { GridSourceNgDirective } from '../../../grid-source/ng-api';
import { ContentNgService } from '../../../ng/content-ng.service';
import { LockOpenNotificationChannelsGridFrame } from '../lock-open-notification-channels-grid-frame';

@Component({
    selector: 'app-lock-open-notification-channels-grid',
    templateUrl: './lock-open-notification-channels-grid-ng.component.html',
    styleUrls: ['./lock-open-notification-channels-grid-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LockOpenNotificationChannelsGridNgComponent extends GridSourceNgDirective {
    declare frame: LockOpenNotificationChannelsGridNgComponent.Frame;

    private readonly _toastNgService = inject(ToastNgService);
    private readonly _opener: LockOpenListItem.Opener;

    constructor() {
        const contentNgService = inject(ContentNgService);
        const _opener = inject<LockOpenListItem.Opener>(CoreInjectionTokens.lockOpenListItemOpener);
        const frame: LockOpenNotificationChannelsGridNgComponent.Frame = contentNgService.createLockOpenNotificationChannelsGridFrame(_opener);

        super(++LockOpenNotificationChannelsGridNgComponent.typeInstanceCreateCount, frame);
        this._opener = _opener;

        frame.setComponentAccess(this);
    }

    initialise() {
        this.frame.initialise(this._opener, undefined, false);
    }

    selectAllRows() {
        this.frame.selectAllRows();
    }

    getSelectedRecordIndices() {
        return this.frame.getSelectedRecordIndices();
    }
}

export namespace LockOpenNotificationChannelsGridNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;
    export type Frame = LockOpenNotificationChannelsGridFrame;
}
