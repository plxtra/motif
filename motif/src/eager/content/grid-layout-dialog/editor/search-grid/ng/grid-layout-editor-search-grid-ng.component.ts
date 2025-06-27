import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, viewChild } from '@angular/core';
import { delay1Tick, ModifierKey } from '@pbkware/js-utils';
import { StringUiAction } from '@pbkware/ui-action';
import {
    CommandRegisterService,
    IconButtonUiAction,
    InternalCommand,
    StringId,
    Strings
} from '@plxtra/motif-core';
import { CommandRegisterNgService } from 'component-services-ng-api';
import { SvgButtonNgComponent, TextInputNgComponent } from 'controls-ng-api';
import { ContentComponentBaseNgDirective } from '../../../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-grid-layout-editor-search-grid',
    templateUrl: './grid-layout-editor-search-grid-ng.component.html',
    styleUrls: ['./grid-layout-editor-search-grid-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ColumnLayoutEditorSearchGridNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    searchTextChangedEventer: ColumnLayoutEditorSearchGridNgComponent.SearchTextChangedEventer | undefined;
    searchNextEventer: ColumnLayoutEditorSearchGridNgComponent.SearchNextEventer | undefined;
    selectAllEventer: ColumnLayoutEditorSearchGridNgComponent.SelectAllEventer | undefined;

    private readonly _searchInputComponentSignal = viewChild.required<TextInputNgComponent>('searchInput');
    private readonly _searchNextButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('searchNextButton');
    private readonly _selectAllButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('selectAllButton');

    private readonly _commandRegisterService: CommandRegisterService;

    private readonly _searchEditUiAction: StringUiAction;
    private readonly _searchNextUiAction: IconButtonUiAction;
    private readonly _selectAllUiAction: IconButtonUiAction;

    private _searchInputComponent: TextInputNgComponent;
    private _searchNextButtonComponent: SvgButtonNgComponent;
    private _selectAllButtonComponent: SvgButtonNgComponent;

    private _searchEnabled = true;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private readonly _cdr: ChangeDetectorRef,
        commandRegisterNgService: CommandRegisterNgService,
    ) {
        super(elRef, ++ColumnLayoutEditorSearchGridNgComponent.typeInstanceCreateCount);

        this._commandRegisterService = commandRegisterNgService.service;

        this._selectAllUiAction = this.createSelectAllUiAction();
        this._searchNextUiAction = this.createSearchNextUiAction();
        this._searchEditUiAction = this.createSearchEditUiAction();
    }

    get searchEnabled() { return this._searchEnabled; }
    set searchEnabled(value: boolean) {
        if (value !== this._searchEnabled) {
            this._searchEnabled = value;
            this.resolveSearchEnabled();
        }
    }

    ngOnDestroy() {
        this._searchEditUiAction.finalise();
        this._searchNextUiAction.finalise();
        this._selectAllUiAction.finalise();
    }

    ngAfterViewInit(): void {
        this._searchInputComponent = this._searchInputComponentSignal();
        this._searchNextButtonComponent = this._searchNextButtonComponentSignal();
        this._selectAllButtonComponent = this._selectAllButtonComponentSignal();

        delay1Tick(() => this.initialise());
    }

    private createSearchEditUiAction() {
        const action = new StringUiAction(false);
        action.pushPlaceholder(Strings[StringId.Search]);
        action.pushTitle(Strings[StringId.Grid_SearchInputTitle]);
        action.inputEvent = () => {
            this.resolveSearchEnabled();
            if (this.searchTextChangedEventer !== undefined) {
                this.searchTextChangedEventer(this._searchEditUiAction.inputtedText);
            }
        };
        return action;
    }

    private createSearchNextUiAction() {
        const commandName = InternalCommand.Id.Grid_SearchNext;
        const displayId = StringId.Grid_SearchNextCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.Grid_SearchNextTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SearchNext);
        action.signalEvent = (_signalTypeId, downKeys) => {
            const searchText = this._searchEditUiAction.inputtedText;
            if (this.searchNextEventer !== undefined && searchText.length > 0) {
                this.searchNextEventer(searchText, downKeys);
            }
        };
        return action;
    }

    private createSelectAllUiAction() {
        const commandName = InternalCommand.Id.Grid_SelectAll;
        const displayId = StringId.Grid_SelectAllCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.Grid_SelectAllTitle]);
        action.pushIcon(IconButtonUiAction.IconId.MarkAll);
        action.signalEvent = (downKeys) => {
            if (this.selectAllEventer !== undefined) {
                this.selectAllEventer(downKeys);
            }
        };
        return action;
    }

    private initialise() {
        this._searchNextButtonComponent.initialise(this._searchNextUiAction);
        this._searchInputComponent.initialise(this._searchEditUiAction);
        this._selectAllButtonComponent.initialise(this._selectAllUiAction);

        this._cdr.markForCheck();
    }

    private resolveSearchEnabled() {
        if (!this._searchEnabled || this._searchEditUiAction.inputtedText === '') {
            this._searchNextUiAction.pushDisabled();
        } else {
            this._searchNextUiAction.pushUnselected();
        }
    }
}

export namespace ColumnLayoutEditorSearchGridNgComponent {
    export type SearchTextChangedEventer = (searchText: string) => void;
    export type SearchNextEventer = (searchText: string, downKeys: ModifierKey.IdSet) => void;
    export type SelectAllEventer = (downKeys: ModifierKey.IdSet) => void;
}
