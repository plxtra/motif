import { InjectionToken } from '@angular/core';
import { AdaptedRevgridBehavioredColumnSettings, GridField, SourcedFieldGrid } from '@plxtra/motif-core';
import { RevSubgrid } from 'revgrid';

export interface GridSourceFrameGridParametersService {
    customGridSettings: SourcedFieldGrid.CustomGridSettings;
    customiseSettingsForNewColumnEventer: SourcedFieldGrid.CustomiseSettingsForNewColumnEventer;
    getMainCellPainterEventer: RevSubgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>;
    getHeaderCellPainterEventer: RevSubgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>;
}

export namespace GridSourceFrameGridParametersService {
    const tokenName = 'gridSourceFrameGridParametersService';
    export const injectionToken = new InjectionToken<GridSourceFrameGridParametersService>(tokenName);
}
