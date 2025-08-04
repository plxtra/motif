import { ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { AdaptedRevgridBehavioredColumnSettings, GridField, RowDataArrayGrid, SourcedFieldGrid } from '@plxtra/motif-core';
import { RevSingleHeadingDataRowArraySourcedFieldGrid, RevSubgrid } from 'revgrid';
import { AdaptedRevgridComponentNgDirective } from '../../ng/adapted-revgrid-component-ng.directive';

@Component({
    selector: 'app-row-data-array-grid',
    templateUrl: './row-data-array-grid-ng.component.html',
    styleUrls: ['./row-data-array-grid-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
/** @deprecated Use RowDataArrayGrid directly - see ZenithScanFormulaViewDecodeProgressFrame */
export class RowDataArrayGridNgComponent extends AdaptedRevgridComponentNgDirective implements OnDestroy {
    private _grid: RowDataArrayGrid | undefined;

    constructor() {
        super(1);
    }

    ngOnDestroy() {
        this.destroyGrid();
    }

    createGrid(
        customGridSettings: SourcedFieldGrid.CustomGridSettings,
        createFieldEventer: RevSingleHeadingDataRowArraySourcedFieldGrid.CreateFieldEventer<GridField>,
        customiseSettingsForNewColumnEventer: SourcedFieldGrid.CustomiseSettingsForNewColumnEventer,
        getMainCellPainterEventer: RevSubgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
        getHeaderCellPainterEventer: RevSubgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
    ) {
        this.destroyGrid(); // Can only have one grid so destroy previous one if it exists

        // const gridSettings: Partial<GridSettings> = {
        //     renderFalsy: true,
        //     autoSelectRows: false,
        //     singleRowSelectionMode: false,
        //     columnSelection: false,
        //     rowSelection: false,
        //     restoreColumnSelections: false,
        //     multipleSelections: false,
        //     sortOnDoubleClick: false,
        //     visibleColumnWidthAdjust: true,
        //     halign: 'left',
        //     ...frameGridSettings,
        //     ...AdaptedRevgrid.createSettingsServicePartialGridSettings(this._settingsService, frameGridSettings, undefined),
        // };

        const grid = new RowDataArrayGrid(
            this._settingsService,
            this.rootHtmlElement,
            customGridSettings,
            createFieldEventer,
            customiseSettingsForNewColumnEventer,
            getMainCellPainterEventer,
            getHeaderCellPainterEventer,
            this,
        );

        this._grid = grid;

        grid.activate();

        return grid;
    }

    override destroyGrid() {
        if (this._grid !== undefined) {
            this._grid.destroy();
        }
    }

}
