import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, Optional } from '@angular/core';
import { LockOpenListItem } from '@pbkware/js-utils';
import { DataIvemId, UiComparableList } from '@plxtra/motif-core';
import { CommandRegisterNgService, CoreInjectionTokens, MarketsNgService, ToastNgService } from 'component-services-ng-api';
import { TableFieldSourceDefinitionCachingFactoryNgService } from '../../ng/table-field-source-definition-caching-factory-ng.service';
import { DataIvemIdListEditorNgDirective } from './data-ivem-id-list-editor-ng.directive';

@Component({
    selector: 'app-data-ivem-id-list-editor',
    templateUrl: './data-ivem-id-list-editor-ng.component.html',
    styleUrls: ['./data-ivem-id-list-editor-ng.component.scss'],
    providers: [DataIvemIdListEditorNgDirective.initialCustomGridSettingsProvider],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DataIvemIdListEditorNgComponent extends DataIvemIdListEditorNgDirective implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        marketsNgService: MarketsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        fieldSourceDefinitionCachedFactoryNgService: TableFieldSourceDefinitionCachingFactoryNgService,
        toastNgService: ToastNgService,
        @Inject(CoreInjectionTokens.lockOpenListItemOpener) opener: LockOpenListItem.Opener,
        @Optional() @Inject(DataIvemIdListEditorNgDirective.listInjectionToken) list: UiComparableList<DataIvemId> | null,
    ) {
        super(
            elRef,
            cdr,
            marketsNgService,
            commandRegisterNgService,
            fieldSourceDefinitionCachedFactoryNgService,
            toastNgService,
            ++DataIvemIdListEditorNgComponent.typeInstanceCreateCount,
            opener,
            list
        );
    }
}
