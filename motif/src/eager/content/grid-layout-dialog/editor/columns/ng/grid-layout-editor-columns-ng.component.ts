import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, viewChild } from '@angular/core';
import { delay1Tick, LockOpenListItem } from '@pbkware/js-utils';
import { IntegerUiAction } from '@pbkware/ui-action';
import {
    EditableColumnLayoutDefinitionColumnList,
    StringId,
    Strings
} from '@plxtra/motif-core';
import { CoreInjectionTokens, ToastNgService } from 'component-services-ng-api';
import { IntegerTextInputNgComponent } from 'controls-ng-api';
import { GridSourceNgDirective } from '../../../../grid-source/ng-api';
import { ContentNgService } from '../../../../ng/content-ng.service';
import { definitionColumnListInjectionToken } from '../../../ng/grid-layout-dialog-ng-injection-tokens';
import { ColumnLayoutEditorSearchGridNgComponent } from '../../search-grid/ng-api';
import { ColumnLayoutEditorColumnsFrame } from '../grid-layout-editor-columns-frame';

@Component({
    selector: 'app-grid-layout-editor-columns',
    templateUrl: './grid-layout-editor-columns-ng.component.html',
    styleUrls: ['./grid-layout-editor-columns-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ColumnLayoutEditorColumnsNgComponent extends GridSourceNgDirective {
    private static typeInstanceCreateCount = 0;

    public readonly heading = Strings[StringId.InUse]

    declare readonly frame: ColumnLayoutEditorColumnsFrame;

    private readonly _searchComponentSignal = viewChild.required<ColumnLayoutEditorSearchGridNgComponent>('search');
    private readonly _widthEditorComponentSignal = viewChild.required<IntegerTextInputNgComponent>('widthEditorControl');

    private readonly _widthEditorUiAction: IntegerUiAction;

    private _searchComponent: ColumnLayoutEditorSearchGridNgComponent;
    private _widthEditorComponent: IntegerTextInputNgComponent;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        contentNgService: ContentNgService,
        private readonly _toastNgService: ToastNgService,
        @Inject(CoreInjectionTokens.lockOpenListItemOpener) private readonly _opener: LockOpenListItem.Opener,
        @Inject(definitionColumnListInjectionToken) columnList: EditableColumnLayoutDefinitionColumnList,
    ) {
        const frame = contentNgService.createColumnLayoutEditorColumnsFrame(columnList);
        super(elRef, ++ColumnLayoutEditorColumnsNgComponent.typeInstanceCreateCount, cdr, frame);
        frame.setComponentAccess(this);

        this._widthEditorUiAction = this.createWidthEditorUiAction();
    }

    initialise() {
        this.frame.initialise(this._opener, undefined, false);
        this._widthEditorComponent.dataServer = this.frame.grid.mainDataServer;
        this.frame.setWidthEditor(this._widthEditorComponent);
    }

    protected override processAfterViewInit(): void {
        this._searchComponent = this._searchComponentSignal();
        this._searchComponent.selectAllEventer = () => this.frame.selectAllRows();
        this._searchComponent.searchTextChangedEventer = (searchText) => this.frame.tryFocusFirstSearchMatch(searchText);
        this._searchComponent.searchNextEventer = (searchText, downKeys) => this.frame.tryFocusNextSearchMatch(searchText, downKeys);

        this._widthEditorComponent = this._widthEditorComponentSignal();
        delay1Tick(() => this._widthEditorComponent.initialise(this._widthEditorUiAction));
    }

    protected override finalise(): void {
        this._widthEditorUiAction.finalise();
        super.finalise();
    }

    private createWidthEditorUiAction() {
        const action = new IntegerUiAction(false);
        action.pushCaption(Strings[StringId.ColumnLayoutEditorColumns_SetWidthCaption]);
        action.pushTitle(Strings[StringId.ColumnLayoutEditorColumns_SetWidthTitle]);
        action.commitEvent = () => {
            const focus = this.frame.grid.focus;
            if (focus.canSetFocusedEditValue()) {
                focus.setFocusedEditValue(this._widthEditorUiAction.value);
            }
        };
        return action;
    }
}

export namespace ColumnLayoutEditorColumnsNgComponent {
    // export const enum ColumnFilterId {
    //     ShowAll = 1,
    //     ShowVisible = 2,
    //     ShowHidden = 3,
    // }

    // export namespace ColumnFilter {
    //     export function getEnumUiActionElementProperties(id: ColumnFilterId): IntegerListSelectItemUiAction.ItemProperties {
    //         switch (id) {
    //             case ColumnFilterId.ShowAll:
    //                 return {
    //                     element: ColumnFilterId.ShowAll,
    //                     caption: Strings[StringId.ColumnLayoutEditor_ShowAllRadioCaption],
    //                     title: Strings[StringId.ColumnLayoutEditor_ShowAllRadioTitle],
    //                 };
    //             case ColumnFilterId.ShowVisible:
    //                 return {
    //                     element: ColumnFilterId.ShowVisible,
    //                     caption: Strings[StringId.ColumnLayoutEditor_ShowVisibleRadioCaption],
    //                     title: Strings[StringId.ColumnLayoutEditor_ShowVisibleRadioTitle],
    //                 };
    //             case ColumnFilterId.ShowHidden:
    //                 return {
    //                     element: ColumnFilterId.ShowHidden,
    //                     caption: Strings[StringId.ColumnLayoutEditor_ShowHiddenRadioCaption],
    //                     title: Strings[StringId.ColumnLayoutEditor_ShowHiddenRadioTitle],
    //                 };
    //             default:
    //                 throw new UnreachableCaseError('GLEGCCFGEUAEP0098233', id);
    //         }
    //     }
    // }
}

// function showAllFilter(record: object): boolean {
//     return true;
// }

// function showVisibleFilter(record: object): boolean {
//     return true;
//     // return (record as RevColumnLayout.Column).visible;
// }

// function showHiddenFilter(record: object): boolean {
//     return !(record as RevColumnLayout.Column).visible;
// }
