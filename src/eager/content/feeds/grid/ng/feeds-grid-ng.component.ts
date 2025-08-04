import { ChangeDetectionStrategy, Component, inject, Injector, ValueProvider, ViewContainerRef } from '@angular/core';
import { delay1Tick, LockOpenListItem } from '@pbkware/js-utils';
import { CoreInjectionTokens } from 'component-services-ng-api';
import { DelayedBadnessGridSourceNgDirective } from '../../../delayed-badness-grid-source/ng-api';
import { ContentNgService } from '../../../ng/content-ng.service';
import { FeedsGridFrame } from '../feeds-grid-frame';

@Component({
    selector: 'app-feeds-grid',
    templateUrl: './feeds-grid-ng.component.html',
    styleUrls: ['./feeds-grid-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class FeedsGridNgComponent extends DelayedBadnessGridSourceNgDirective {
    private static typeInstanceCreateCount = 0;

    declare frame: FeedsGridFrame;

    private readonly _opener = inject<LockOpenListItem.Opener>(CoreInjectionTokens.lockOpenListItemOpener);

    constructor() {
        const contentNgService = inject(ContentNgService);

        const frame = contentNgService.createFeedsGridFrame();
        super(++FeedsGridNgComponent.typeInstanceCreateCount, frame);
        frame.setComponentAccess(this);
    }

    protected override processAfterViewInit(): void {
        super.processAfterViewInit()
        delay1Tick(() => this.frame.initialise(this._opener, undefined, false));
    }
}

export namespace FeedsGridNgComponent {
    export function create(container: ViewContainerRef, opener: LockOpenListItem.Opener) {
        container.clear();

        const openerProvider: ValueProvider = {
            provide: CoreInjectionTokens.lockOpenListItemOpener,
            useValue: opener,
        };
        const injector = Injector.create({
            providers: [openerProvider],
        });

        container.createComponent(FeedsGridNgComponent, { injector });
    }
}
