import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Line, UnreachableCaseError, getElementDocumentPositionRect } from '@pbkware/js-utils';
import { ColorScheme } from '@plxtra/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { MenuBarChildItemComponentNgDirective } from '../../../ng/menu-bar-child-item-component-ng.directive';
import { MenuBarMenuItemComponentNgDirective } from '../../../ng/menu-bar-menu-item-component-ng.directive';
import { MenuBarNgService } from '../../../ng/menu-bar-ng.service';

@Component({
    selector: 'app-menu-bar-overlay-child-item',
    templateUrl: './menu-bar-overlay-child-item-ng.component.html',
    styleUrls: ['./menu-bar-overlay-child-item-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class MenuBarOverlayChildItemNgComponent extends MenuBarChildItemComponentNgDirective implements OnInit, OnDestroy {
    private static typeInstanceCreateCount = 0;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        menuBarNgService: MenuBarNgService
    ) {
        super(elRef, ++MenuBarOverlayChildItemNgComponent.typeInstanceCreateCount, cdr, settingsNgService.service, menuBarNgService);
    }

    @HostListener('click', []) handleClickEvent() {
        const contactLine = this.calculateChildMenuContactDocumentLine();
        this.menuItem.onMouseClick(contactLine);
    }

    @HostListener('mouseenter', []) handleMouseEnterEvent() {
        const contactLine = this.calculateChildMenuContactDocumentLine();
        this.menuItem.onMouseEnter(contactLine);
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

    private calculateChildMenuContactDocumentLine(): Line {
        const documentRect = getElementDocumentPositionRect(this.rootHtmlElement);
        const y = documentRect.top + documentRect.height;
        return {
            beginX: documentRect.left,
            beginY: y,
            endX: documentRect.left + documentRect.width - 1,
            endY: y,
        };
    }
}
