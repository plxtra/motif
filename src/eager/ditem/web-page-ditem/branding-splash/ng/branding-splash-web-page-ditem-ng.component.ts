import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { JsonElement } from '@pbkware/js-utils';
import { AdiNgService, BrandingNgService, MarketsNgService, SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import { DesktopAccessNgService } from '../../../ng/desktop-access-ng.service';
import { WebPageDitemNgComponentBaseNgDirective } from '../../ng/web-page-ditem-ng-component-base-ng.directive';
import { BrandingSplashWebPageDitemFrame } from '../branding-splash-web-page-ditem-frame';

@Component({
    selector: 'app-branding-splash-web-page-ditem',
    templateUrl: './branding-splash-web-page-ditem-ng.component.html',
    styleUrls: ['./branding-splash-web-page-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class BrandingSplashWebPageDitemNgComponent extends WebPageDitemNgComponentBaseNgDirective {
    private static typeInstanceCreateCount = 0;

    public safeResourceUrl: SafeResourceUrl | undefined;

    private readonly _sanitizer = inject(DomSanitizer);

    private readonly _frame: BrandingSplashWebPageDitemFrame;

    constructor() {
        super(++BrandingSplashWebPageDitemNgComponent.typeInstanceCreateCount);

        const brandingNgService = inject<BrandingNgService>(BrandingNgService.injectionToken);
        const settingsNgService = inject(SettingsNgService);
        const marketsNgService = inject(MarketsNgService);
        const desktopAccessNgService = inject(DesktopAccessNgService);
        const symbolsNgService = inject(SymbolsNgService);
        const adiNgService = inject(AdiNgService);

        this._frame = new BrandingSplashWebPageDitemFrame(this, settingsNgService.service, marketsNgService.service, this.commandRegisterService,
            desktopAccessNgService.service, symbolsNgService.service, adiNgService.service);

        this.safeResourceUrl = brandingNgService.startupSplashWebPageSafeResourceUrl;
        this.constructLoad(this.getInitialComponentStateJsonElement());
    }

    get ditemFrame() { return this._frame; }
    protected get stateSchemaVersion() { return BrandingSplashWebPageDitemNgComponent.stateSchemaVersion; }

    protected override finalise() {
        this._frame.finalise();
        super.finalise();
    }

    protected constructLoad(element: JsonElement | undefined) {
        const frameElement = this.tryGetChildFrameJsonElement(element);
        this._frame.constructLoad(frameElement);
    }

    protected save(element: JsonElement) {
        const frameElement = this.createChildFrameJsonElement(element);
        this._frame.save(frameElement);
    }
}

export namespace BrandingSplashWebPageDitemNgComponent {
    export const stateSchemaVersion = '2';
}
