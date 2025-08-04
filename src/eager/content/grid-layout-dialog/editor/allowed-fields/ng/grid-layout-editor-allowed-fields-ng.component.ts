import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { LockOpenListItem } from '@pbkware/js-utils';
import {
    EditableColumnLayoutDefinitionColumnList,
    StringId,
    Strings
} from '@plxtra/motif-core';
import { CoreInjectionTokens, ToastNgService } from 'component-services-ng-api';
import { GridSourceNgDirective } from '../../../../grid-source/ng-api';
import { ContentNgService } from '../../../../ng/content-ng.service';
import { allowedFieldsInjectionToken, definitionColumnListInjectionToken } from '../../../ng/grid-layout-dialog-ng-injection-tokens';
import { ColumnLayoutEditorSearchGridNgComponent } from '../../search-grid/ng-api';
import { ColumnLayoutEditorAllowedFieldsFrame } from '../grid-layout-editor-allowed-fields-frame';

@Component({
    selector: 'app-grid-layout-editor-allowed-fields',
    templateUrl: './grid-layout-editor-allowed-fields-ng.component.html',
    styleUrls: ['./grid-layout-editor-allowed-fields-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ColumnLayoutEditorAllowedFieldsNgComponent extends GridSourceNgDirective {
    private static typeInstanceCreateCount = 0;

    columnsViewWidthsChangedEventer: ColumnLayoutEditorAllowedFieldsNgComponent.ColumnsViewWidthsChangedEventer | undefined;

    public readonly heading = Strings[StringId.Available]

    declare readonly frame: ColumnLayoutEditorAllowedFieldsFrame;

    private readonly _toastNgService = inject(ToastNgService);
    private readonly _opener = inject<LockOpenListItem.Opener>(CoreInjectionTokens.lockOpenListItemOpener);

    private readonly _searchComponentSignal = viewChild.required<ColumnLayoutEditorSearchGridNgComponent>('search');

    private _searchComponent: ColumnLayoutEditorSearchGridNgComponent;

    constructor() {
        const contentNgService = inject(ContentNgService);
        const allowedFields = inject(allowedFieldsInjectionToken);
        const columnList = inject<EditableColumnLayoutDefinitionColumnList>(definitionColumnListInjectionToken);

        const frame = contentNgService.createColumnLayoutEditorAllowedFieldsFrame(allowedFields, columnList);
        super(++ColumnLayoutEditorAllowedFieldsNgComponent.typeInstanceCreateCount, frame);
        frame.setComponentAccess(this);
    }

    initialise() {
        this.frame.initialise(this._opener, undefined, false);

        this.frame.columnsViewWidthsChangedEventer = () => {
            if (this.columnsViewWidthsChangedEventer !== undefined) {
                this.columnsViewWidthsChangedEventer();
            }
        }
    }

    calculateFixedColumnsWidth() {
        return this.frame.grid.columnsManager.calculateFixedColumnsWidth();
    }

    calculateActiveColumnsWidth() {
        return this.frame.grid.calculateActiveColumnsWidth();
    }

    waitLastServerNotificationRendered(next: boolean) {
        return this.frame.grid.renderer.waitLastServerNotificationRendered(next);
    }

    protected override processAfterViewInit(): void {
        this._searchComponent = this._searchComponentSignal();
        this._searchComponent.selectAllEventer = () => this.frame.selectAllRows();
        this._searchComponent.searchTextChangedEventer = (searchText) => this.frame.tryFocusFirstSearchMatch(searchText);
        this._searchComponent.searchNextEventer = (searchText, downKeys) => this.frame.tryFocusNextSearchMatch(searchText, downKeys);
    }
}

export namespace ColumnLayoutEditorAllowedFieldsNgComponent {
    export type ColumnsViewWidthsChangedEventer = (this: void) => void;
}
