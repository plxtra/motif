import { SvgIconRegistryService } from 'angular-svg-icon';
import { SvgButtonNgComponentModule } from './boolean/ng-api';
import { MenuBarMenuItemComponentDirectiveModule } from './menu-bar/ng/menu-bar-menu-item-component-ng.directive';

export namespace StaticInitialise {
    export function initialise(svgIconRegistryService: SvgIconRegistryService) {
        MenuBarMenuItemComponentDirectiveModule.initialiseStatic();
        SvgButtonNgComponentModule.initialiseStatic(svgIconRegistryService);
    }
}
