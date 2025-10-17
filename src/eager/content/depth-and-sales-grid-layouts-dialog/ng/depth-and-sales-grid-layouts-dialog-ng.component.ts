import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, InjectionToken, Injector, OnDestroy, ValueProvider, ViewContainerRef, inject, viewChild } from '@angular/core';
import { AssertInternalError, LockOpenListItem, ModifierKey, UnreachableCaseError, delay1Tick } from '@pbkware/js-utils';
import { UiAction } from '@pbkware/ui-action';
import {
    AllowedGridField,
    CommandRegisterService,
    EditableColumnLayoutDefinitionColumnList,
    GridField,
    IconButtonUiAction,
    InternalCommand,
    StringId,
    Strings,
    assert
} from '@plxtra/motif-core';
import { CommandRegisterNgService, CoreInjectionTokens } from 'component-services-ng-api';
import { SvgButtonNgComponent, TabListNgComponent } from 'controls-ng-api';
import { DepthAndSalesDitemFrame } from 'ditem-internal-api';
import { RevColumnLayoutDefinition } from 'revgrid';
import { ColumnLayoutEditorNgComponent, allowedFieldsInjectionToken, definitionColumnListInjectionToken } from '../../grid-layout-dialog/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-depth-and-sales-grid-layouts-dialog',
    templateUrl: './depth-and-sales-grid-layouts-dialog-ng.component.html',
    styleUrls: ['./depth-and-sales-grid-layouts-dialog-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SvgButtonNgComponent, TabListNgComponent]
})
export class DepthAndSalesColumnLayoutsDialogNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    readonly caption = inject(DepthAndSalesColumnLayoutsDialogNgComponent.captionInjectionToken);

    private readonly _opener = inject<LockOpenListItem.Opener>(CoreInjectionTokens.lockOpenListItemOpener);
    private readonly _okButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('okButton');
    private readonly _cancelButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('cancelButton');
    private readonly _tabListComponentSignal = viewChild.required<TabListNgComponent>('tabList');
    private readonly _editorContainerSignal = viewChild.required('editorContainer', { read: ViewContainerRef });

    private _cdr = inject(ChangeDetectorRef);

    private _okButtonComponent: SvgButtonNgComponent;
    private _cancelButtonComponent: SvgButtonNgComponent;
    private _tabListComponent: TabListNgComponent;
    private _editorContainer: ViewContainerRef;

    private _commandRegisterService: CommandRegisterService;

    private _depthBidAllowedFields: readonly GridField[];
    private _depthAskAllowedFields: readonly GridField[];
    private _watchlistAllowedFields: readonly GridField[];
    private _tradesAllowedFields: readonly GridField[];

    private _depthBidLayoutDefinition: RevColumnLayoutDefinition;
    private _depthAskLayoutDefinition: RevColumnLayoutDefinition;
    private _watchlistLayoutDefinition: RevColumnLayoutDefinition;
    private _tradesLayoutDefinition: RevColumnLayoutDefinition;

    private _okUiAction: IconButtonUiAction;
    private _cancelUiAction: IconButtonUiAction;

    private _activeSubFrameId: DepthAndSalesColumnLayoutsDialogNgComponent.SubFrameId | undefined;
    private _editorComponent: ColumnLayoutEditorNgComponent | undefined;

    private _closeResolve: (value: DepthAndSalesDitemFrame.ColumnLayoutDefinitions | undefined) => void;
    private _closeReject: (reason: unknown) => void;

    constructor() {
        const commandRegisterNgService = inject(CommandRegisterNgService);
        const allowedFields = inject<DepthAndSalesDitemFrame.AllowedGridFields>(DepthAndSalesColumnLayoutsDialogNgComponent.depthAndSalesAllowedFieldsInjectionToken);
        const oldLayoutDefinitions = inject<DepthAndSalesDitemFrame.ColumnLayoutDefinitions>(DepthAndSalesColumnLayoutsDialogNgComponent.oldDepthAndSalesColumnLayoutDefinitionsInjectionToken);

        super(++DepthAndSalesColumnLayoutsDialogNgComponent.typeInstanceCreateCount);

        this._commandRegisterService = commandRegisterNgService.service;

        this._okUiAction = this.createOkUiAction();
        this._cancelUiAction = this.createCancelUiAction();

        this._depthBidAllowedFields = allowedFields.depth.bid;
        this._depthAskAllowedFields = allowedFields.depth.ask;
        this._watchlistAllowedFields = allowedFields.watchlist;
        this._tradesAllowedFields = allowedFields.trades;

        this._depthBidLayoutDefinition = oldLayoutDefinitions.depth.bid.createCopy();
        this._depthAskLayoutDefinition = oldLayoutDefinitions.depth.ask.createCopy();
        this._watchlistLayoutDefinition = oldLayoutDefinitions.watchlist.createCopy();
        this._tradesLayoutDefinition = oldLayoutDefinitions.trades.createCopy();
    }

    ngOnDestroy() {
        this._okUiAction.finalise();
        this._cancelUiAction.finalise();
    }

    ngAfterViewInit(): void {
        this._okButtonComponent = this._okButtonComponentSignal();
        this._cancelButtonComponent = this._cancelButtonComponentSignal();
        this._tabListComponent = this._tabListComponentSignal();
        this._editorContainer = this._editorContainerSignal();

        delay1Tick(() => this.initialiseComponents());
    }

    open() {
        return new Promise<DepthAndSalesDitemFrame.ColumnLayoutDefinitions | undefined>((resolve, reject) => {
            this._closeResolve = resolve;
            this._closeReject = reject;
        });
    }

    setSubFrameId(value: DepthAndSalesColumnLayoutsDialogNgComponent.SubFrameId) {
        this.checkLoadLayoutFromEditor();

        if (value !== this._activeSubFrameId) {
            switch (value) {
                case DepthAndSalesColumnLayoutsDialogNgComponent.SubFrameId.BidDepth:
                    this._editorComponent = this.recreateEditor(this._depthBidAllowedFields, this._depthBidLayoutDefinition);
                    break;

                case DepthAndSalesColumnLayoutsDialogNgComponent.SubFrameId.AskDepth:
                    this._editorComponent = this.recreateEditor(this._depthAskAllowedFields, this._depthAskLayoutDefinition);
                    break;

                case DepthAndSalesColumnLayoutsDialogNgComponent.SubFrameId.Watchlist:
                    this._editorComponent = this.recreateEditor(this._watchlistAllowedFields, this._watchlistLayoutDefinition);
                    break;

                case DepthAndSalesColumnLayoutsDialogNgComponent.SubFrameId.Trades:
                    this._editorComponent = this.recreateEditor(this._tradesAllowedFields, this._tradesLayoutDefinition);
                    break;

                default:
                    throw new UnreachableCaseError('PGLECCULFED33333', value);
            }

            this._activeSubFrameId = value;
            this._cdr.markForCheck();
        }
    }

    private handleOkSignal(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this.close(true);
    }

    private handleCancelSignal(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this.close(false);
    }

    private handleActiveTabChangedEvent(tab: TabListNgComponent.Tab, subFrameId: DepthAndSalesColumnLayoutsDialogNgComponent.SubFrameId) {
        if (tab.active) {
            this.setSubFrameId(subFrameId);
        }
    }

    private createOkUiAction() {
        const commandName = InternalCommand.Id.PariDepthGridsLayoutEditor_Ok;
        const displayId = StringId.Ok;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.ReturnOk);
        action.signalEvent = (signalTypeId, downKeys) => this.handleOkSignal(signalTypeId, downKeys);
        return action;
    }

    private createCancelUiAction() {
        const commandName = InternalCommand.Id.PariDepthGridsLayoutEditor_Cancel;
        const displayId = StringId.Cancel;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.ReturnCancel);
        action.signalEvent = (signalTypeId, downKeys) => this.handleCancelSignal(signalTypeId, downKeys);
        return action;
    }

    private initialiseComponents() {
        this._okButtonComponent.initialise(this._okUiAction);
        this._cancelButtonComponent.initialise(this._cancelUiAction);

        const tabDefinitions: TabListNgComponent.TabDefinition[] = [
            {
                caption: Strings[StringId.Watchlist],
                initialActive: true,
                initialDisabled: false,
                activeChangedEventer: (tab) => this.handleActiveTabChangedEvent(tab, DepthAndSalesColumnLayoutsDialogNgComponent.SubFrameId.Watchlist),
            },
            {
                caption: Strings[StringId.BidDepth],
                initialActive: false,
                initialDisabled: false,
                activeChangedEventer: (tab) => this.handleActiveTabChangedEvent(tab, DepthAndSalesColumnLayoutsDialogNgComponent.SubFrameId.BidDepth),
            },
            {
                caption: Strings[StringId.AskDepth],
                initialActive: false,
                initialDisabled: false,
                activeChangedEventer: (tab) => this.handleActiveTabChangedEvent(tab, DepthAndSalesColumnLayoutsDialogNgComponent.SubFrameId.AskDepth),
            },
            {
                caption: Strings[StringId.Trades],
                initialActive: false,
                initialDisabled: false,
                activeChangedEventer: (tab) => this.handleActiveTabChangedEvent(tab, DepthAndSalesColumnLayoutsDialogNgComponent.SubFrameId.Trades),
            },
        ];
        this._tabListComponent.setTabs(tabDefinitions);

        this.setSubFrameId(DepthAndSalesColumnLayoutsDialogNgComponent.SubFrameId.Watchlist);
    }

    private recreateEditor(allowedFields: readonly AllowedGridField[], layoutDefinition: RevColumnLayoutDefinition) {
        this.checkLoadLayoutFromEditor();

        if (this._editorComponent !== undefined) {
            this._editorContainer.clear();
        }

        const openerProvider: ValueProvider = {
            provide: CoreInjectionTokens.lockOpenListItemOpener,
            useValue: this._opener,
        };
        const allowedFieldsProvider: ValueProvider = {
            provide: allowedFieldsInjectionToken,
            useValue: allowedFields,
        };

        const definitionColumnList = new EditableColumnLayoutDefinitionColumnList();
        definitionColumnList.load(allowedFields, layoutDefinition, 0);
        const columnListProvider: ValueProvider = {
            provide: definitionColumnListInjectionToken,
            useValue: definitionColumnList,
        };

        const injector = Injector.create({
            providers: [openerProvider, allowedFieldsProvider, columnListProvider],
        });

        const componentRef = this._editorContainer.createComponent(ColumnLayoutEditorNgComponent, { injector });
        const component = componentRef.instance;

        return component;
    }

    private checkLoadLayoutFromEditor() {
        const activeSubFrameId = this._activeSubFrameId;
        if (activeSubFrameId !== undefined) {
            const editorComponent = this._editorComponent;
            if (editorComponent === undefined) {
                throw new AssertInternalError('PGLEDNCCLLFEE33333');
            } else {
                switch (activeSubFrameId) {
                    case DepthAndSalesColumnLayoutsDialogNgComponent.SubFrameId.BidDepth:
                        this._depthBidLayoutDefinition = editorComponent.getColumnLayoutDefinition();
                        break;

                    case DepthAndSalesColumnLayoutsDialogNgComponent.SubFrameId.AskDepth:
                        this._depthAskLayoutDefinition = editorComponent.getColumnLayoutDefinition();
                        break;

                    case DepthAndSalesColumnLayoutsDialogNgComponent.SubFrameId.Watchlist:
                        this._watchlistLayoutDefinition = editorComponent.getColumnLayoutDefinition();
                        break;

                    case DepthAndSalesColumnLayoutsDialogNgComponent.SubFrameId.Trades:
                        this._tradesLayoutDefinition = editorComponent.getColumnLayoutDefinition();
                        break;

                    default:
                        throw new UnreachableCaseError('PGLECCULFEU33333', activeSubFrameId);
                }
            }
        }
    }

    private close(ok: boolean) {
        if (ok) {
            this.checkLoadLayoutFromEditor();
            const layouts: DepthAndSalesDitemFrame.ColumnLayoutDefinitions = {
                watchlist: this._watchlistLayoutDefinition,
                depth: {
                    bid: this._depthBidLayoutDefinition,
                    ask: this._depthAskLayoutDefinition,
                },
                trades: this._tradesLayoutDefinition,
            };
            this._closeResolve(layouts);
        } else {
            this._closeResolve(undefined);
        }
    }
}

export namespace DepthAndSalesColumnLayoutsDialogNgComponent {
    export const enum SubFrameId {
        BidDepth,
        AskDepth,
        Watchlist,
        Trades,
    }

    export type ClosePromise = Promise<DepthAndSalesDitemFrame.ColumnLayoutDefinitions | undefined>;

    export const captionInjectionToken = new InjectionToken<string>('DepthAndSalesColumnLayoutsDialogNgComponent.caption');
    export const depthAndSalesAllowedFieldsInjectionToken = new InjectionToken<DepthAndSalesDitemFrame.AllowedGridFields>('DepthAndSalesColumnLayoutsDialogNgComponent.allowedFields');
    export const oldDepthAndSalesColumnLayoutDefinitionsInjectionToken = new InjectionToken<DepthAndSalesDitemFrame.ColumnLayoutDefinitions>('DepthAndSalesColumnLayoutsDialogNgComponent.allowedFields');

    export function open(
        container: ViewContainerRef,
        opener: LockOpenListItem.Opener,
        caption: string,
        allowedFieldsAndLayoutDefinition: DepthAndSalesDitemFrame.AllowedFieldsAndLayoutDefinitions
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
        const allowedFields: DepthAndSalesDitemFrame.AllowedGridFields = {
            watchlist: allowedFieldsAndLayoutDefinition.watchlist.allowedFields,
            depth: {
                bid: allowedFieldsAndLayoutDefinition.depth.bid.allowedFields,
                ask: allowedFieldsAndLayoutDefinition.depth.ask.allowedFields,
            },
            trades: allowedFieldsAndLayoutDefinition.trades.allowedFields,
        };

        const columnLayoutDefinitions: DepthAndSalesDitemFrame.ColumnLayoutDefinitions = {
            watchlist: allowedFieldsAndLayoutDefinition.watchlist,
            depth: {
                bid: allowedFieldsAndLayoutDefinition.depth.bid,
                ask: allowedFieldsAndLayoutDefinition.depth.ask,
            },
            trades: allowedFieldsAndLayoutDefinition.trades,
        };

        const allowedFieldsProvider: ValueProvider = {
            provide: depthAndSalesAllowedFieldsInjectionToken,
            useValue: allowedFields,
        };
        const oldBidAskLayoutDefinitionProvider: ValueProvider = {
            provide: oldDepthAndSalesColumnLayoutDefinitionsInjectionToken,
            useValue: columnLayoutDefinitions,
        };
        const injector = Injector.create({
            providers: [openerProvider, captionProvider, allowedFieldsProvider, oldBidAskLayoutDefinitionProvider],
        });

        const componentRef = container.createComponent(DepthAndSalesColumnLayoutsDialogNgComponent, { injector });
        assert(componentRef.instance instanceof DepthAndSalesColumnLayoutsDialogNgComponent, 'ID:157271511202');

        const component = componentRef.instance;

        return component.open();
    }
}
