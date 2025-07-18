import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, InjectionToken, Optional, ValueProvider } from '@angular/core';
import { JsonElement, LockOpenListItem } from '@pbkware/js-utils';
import { AdaptedRevgridGridSettings, DataIvemId, UiComparableList } from '@plxtra/motif-core';
import { RevColumnLayoutOrReferenceDefinition } from 'revgrid';
import { DelayedBadnessGridSourceNgDirective } from '../../delayed-badness-grid-source/ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { DataIvemIdListFrame } from '../data-ivem-id-list-frame';

@Component({
    selector: 'app-data-ivem-id-list',
    templateUrl: './data-ivem-id-list-ng.component.html',
    styleUrls: ['./data-ivem-id-list-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DataIvemIdListNgComponent extends DelayedBadnessGridSourceNgDirective {
    private static typeInstanceCreateCount = 0;

    declare frame: DataIvemIdListFrame;

    selectionChangedEventer: DataIvemIdListFrame.SelectionChangedEventer | undefined;

    private _list: UiComparableList<DataIvemId> | undefined;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        contentNgService: ContentNgService,
        @Optional() @Inject(DataIvemIdListNgComponent.initialCustomGridSettingsInjectionToken) initialCustomGridSettings: Partial<AdaptedRevgridGridSettings> | null,
    ) {
        const frame = contentNgService.createDataIvemIdListFrame(initialCustomGridSettings === null ? undefined : initialCustomGridSettings);
        frame.getListEventer = () => this._list;
        frame.selectionChangedEventer = () => {
            if (this.selectionChangedEventer !== undefined) {
                this.selectionChangedEventer();
            }
        }
        super(elRef, ++DataIvemIdListNgComponent.typeInstanceCreateCount, cdr, frame);
        frame.setComponentAccess(this);
    }

    get mainRowCount() { return this.frame.mainRowCount; }
    get filterActive() { return this.frame.filterActive; }
    get filterText() { return this.frame.filterText; }
    set filterText(value: string) { this.frame.filterText = value; }

    // To be called from parent component to ensure gridHost are available
    initialise(
        opener: LockOpenListItem.Opener,
        layoutDefinition: RevColumnLayoutOrReferenceDefinition | undefined,
        frameElement: JsonElement | undefined,
        keepPreviousLayoutIfPossible: boolean,
    ) {
        if (layoutDefinition === undefined) {
            const layoutDefinitionResult = this.frame.tryCreateLayoutDefinitionFromJson(frameElement);
            if (layoutDefinitionResult.isErr()) {
                // toast in future
            } else {
                layoutDefinition = layoutDefinitionResult.value;
            }
        }

        this.frame.initialise(opener, layoutDefinition, keepPreviousLayoutIfPossible);
    }

    tryOpenList(list: UiComparableList<DataIvemId>, keepView: boolean) {
        this._list = list;
        return this.frame.tryOpenList(list, keepView);
    }

    selectAllRows() {
        this.frame.selectAllRows();
    }

    getSelectedRecordIndices() {
        return this.frame.getSelectedRecordIndices();
    }

    createAllowedSourcedFieldsColumnLayoutDefinition() {
        return this.frame.createAllowedSourcedFieldsColumnLayoutDefinition();
    }

    tryOpenColumnLayoutOrReferenceDefinition(layoutOrReferenceDefinition: RevColumnLayoutOrReferenceDefinition) {
        return this.frame.tryOpenColumnLayoutOrReferenceDefinition(layoutOrReferenceDefinition)
    }

    areRowsSelected(includeAllAuto: boolean) {
        return this.frame.areRowsSelected(includeAllAuto);
    }

    protected override finalise() {
        this.frame.selectionChangedEventer = undefined;
        super.finalise();
    }
}

export namespace DataIvemIdListNgComponent {
    export const initialCustomGridSettingsInjectionToken = new InjectionToken<Partial<AdaptedRevgridGridSettings>>('DataIvemIdListNgComponent.initialCustomGridSettingsInjectionToken');

    export interface InitialCustomGridSettingsProvider extends ValueProvider {
        provide: typeof DataIvemIdListNgComponent.initialCustomGridSettingsInjectionToken;
        useValue: Partial<AdaptedRevgridGridSettings>;
    }
}
