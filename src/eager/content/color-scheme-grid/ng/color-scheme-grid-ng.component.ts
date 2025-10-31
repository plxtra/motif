import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, effect, inject, untracked, viewChild } from '@angular/core';
import { Integer } from '@pbkware/js-utils';
import {
    CellPainterFactoryService,
    ColorScheme,
    ColorSchemeGridField,
    ColorSchemeGridRecordStore,
    RecordGrid,
    SettingsService,
    SourcedFieldGrid,
    TextFormattableValueRecordGridCellPainter,
    TextHeaderCellPainter,
    TextTextFormattableValueCellPainter
} from '@plxtra/motif-core';
import { CellPainterFactoryNgService, SettingsNgService } from 'component-services-ng-api';
import { RevColumnLayout, RevRecord, RevRecordFieldIndex, RevRecordIndex } from 'revgrid';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-color-scheme-grid',
    templateUrl: './color-scheme-grid-ng.component.html',
    styleUrls: ['./color-scheme-grid-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColorSchemeGridNgComponent extends ContentComponentBaseNgDirective implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    recordFocusEventer: ColorSchemeGridNgComponent.RecordFocusEventer | undefined;
    gridClickEventer: ColorSchemeGridNgComponent.GridClickEventer | undefined;
    columnsViewWithsChangedEventer: ColorSchemeGridNgComponent.ColumnsViewWithsChangedEventer | undefined;

    private readonly _gridCanvasElementRefSignal = viewChild.required<ElementRef<HTMLCanvasElement>>('gridCanvas');

    private readonly _settingsService: SettingsService;
    private readonly _cellPainterFactoryService: CellPainterFactoryService;

    private _recordStore: ColorSchemeGridRecordStore;
    private _grid: RecordGrid;
    private _mainCellPainter: TextFormattableValueRecordGridCellPainter<TextTextFormattableValueCellPainter>;
    private _headerCellPainter: TextHeaderCellPainter;

    private _filterActive = false;
    private _filterFolderId = ColorScheme.Item.FolderId.Grid;

    constructor() {
        const settingsNgService = inject(SettingsNgService);
        const cellPainterFactoryNgService = inject(CellPainterFactoryNgService);

        super(++ColorSchemeGridNgComponent.typeInstanceCreateCount);
        this._settingsService = settingsNgService.service;
        this._cellPainterFactoryService = cellPainterFactoryNgService.service;
        this._recordStore = new ColorSchemeGridRecordStore(this._settingsService);

        const effectRef = effect(() => {
            const gridCanvasElementRef = this._gridCanvasElementRefSignal();
            untracked(() => {
                this._grid = this.createGrid(gridCanvasElementRef.nativeElement);

                const grid = this._grid;
                this._mainCellPainter = this._cellPainterFactoryService.createTextTextFormattableValueRecordGrid(this._grid, grid.mainDataServer);
                this._headerCellPainter = this._cellPainterFactoryService.createTextHeader(grid, grid.headerDataServer);

                grid.activate();

                this.initialiseGrid();

                this._recordStore.recordsInserted(0, this._recordStore.recordCount);

                const columnLayoutDefinition = ColorSchemeGridField.createDefaultColumnLayoutDefinition();
                const columnLayout = new RevColumnLayout(columnLayoutDefinition);
                grid.applyFirstUsable(undefined, undefined, columnLayout);

                this.applyFilter();

                effectRef.destroy(); // only run once
            });
        });
    }

    get focusedRecordIndex() { return this._grid.focusedRecordIndex; }
    get fixedColumnsViewWidth() { return this._grid.fixedColumnsViewWidth; }
    get activeColumnsViewWidth() { return this._grid.activeColumnsViewWidth; }
    get emWidth() { return this._grid.emWidth; }

    public get filterFolderId() { return this._filterFolderId; }
    public set filterFolderId(value: ColorScheme.Item.FolderId) {
        this._filterFolderId = value;
        this.applyFilter();
    }

    ngOnDestroy() {
        this._grid.destroy();
    }

    calculateActiveColumnsWidth() {
        return this._grid.calculateActiveColumnsWidth();
    }

    calculateFixedColumnsWidth() {
        return this._grid.columnsManager.calculateFixedColumnsWidth();
    }

    waitLastServerNotificationRendered(next: boolean) {
        return this._grid.renderer.waitLastServerNotificationRendered(next);
    }

    handleRecordFocusEvent(recordIndex: RevRecordIndex | undefined) {
        if (this.recordFocusEventer !== undefined) {
            this.recordFocusEventer(recordIndex);
        }
    }

    handleGridClickEvent(fieldIndex: RevRecordFieldIndex, recordIndex: RevRecordIndex): void {
        if (this.gridClickEventer !== undefined) {
            this.gridClickEventer(fieldIndex, recordIndex);
        }
    }

    handleColumnsViewWidthsChangedEvent(fixedChanged: boolean, nonFixedChanged: boolean, allChanged: boolean) {
        if ((fixedChanged || allChanged) && this.columnsViewWithsChangedEventer !== undefined) {
            this.columnsViewWithsChangedEventer();
        }
    }

    invalidateAll(): void {
        this._recordStore.invalidateAll();
    }

    invalidateRecord(recordIndex: Integer): void {
        this._recordStore.invalidateRecord(recordIndex);
    }

    private createGrid(gridCanvasElement: HTMLCanvasElement) {
        const customGridSettings: SourcedFieldGrid.CustomGridSettings = {
            mouseColumnSelectionEnabled: false,
            mouseRowSelectionEnabled: false,
            mouseAddToggleExtendSelectionAreaEnabled: false,
            multipleSelectionAreas: false,
            sortOnDoubleClick: false,
            viewColumnWidthAdjust: true,
            fixedColumnCount: 1,
            gridRightAligned: false,
        };

        const grid = new RecordGrid(
            this._settingsService,
            gridCanvasElement,
            this._recordStore,
            customGridSettings,
            () => this.customiseSettingsForNewColumn(),
            () => this.getMainCellPainter(),
            () => this.getHeaderCellPainter(),
            this,
        );


        grid.recordFocusedEventer = (newRecordIndex) => this.handleRecordFocusEvent(newRecordIndex);
        grid.mainClickEventer = (fieldIndex, recordIndex) => this.handleGridClickEvent(fieldIndex, recordIndex);
        grid.columnsViewWidthsChangedEventer =
            (fixedChanged, nonFixedChanged, allChanged) => this.handleColumnsViewWidthsChangedEvent(
                fixedChanged, nonFixedChanged, allChanged
            );

        return grid;
    }

    private filterItems(record: RevRecord) {
        if (!this._filterActive) {
            return true;
        } else {
            const colorSchemeGridRecord = record as ColorSchemeGridRecordStore.Record;
            const itemId = colorSchemeGridRecord.itemId;
            return ColorScheme.Item.idInFolder(itemId, this._filterFolderId);
        }
    }

    private applyFilter(): void {
        this._grid.clearFilter();

        if (this._filterActive) {
            this._grid.applyFilter((record) => this.filterItems(record));
        }
    }

    private initialiseGrid() {
        const colorSettings = this._recordStore.colorSettings;
        const fieldNames = ColorSchemeGridField.allFieldNames;
        const fieldCount = fieldNames.length;
        const fields = new Array<ColorSchemeGridField>(fieldCount);
        for (let i = 0; i < fieldCount; i++) {
            fields[i] = ColorSchemeGridField.createField(fieldNames[i], colorSettings);
        }
        this._grid.initialiseAllowedFields(fields);
    }

    private customiseSettingsForNewColumn() {
        // no customisation required
    }

    private getMainCellPainter() {
        return this._mainCellPainter;
    }

    private getHeaderCellPainter() {
        return this._headerCellPainter;
    }
}

export namespace ColorSchemeGridNgComponent {
    export type RenderedEvent = (this: void) => void;
    export type RecordFocusEventer = (recordIndex: RevRecordIndex | undefined) => void;
    export type GridClickEventer = (fieldIndex: RevRecordFieldIndex, recordIndex: RevRecordIndex) => void;
    export type ColumnsViewWithsChangedEventer = (this: void) => void;
}
