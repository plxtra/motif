import { InjectionToken } from '@angular/core';
import { LockOpenListItem } from '@pbkware/js-utils';
import { SourcedFieldGrid } from '@plxtra/motif-core';

export namespace CoreInjectionTokens {
    export const lockOpenListItemOpener = new InjectionToken<LockOpenListItem.Opener>('LockOpenListItem.Opener');
    export const adaptedRevgridCustomGridSettings = new InjectionToken<SourcedFieldGrid.CustomGridSettings>('AdaptedRevgrid.CustomGridSettings');
}
