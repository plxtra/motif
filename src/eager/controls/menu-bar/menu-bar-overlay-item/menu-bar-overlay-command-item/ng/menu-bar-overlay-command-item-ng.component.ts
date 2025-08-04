import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { UnreachableCaseError } from '@pbkware/js-utils';
import { ColorScheme } from '@plxtra/motif-core';
import { MenuBarCommandItemComponentNgDirective } from '../../../ng/menu-bar-command-item-component-ng.directive';
import { MenuBarMenuItemComponentNgDirective } from '../../../ng/menu-bar-menu-item-component-ng.directive';

@Component({
    selector: 'app-menu-bar-overlay-command-item',
    templateUrl: './menu-bar-overlay-command-item-ng.component.html',
    styleUrls: ['./menu-bar-overlay-command-item-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class MenuBarOverlayCommandItemNgComponent extends MenuBarCommandItemComponentNgDirective implements OnInit, OnDestroy {
    private static typeInstanceCreateCount = 0;

    constructor() {
        super(++MenuBarOverlayCommandItemNgComponent.typeInstanceCreateCount);
    }

    ngOnInit() {
        this.initialise();
    }

    ngOnDestroy() {
        this.finalise();
    }

    protected applyColors() {
        switch (this.stateColorId) {
            case MenuBarMenuItemComponentNgDirective.StateColorId.Disabled: {
                this.bkgdColor = this.colorSettings.getBkgd(ColorScheme.ItemId.MenuBar_OverlayItem_Disabled);
                this.foreColor = this.colorSettings.getFore(ColorScheme.ItemId.MenuBar_OverlayItem_Disabled);
                break;
            }
            case MenuBarMenuItemComponentNgDirective.StateColorId.Enabled: {
                this.bkgdColor = this.colorSettings.getBkgd(ColorScheme.ItemId.MenuBar_OverlayItem);
                this.foreColor = this.colorSettings.getFore(ColorScheme.ItemId.MenuBar_OverlayItem);
                break;
            }
            case MenuBarMenuItemComponentNgDirective.StateColorId.Highlighed: {
                this.bkgdColor = this.colorSettings.getBkgd(ColorScheme.ItemId.MenuBar_OverlayItemHighlighted);
                this.foreColor = this.colorSettings.getFore(ColorScheme.ItemId.MenuBar_OverlayItemHighlighted);
                break;
            }
            default:
                throw new UnreachableCaseError('MBOCICAC23399934', this.stateColorId);
        }
    }
}
