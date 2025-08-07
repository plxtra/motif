import { AssertInternalError, Integer, LockOpenListItem } from '@pbkware/js-utils';
import {
    AdaptedRevgridBehavioredColumnSettings,
    Badness,
    CellPainterFactoryService,
    CheckboxTextFormattableValueRecordGridCellEditor,
    CheckboxTextFormattableValueRecordGridCellPainter,
    DataSourceDefinition,
    DataSourceOrReferenceDefinition,
    GridField,
    LockOpenNotificationChannelList,
    NotificationChannelsService,
    ReferenceableColumnLayoutsService,
    ReferenceableDataSourcesService,
    SettingsService,
    StringId,
    Strings,
    TableFieldSourceDefinitionCachingFactory,
    TableRecordSourceFactory,
    TextFormattableValueRecordGridCellPainter,
    TextHeaderCellPainter,
    TextTextFormattableValueCellPainter
} from '@plxtra/motif-core';
import { ToastService } from 'component-services-internal-api';
import { RevCellEditor, RevColumnLayoutOrReferenceDefinition, RevSourcedFieldCustomHeadings, RevSubgrid, RevViewCell } from 'revgrid';
import { GridSourceFrame } from '../../grid-source/internal-api';
import { LegacyTableRecordSourceDefinitionFactoryService } from '../../legacy-table-record-source-definition-factory-service';
import { LockOpenNotificationChannelListTableRecordSource } from './table/lock-open-notification-channel-list-table-record-source';
import { LockOpenNotificationChannelListTableRecordSourceDefinition } from './table/lock-open-notification-channel-list-table-record-source-definition';

export class LockOpenNotificationChannelsGridFrame extends GridSourceFrame {
    recordFocusedEventer: LockOpenNotificationChannelsGridFrame.RecordFocusedEventer | undefined
    selectionChangedEventer: LockOpenNotificationChannelsGridFrame.SelectionChangedEventer | undefined;

    private _list: LockOpenNotificationChannelList;

    private _gridHeaderCellPainter: TextHeaderCellPainter;
    private _gridMainCellPainter: TextFormattableValueRecordGridCellPainter<TextTextFormattableValueCellPainter>;
    private _visibleCheckboxPainter: CheckboxTextFormattableValueRecordGridCellPainter;
    private _visibleCheckboxEditor: CheckboxTextFormattableValueRecordGridCellEditor;
    private _widthEditor: RevCellEditor<AdaptedRevgridBehavioredColumnSettings, GridField>;

    constructor(
        settingsService: SettingsService,
        notificationChannelsService: NotificationChannelsService,
        private readonly _customHeadingsService: RevSourcedFieldCustomHeadings | undefined,
        referenceableColumnLayoutsService: ReferenceableColumnLayoutsService,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        tableRecordSourceDefinitionFactoryService: LegacyTableRecordSourceDefinitionFactoryService,
        tableRecordSourceFactory: TableRecordSourceFactory,
        referenceableGridSourcesService: ReferenceableDataSourcesService,
        cellPainterFactoryService: CellPainterFactoryService,
        toastService: ToastService,
        frameOpener: LockOpenListItem.Opener,
    ) {
        super(
            settingsService,
            referenceableColumnLayoutsService,
            tableFieldSourceDefinitionCachingFactory,
            tableRecordSourceDefinitionFactoryService,
            tableRecordSourceFactory,
            referenceableGridSourcesService,
            cellPainterFactoryService,
            toastService,
        );
    }

    get list() { return this._list; }
    get selectedCount() { return this.grid.getSelectedRowCount(this.grid.mainSubgrid, true); }

    override initialise(opener: LockOpenListItem.Opener, previousLayoutDefinition: RevColumnLayoutOrReferenceDefinition | undefined, keepPreviousLayoutIfPossible: boolean): void {
        super.initialise(opener, previousLayoutDefinition, keepPreviousLayoutIfPossible);

        const openPromise = this.tryOpenDefault(true);
        openPromise.then(
            (openResult) => {
                if (openResult.isErr()) {
                    this._toastService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.NotificationChannelsGrid]}: ${openResult.error}`);
                }
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'LONCGFI44332'); }
        );
    }

    override createGridAndCellPainters(gridHostElement: HTMLElement) {
        const grid = this.createGrid(
            gridHostElement,
            {
                fixedColumnCount: 1,
                mouseColumnSelectionEnabled: false,
                switchNewRectangleSelectionToRowOrColumn: 'row',
            },
            (columnSettings) => this.customiseSettingsForNewGridColumn(columnSettings),
            (viewCell) => this.getGridMainCellPainter(viewCell),
            (viewCell) => this.getGridHeaderCellPainter(viewCell),
        );

        this._gridHeaderCellPainter = this._cellPainterFactoryService.createTextHeader(grid, grid.headerDataServer);
        this._gridMainCellPainter = this._cellPainterFactoryService.createTextTextFormattableValueRecordGrid(grid, grid.mainDataServer);
        this._visibleCheckboxPainter = this._cellPainterFactoryService.createCheckboxTextFormattableValueRecordGrid(grid, grid.mainDataServer);
        this._visibleCheckboxEditor = new CheckboxTextFormattableValueRecordGridCellEditor(this._settingsService, grid, grid.mainDataServer);

        grid.focus.getCellEditorEventer = (
            field,
            subgridRowIndex,
            subgrid,
            readonly,
            viewCell
        ) => this.getCellEditor(field, subgridRowIndex, subgrid, readonly, viewCell);

        grid.selectionChangedEventer = () => {
            if (this.selectionChangedEventer !== undefined) {
                this.selectionChangedEventer();
            }
        }

        return grid;
    }

    getLockerScanAttachedNotificationChannelAt(index: Integer) {
        return this._list.getAt(index);
    }

    getSelectedChannelIds() {
        const grid = this.grid;
        const rowIndices = grid.selection.getSubgridRowIndices(this.grid.mainSubgrid);
        const count = rowIndices.length;
        const channelIds = new Array<string>(count);
        for (let i = 0; i < count; i++) {
            const rowIndex = rowIndices[i];
            const recordIndex = grid.rowToRecordIndex(rowIndex);
            const channel = this._list.getAt(recordIndex);
            channelIds[i] = channel.id;
        }

        return channelIds;
    }

    protected override getDefaultGridSourceOrReferenceDefinition() {
        return this.createListGridSourceOrReferenceDefinition(undefined);
    }

    protected override processGridSourceOpenedEvent() {
        const recordSource = this.grid.openedRecordSource as LockOpenNotificationChannelListTableRecordSource;
        this._list = recordSource.recordList;
    }

    protected override setBadness(value: Badness) {
        if (!Badness.isUsable(value)) {
            throw new AssertInternalError('GLECFSB42112', Badness.generateText(value));
        }
    }

    protected override hideBadnessWithVisibleDelay(_badness: Badness) {
        // always hidden as never bad
    }

    protected override processRecordFocusedEvent(newRecordIndex: Integer | undefined, _oldRecordIndex: Integer | undefined) {
        if (this.recordFocusedEventer !== undefined) {
            this.recordFocusedEventer(newRecordIndex);
        }
    }

    private createListGridSourceOrReferenceDefinition(layoutDefinition: RevColumnLayoutOrReferenceDefinition | undefined) {
        const tableRecordSourceDefinition = new LockOpenNotificationChannelListTableRecordSourceDefinition(
            this._customHeadingsService,
            this._tableFieldSourceDefinitionCachingFactory,
        );
        const dataSourceDefinition = new DataSourceDefinition(tableRecordSourceDefinition, layoutDefinition, undefined);
        return new DataSourceOrReferenceDefinition(dataSourceDefinition);
    }

    private customiseSettingsForNewGridColumn(_columnSettings: AdaptedRevgridBehavioredColumnSettings) {
        // no customisation
    }

    private getGridHeaderCellPainter(_viewCell: RevViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>) {
        return this._gridHeaderCellPainter;
    }

    private getGridMainCellPainter(viewCell: RevViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>) {
        return this._gridMainCellPainter;
    }

    private getCellEditor(
        field: GridField,
        subgridRowIndex: Integer,
        _subgrid: RevSubgrid<AdaptedRevgridBehavioredColumnSettings, GridField>,
        readonly: boolean,
        _viewCell: RevViewCell<AdaptedRevgridBehavioredColumnSettings, GridField> | undefined
    ): RevCellEditor<AdaptedRevgridBehavioredColumnSettings, GridField> | undefined {
        return this.tryGetCellEditor(field.definition.sourcelessName, readonly, subgridRowIndex);
    }

    private tryGetCellEditor(sourcelesFieldName: string, readonly: boolean, subgridRowIndex: Integer): RevCellEditor<AdaptedRevgridBehavioredColumnSettings, GridField> | undefined {
        // if (sourcelesFieldName === EditableColumnLayoutDefinitionColumn.FieldName.visible) {
        //     this._visibleCheckboxEditor.readonly = readonly || subgridRowIndex < this._recordList.fixedColumnCount;
        //     return this._visibleCheckboxEditor;
        // } else {
        //     if (sourcelesFieldName === EditableColumnLayoutDefinitionColumn.FieldName.width) {
        //         this._widthEditor.readonly = readonly
        //         return this._widthEditor;
        //     } else {
                return undefined;
        //     }
        // }
    }
}

export namespace LockOpenNotificationChannelsGridFrame {
    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;
    export type SelectionChangedEventer = (this: void) => void;
}
