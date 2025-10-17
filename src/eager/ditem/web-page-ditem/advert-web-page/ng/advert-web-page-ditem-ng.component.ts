import { AfterViewInit, ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { delay1Tick, JsonElement } from '@pbkware/js-utils';
import { AdiNgService, MarketsNgService, SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import { AdvertWebPageNgComponent } from 'content-ng-api';
import { DesktopAccessNgService } from '../../../ng/desktop-access-ng.service';
import { WebPageDitemNgComponentBaseNgDirective } from '../../ng/web-page-ditem-ng-component-base-ng.directive';
import { AdvertWebPageDitemFrame } from '../advert-web-page-ditem-frame';
import { AdvertWebPageNgComponent as AdvertWebPageNgComponent_1 } from '../../../../content/advert/advert-web-page/ng/advert-web-page-ng.component';

@Component({
    selector: 'app-advert-web-page-ditem',
    templateUrl: './advert-web-page-ditem-ng.component.html',
    styleUrls: ['./advert-web-page-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AdvertWebPageNgComponent_1]
})
export class AdvertWebPageDitemNgComponent extends WebPageDitemNgComponentBaseNgDirective implements AfterViewInit, AdvertWebPageDitemFrame.ComponentAccess {
    private static typeInstanceCreateCount = 0;

    private readonly _sanitizer = inject(DomSanitizer);

    private readonly _pageComponentSignal = viewChild.required<AdvertWebPageNgComponent>('page');

    private readonly _frame: AdvertWebPageDitemFrame;

    private _pageComponent: AdvertWebPageNgComponent;

    constructor() {
        super(++AdvertWebPageDitemNgComponent.typeInstanceCreateCount);

        const settingsNgService = inject(SettingsNgService);
        const marketsNgService = inject(MarketsNgService);
        const desktopAccessNgService = inject(DesktopAccessNgService);
        const symbolsNgService = inject(SymbolsNgService);
        const adiNgService = inject(AdiNgService);

        this._frame = new AdvertWebPageDitemFrame(this, settingsNgService.service, marketsNgService.service, this.commandRegisterService,
            desktopAccessNgService.service, symbolsNgService.service, adiNgService.service);

        this.constructLoad(this.getInitialComponentStateJsonElement());
    }

    get ditemFrame() { return this._frame; }
    protected get stateSchemaVersion() { return AdvertWebPageDitemNgComponent.stateSchemaVersion; }

    ngAfterViewInit(): void {
        this._pageComponent = this._pageComponentSignal();

        delay1Tick(() => this.initialise());
    }

    loadPage(safeResourceUrl: SafeResourceUrl) {
        this._pageComponent.loadPage(safeResourceUrl);
    }

    protected override initialise() {
        super.initialise();
        const safeResourceUrl = this._sanitizer.bypassSecurityTrustResourceUrl('https://spectaculix.com');
        this.loadPage(safeResourceUrl);
    }

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

export namespace AdvertWebPageDitemNgComponent {
    export const stateSchemaVersion = '2';
}
