import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, InjectionToken, Injector, OnDestroy, ValueProvider, viewChild, ViewContainerRef } from '@angular/core';
import { AssertInternalError, delay1Tick, LockOpenListItem, Ok, Result, UnreachableCaseError } from '@pbkware/js-utils';
import { StringUiAction, UiAction } from '@pbkware/ui-action';
import {
    CommandRegisterService,
    IconButtonUiAction,
    InternalCommand,
    StringId,
    Strings
} from '@plxtra/motif-core';
import { CommandRegisterNgService, CoreInjectionTokens } from 'component-services-ng-api';
import { ButtonInputNgComponent, CaptionLabelNgComponent, SvgButtonNgComponent, TabListNgComponent, TextInputNgComponent } from 'controls-ng-api';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';
import { SymbolListDirectoryGridNgComponent } from '../../symbol-list-directory-grid/ng-api';

@Component({
    selector: 'app-open-watchlist-dialog',
    templateUrl: './open-watchlist-dialog-ng.component.html',
    styleUrls: ['./open-watchlist-dialog-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SvgButtonNgComponent, TabListNgComponent, SymbolListDirectoryGridNgComponent, CaptionLabelNgComponent, TextInputNgComponent, ButtonInputNgComponent]
})
export class OpenWatchlistDialogNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    public symbolListVisible = true;
    public watchlistVisible = false;

    readonly caption = inject(OpenWatchlistDialogNgComponent.captionInjectionToken);
    private _cdr = inject(ChangeDetectorRef);

    private readonly _okButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('okButton');
    private readonly _cancelButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('cancelButton');
    private readonly _tabListComponentSignal = viewChild.required<TabListNgComponent>('tabList');
    private readonly _symbolListDirectoryComponentSignal = viewChild.required<SymbolListDirectoryGridNgComponent>('symbolListDirectoryComponent');
    private readonly _listNameLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('listNameLabel');
    private readonly _listNameControlComponentSignal = viewChild.required<TextInputNgComponent>('listNameControl');
    private readonly _openButtonComponentSignal = viewChild.required<ButtonInputNgComponent>('openButton');

    private _okButtonComponent: SvgButtonNgComponent;
    private _cancelButtonComponent: SvgButtonNgComponent;
    private _tabListComponent: TabListNgComponent;
    private _symbolListDirectoryComponent: SymbolListDirectoryGridNgComponent;
    private _listNameLabelComponent: CaptionLabelNgComponent;
    private _listNameControlComponent: TextInputNgComponent;
    private _openButtonComponent: ButtonInputNgComponent;

    private _okUiAction: IconButtonUiAction;
    private _cancelUiAction: IconButtonUiAction;
    private _listNameUiAction: StringUiAction;

    private _visibleExistingListsTypeId: OpenWatchlistDialogNgComponent.ExistingListsTypeId;

    private _closeResolve: ((this: void, scanId: Result<string | undefined>) => void);

    private _listId: string | undefined;

    constructor() {
        const commandRegisterNgService = inject(CommandRegisterNgService);

        super(++OpenWatchlistDialogNgComponent.typeInstanceCreateCount);

        const commandRegisterService = commandRegisterNgService.service;

        this._okUiAction = this.createOkUiAction(commandRegisterService);
        this._cancelUiAction = this.createCancelUiAction(commandRegisterService);
        this._listNameUiAction = this.createListNameUiAction();
    }

    ngOnDestroy() {
        this._okUiAction.finalise();
        this._cancelUiAction.finalise();
        this._listNameUiAction.finalise();
    }

    ngAfterViewInit(): void {
        this._okButtonComponent = this._okButtonComponentSignal();
        this._cancelButtonComponent = this._cancelButtonComponentSignal();
        this._tabListComponent = this._tabListComponentSignal();
        this._symbolListDirectoryComponent = this._symbolListDirectoryComponentSignal();
        this._listNameLabelComponent = this._listNameLabelComponentSignal();
        this._listNameControlComponent = this._listNameControlComponentSignal();
        this._openButtonComponent = this._openButtonComponentSignal();

        delay1Tick(() => this.initialiseComponents());
    }

    open(): OpenWatchlistDialogNgComponent.ClosePromise {
        return new Promise((resolve) => {
            this._closeResolve = resolve;
        });
    }

    private handleActiveTabChangedEvent(tab: TabListNgComponent.Tab, existingListsTypeId: OpenWatchlistDialogNgComponent.ExistingListsTypeId) {
        if (tab.active) {
            this.showExistingListsTypeId(existingListsTypeId);
        }
    }

    private createOkUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.OpenWatchlistDialog_Ok;
        const displayId = StringId.Open;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.ReturnOk);
        action.pushDisabled();
        action.signalEvent = () => this.close(true);
        return action;
    }

    private createCancelUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.OpenWatchlistDialog_Cancel;
        const displayId = StringId.Cancel;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.ReturnCancel);
        action.signalEvent = () => this.close(false);
        return action;
    }

    private createListNameUiAction() {
        const action = new StringUiAction();
        action.pushCaption(Strings[StringId.OpenWatchlistDialog_ListName_Caption]);
        action.pushTitle(Strings[StringId.OpenWatchlistDialog_ListName_Description]);
        action.inputEvent = () => {
            this.focusList(this._listNameUiAction.inputtedText);
        }
        action.commitEvent = (typeId) => {
            this.focusList(this._listNameUiAction.definedValue);
            if (typeId === UiAction.CommitTypeId.Explicit && this._listId !== undefined) {
                this.close(true);
            }
        }

        return action;
    }

    private initialiseComponents() {
        this._okButtonComponent.initialise(this._okUiAction);
        this._cancelButtonComponent.initialise(this._cancelUiAction);
        this._listNameLabelComponent.initialise(this._listNameUiAction);
        this._listNameControlComponent.initialise(this._listNameUiAction);
        this._openButtonComponent.initialise(this._okUiAction);

        const tabDefinitions: TabListNgComponent.TabDefinition[] = [
            {
                caption: Strings[StringId.SymbolList],
                initialActive: true,
                initialDisabled: false,
                activeChangedEventer: (tab) => this.handleActiveTabChangedEvent(tab, OpenWatchlistDialogNgComponent.ExistingListsTypeId.SymbolList),
            },
            // {
            //     caption: Strings[StringId.Watchlist],
            //     initialActive: false,
            //     initialDisabled: false,
            //     activeChangedEventer: (tab) => this.handleActiveTabChangedEvent(tab, OpenWatchlistDialogNgComponent.ExistingListsTypeId.Watchlist),
            // },
        ];
        this._tabListComponent.setTabs(tabDefinitions);

        this._symbolListDirectoryComponent.initialise();
        this._symbolListDirectoryComponent.listFocusedEventer = (id, name) => {
            this._listId = id;
            this._listNameUiAction.pushValue(name);
            this.setOkEnabled(id !== undefined);
        }

        this.showExistingListsTypeId(OpenWatchlistDialogNgComponent.ExistingListsTypeId.SymbolList);
    }

    private showExistingListsTypeId(value: OpenWatchlistDialogNgComponent.ExistingListsTypeId) {
        if (value !== this._visibleExistingListsTypeId) {
            // let selectedListName: string;
            switch (value) {
                case OpenWatchlistDialogNgComponent.ExistingListsTypeId.SymbolList:
                    // selectedListName = this._symbolListDirectoryComponent.selectedListName
                    break;

                case OpenWatchlistDialogNgComponent.ExistingListsTypeId.Watchlist:
                    // selectedListName = this._symbolListDirectoryComponent.selectedListName
                    break;

                default:
                    throw new UnreachableCaseError('OWDNCSELTI74773', value);
            }

            this._visibleExistingListsTypeId = value;
            this._cdr.markForCheck();
        }
    }

    private focusList(idOrName: string) {
        switch (this._visibleExistingListsTypeId) {
            case OpenWatchlistDialogNgComponent.ExistingListsTypeId.SymbolList:
                this._symbolListDirectoryComponent.focusList(idOrName);
                break;
            case OpenWatchlistDialogNgComponent.ExistingListsTypeId.Watchlist:
                this._listId = undefined;
                break;
            default:
                throw new UnreachableCaseError('OWDNCFL74773', this._visibleExistingListsTypeId);
        }
    }

    private setOkEnabled(value: boolean) {
        if (value) {
            this._okUiAction.pushValidOrMissing();
        } else {
            this._okUiAction.pushDisabled();
        }
    }

    private close(ok: boolean) {
        if (ok) {
            const listId = this._listId;
            if (listId === undefined) {
                throw new AssertInternalError('OWDNCC55598');
            } else {
                this._closeResolve(new Ok(listId));
            }
        } else {
            this._closeResolve(new Ok(undefined));
        }
    }
}

export namespace OpenWatchlistDialogNgComponent {
    export const enum ExistingListsTypeId {
        SymbolList,
        Watchlist,
    }

    export type ClosePromise = Promise<Result<string | undefined>>;
    export const captionInjectionToken = new InjectionToken<string>('OpenWatchlistDialogNgComponent.Caption');

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

        const componentRef = container.createComponent(OpenWatchlistDialogNgComponent, { injector });

        const component = componentRef.instance;

        return component.open();
    }
}
