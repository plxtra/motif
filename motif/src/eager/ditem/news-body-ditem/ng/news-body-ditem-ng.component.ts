import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy } from '@angular/core';
import { JsonElement } from '@pbkware/js-utils';
import { AdiNgService, CommandRegisterNgService, MarketsNgService, SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import { ComponentContainer } from 'golden-layout';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { NewsBodyDitemFrame } from '../news-body-ditem-frame';

@Component({
    selector: 'app-news-body-ditem',
    templateUrl: './news-body-ditem-ng.component.html',
    styleUrls: ['./news-body-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class NewsBodyDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    private _frame: NewsBodyDitemFrame;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        @Inject(BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken) container: ComponentContainer,
        settingsNgService: SettingsNgService,
        marketsNgService: MarketsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        desktopAccessNgService: DesktopAccessNgService,
        symbolsNgService: SymbolsNgService,
        adiNgService: AdiNgService,
    ) {
        super(
            elRef,
            ++NewsBodyDitemNgComponent.typeInstanceCreateCount,
            cdr,
            container,
            settingsNgService.service,
            commandRegisterNgService.service
        );


        this._frame = new NewsBodyDitemFrame(this, this.settingsService, marketsNgService.service, this.commandRegisterService,
            desktopAccessNgService.service, symbolsNgService.service, adiNgService.service);

        this.constructLoad(this.getInitialComponentStateJsonElement());
    }

    get ditemFrame() { return this._frame; }
    protected get stateSchemaVersion() { return NewsBodyDitemNgComponent.stateSchemaVersion; }

    ngOnDestroy() {
        this.finalise();
    }

    protected override initialise() {
        super.initialise();
    }

    protected override finalise() {
        this._frame.finalise();
        super.finalise();
    }

    protected constructLoad(element: JsonElement | undefined) {
        // nothing to load
    }

    protected save(element: JsonElement) {
        // nothing to save
    }
}

export namespace NewsBodyDitemNgComponent {
    export const stateSchemaVersion = '2';
}
