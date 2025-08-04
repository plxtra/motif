import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ColorScheme } from '@plxtra/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { MenuBarRenderItemComponentNgDirective } from '../../../ng/menu-bar-render-item-component-ng.directive';

@Component({
    selector: 'app-menu-bar-overlay-divider-item',
    templateUrl: './menu-bar-overlay-divider-item-ng.component.html',
    styleUrls: ['./menu-bar-overlay-divider-item-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class MenuBarOverlayDividerItemNgComponent extends MenuBarRenderItemComponentNgDirective {
    private static typeInstanceCreateCount = 0;

    public lineBkgdColor: string;

    constructor() {
        super(++MenuBarOverlayDividerItemNgComponent.typeInstanceCreateCount);

        const settingsNgService = inject(SettingsNgService);
        this.lineBkgdColor = settingsNgService.service.color.getFore(ColorScheme.ItemId.MenuBar_OverlayItem_Disabled);
    }
}
