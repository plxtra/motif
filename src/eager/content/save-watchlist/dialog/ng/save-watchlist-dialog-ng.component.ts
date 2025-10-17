import { AfterViewInit, ChangeDetectionStrategy, Component, InjectionToken, Injector, OnDestroy, ValueProvider, ViewContainerRef } from '@angular/core';
import { LockOpenListItem } from '@pbkware/js-utils';
import { CoreInjectionTokens } from 'component-services-ng-api';
import { RevDataSourceOrReferenceDefinition } from 'revgrid';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-save-watchlist-dialog',
    templateUrl: './save-watchlist-dialog-ng.component.html',
    styleUrls: ['./save-watchlist-dialog-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaveWatchlistDialogNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    private static typeInstanceCreateCount = 0;

    private _closeResolve: (value: RevDataSourceOrReferenceDefinition.SaveAsDefinition | undefined) => void;

    constructor() {
        super(++SaveWatchlistDialogNgComponent.typeInstanceCreateCount);
    }

    // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
    ngAfterViewInit() {
        // delay1Tick(() => this.initialiseComponents());
    }

    // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
    ngOnDestroy() {
        // this._okUiAction.finalise();
        // this._cancelUiAction.finalise();
    }

    open(): SaveWatchlistDialogNgComponent.ClosePromise {
        return new Promise<RevDataSourceOrReferenceDefinition.SaveAsDefinition | undefined>((resolve) => {
            this._closeResolve = resolve;
        });
    }
}

export namespace SaveWatchlistDialogNgComponent {
    export type ClosePromise = Promise<RevDataSourceOrReferenceDefinition.SaveAsDefinition | undefined>;
    export const captionInjectionToken = new InjectionToken<string>('SaveWatchlistDialogNgComponent.Caption');

    export function open(
        container: ViewContainerRef,
        opener: LockOpenListItem.Opener,
        caption: string,
    ): ClosePromise {
        container.clear();

        const openerProvider: ValueProvider = {
            provide: CoreInjectionTokens.lockOpenListItemOpener,
            useValue: opener,
        };
        const captionProvider: ValueProvider = {
            provide: captionInjectionToken,
            useValue: caption,
        }
        const injector = Injector.create({
            providers: [openerProvider, captionProvider],
        });

        const componentRef = container.createComponent(SaveWatchlistDialogNgComponent, { injector });

        const component = componentRef.instance;

        return component.open();
    }
}
