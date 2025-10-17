import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { DataIvemIdListEditorNgDirective } from './data-ivem-id-list-editor-ng.directive';
import { DataIvemIdSelectNgComponent } from '../../../controls/market-ivem-id/data-ivem-id-select/ng/data-ivem-id-select-ng.component';
import { SvgButtonNgComponent } from '../../../controls/boolean/button/icon/svg-button/ng/svg-button-ng.component';
import { TextInputNgComponent } from '../../../controls/string/text-input/ng/text-input-ng.component';
import { DataIvemIdListNgComponent } from '../../lit-ivem-id-list/ng/data-ivem-id-list-ng.component';

@Component({
    selector: 'app-data-ivem-id-list-editor',
    templateUrl: './data-ivem-id-list-editor-ng.component.html',
    styleUrls: ['./data-ivem-id-list-editor-ng.component.scss'],
    providers: [DataIvemIdListEditorNgDirective.initialCustomGridSettingsProvider],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DataIvemIdSelectNgComponent, SvgButtonNgComponent, TextInputNgComponent, DataIvemIdListNgComponent]
})
export class DataIvemIdListEditorNgComponent extends DataIvemIdListEditorNgDirective implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    constructor() {
        super(++DataIvemIdListEditorNgComponent.typeInstanceCreateCount);
    }
}
