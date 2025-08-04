import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
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

    constructor() {
        super(++DataIvemIdListEditorNgComponent.typeInstanceCreateCount);
    }
}
