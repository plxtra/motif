import { ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { getElementDocumentPositionRect, Line, UnreachableCaseError } from '@pbkware/js-utils';
import { ColorScheme } from '@plxtra/motif-core';
import { MenuBarChildItemComponentNgDirective } from '../../../ng/menu-bar-child-item-component-ng.directive';
import { MenuBarMenuItemComponentNgDirective } from '../../../ng/menu-bar-menu-item-component-ng.directive';

@Component({
    selector: 'app-menu-bar-root-child-item',
    templateUrl: './menu-bar-root-child-item-ng.component.html',
    styleUrls: ['./menu-bar-root-child-item-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class MenuBarRootChildItemNgComponent extends MenuBarChildItemComponentNgDirective implements OnInit, OnDestroy {
    private static typeInstanceCreateCount = 0;

    constructor() {
        super(++MenuBarRootChildItemNgComponent.typeInstanceCreateCount);
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
                this.bkgdColor = this.colorSettings.getBkgd(ColorScheme.ItemId.MenuBar_RootItem_Disabled);
                this.foreColor = this.colorSettings.getFore(ColorScheme.ItemId.MenuBar_RootItem_Disabled);
                break;
            }
            case MenuBarMenuItemComponentNgDirective.StateColorId.Enabled: {
                this.bkgdColor = this.colorSettings.getBkgd(ColorScheme.ItemId.MenuBar_RootItem);
                this.foreColor = this.colorSettings.getFore(ColorScheme.ItemId.MenuBar_RootItem);
                break;
            }
            case MenuBarMenuItemComponentNgDirective.StateColorId.Highlighed: {
                this.bkgdColor = this.colorSettings.getBkgd(ColorScheme.ItemId.MenuBar_RootItemHighlighted);
                this.foreColor = this.colorSettings.getFore(ColorScheme.ItemId.MenuBar_RootItemHighlighted);
                break;
            }
            default:
                throw new UnreachableCaseError('MBRCICAC23399904', this.stateColorId);
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
