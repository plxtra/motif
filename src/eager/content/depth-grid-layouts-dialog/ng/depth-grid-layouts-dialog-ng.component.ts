import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, InjectionToken, Injector, OnDestroy, ValueProvider, ViewContainerRef, inject, viewChild } from '@angular/core';
import { AssertInternalError, LockOpenListItem, UnreachableCaseError, delay1Tick } from '@pbkware/js-utils';
import {
    AllowedGridField,
    BidAskAllowedSourcedFieldsColumnLayoutDefinitions,
    BidAskColumnLayoutDefinitions,
    CommandRegisterService,
    EditableColumnLayoutDefinitionColumnList,
    IconButtonUiAction,
    InternalCommand,
    OrderSideId,
    StringId,
    Strings,
    assert
} from '@plxtra/motif-core';
import { CommandRegisterNgService, CoreInjectionTokens } from 'component-services-ng-api';
import { SvgButtonNgComponent, TabListNgComponent } from 'controls-ng-api';
import { RevColumnLayoutDefinition } from 'revgrid';
import { BidAskAllowedGridFields, ColumnLayoutEditorNgComponent, allowedFieldsInjectionToken, bidAskAllowedFieldsInjectionToken, definitionColumnListInjectionToken, oldBidAskLayoutDefinitionInjectionToken } from '../../grid-layout-dialog/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-depth-grid-layouts-dialog',
    templateUrl: './depth-grid-layouts-dialog-ng.component.html',
    styleUrls: ['./depth-grid-layouts-dialog-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DepthColumnLayoutsDialogNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    readonly caption = inject(DepthColumnLayoutsDialogNgComponent.captionInjectionToken);

    private readonly _opener = inject<LockOpenListItem.Opener>(CoreInjectionTokens.lockOpenListItemOpener);
    private readonly _bidAskAllowedFields = inject<BidAskAllowedGridFields>(bidAskAllowedFieldsInjectionToken);
    private readonly _oldBidAskLayoutDefinitions = inject<BidAskColumnLayoutDefinitions>(oldBidAskLayoutDefinitionInjectionToken);


    private readonly _okButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('okButton');
    private readonly _cancelButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('cancelButton');
    private readonly _tabListComponentSignal = viewChild.required<TabListNgComponent>('tabList');
    private readonly _editorContainerSignal = viewChild.required('editorContainer', { read: ViewContainerRef });

    private _cdr = inject(ChangeDetectorRef);

    private _okButtonComponent: SvgButtonNgComponent;
    private _cancelButtonComponent: SvgButtonNgComponent;
    private _tabListComponent: TabListNgComponent;
    private _editorContainer: ViewContainerRef;

    private readonly _commandRegisterService: CommandRegisterService;

    private readonly _okUiAction: IconButtonUiAction;
    private readonly _cancelUiAction: IconButtonUiAction;

    private _closeResolve: (value: BidAskColumnLayoutDefinitions | undefined) => void;
    private _closeReject: (reason: unknown) => void;

    private _bidLayoutDefinition: RevColumnLayoutDefinition;
    private _askLayoutDefinition: RevColumnLayoutDefinition;
    private _sideId: OrderSideId | undefined;
    private _editorComponent: ColumnLayoutEditorNgComponent | undefined;

    constructor() {
        const commandRegisterNgService = inject(CommandRegisterNgService);

        super(++DepthColumnLayoutsDialogNgComponent.typeInstanceCreateCount);

        this._commandRegisterService = commandRegisterNgService.service;

        this._okUiAction = this.createOkUiAction();
        this._cancelUiAction = this.createCancelUiAction();

        this._bidLayoutDefinition = this._oldBidAskLayoutDefinitions.bid.createCopy();
        this._askLayoutDefinition = this._oldBidAskLayoutDefinitions.ask.createCopy();
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

        delay1Tick(() => this.initialiseChildComponents());
    }

    open(): DepthColumnLayoutsDialogNgComponent.ClosePromise {
        return new Promise<BidAskColumnLayoutDefinitions | undefined>((resolve, reject) => {
            this._closeResolve = resolve;
            this._closeReject = reject;
        });
    }

    private handleOkSignal() {
        this.close(true);
    }

    private handleCancelSignal() {
        this.close(false);
    }

    private handleActiveTabChangedEvent(tab: TabListNgComponent.Tab, sideId: OrderSideId) {
        if (tab.active) {
            this.setSideId(sideId);
        }
    }

    private createOkUiAction() {
        const commandName = InternalCommand.Id.DepthGridsLayoutEditor_Ok;
        const displayId = StringId.Ok;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.ReturnOk);
        action.signalEvent = () => this.handleOkSignal();
        return action;
    }

    private createCancelUiAction() {
        const commandName = InternalCommand.Id.DepthGridsLayoutEditor_Cancel;
        const displayId = StringId.Cancel;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.ReturnCancel);
        action.signalEvent = () => this.handleCancelSignal();
        return action;
    }

    private initialiseChildComponents() {
        this._okButtonComponent.initialise(this._okUiAction);
        this._cancelButtonComponent.initialise(this._cancelUiAction);

        const tabDefinitions: TabListNgComponent.TabDefinition[] = [
            {
                caption: Strings[StringId.BidDepth],
                initialActive: true,
                initialDisabled: false,
                activeChangedEventer: (tab) => this.handleActiveTabChangedEvent(tab, OrderSideId.Bid),
            },
            {
                caption: Strings[StringId.AskDepth],
                initialActive: false,
                initialDisabled: false,
                activeChangedEventer: (tab) => this.handleActiveTabChangedEvent(tab, OrderSideId.Ask),
            },
        ];
        this._tabListComponent.setTabs(tabDefinitions);

        this.setSideId(OrderSideId.Bid);
    }

    private setSideId(value: OrderSideId) {
        this.checkLoadLayoutFromEditor();

        if (value !== this._sideId) {
            switch (value) {
                case OrderSideId.Bid:
                    this._editorComponent = this.recreateEditor(this._bidAskAllowedFields.bid, this._oldBidAskLayoutDefinitions.bid);
                    break;

                case OrderSideId.Ask:
                    this._editorComponent = this.recreateEditor(this._bidAskAllowedFields.ask, this._oldBidAskLayoutDefinitions.ask);
                    break;

                default:
                    throw new UnreachableCaseError('DGLECSSI3232887', value);
            }

            this._sideId = value;
            this._cdr.markForCheck();
        }
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
        const sideId = this._sideId;
        if (sideId !== undefined) {
            const editorComponent = this._editorComponent;
            if (editorComponent === undefined) {
                throw new AssertInternalError('DGLEDNCCLLFEE23235');
            } else {
                switch (sideId) {
                    case OrderSideId.Bid:
                        this._bidLayoutDefinition = editorComponent.getColumnLayoutDefinition();
                        break;

                    case OrderSideId.Ask:
                        this._askLayoutDefinition = editorComponent.getColumnLayoutDefinition();
                        break;

                    default:
                        throw new UnreachableCaseError('DGLECCULFEU23235', sideId);
                }
            }
        }
    }

    private close(ok: boolean) {
        if (ok) {
            this.checkLoadLayoutFromEditor();
            const layouts: BidAskColumnLayoutDefinitions = {
                bid: this._bidLayoutDefinition,
                ask: this._askLayoutDefinition,
            };
            this._closeResolve(layouts);
        } else {
            this._closeResolve(undefined);
        }
    }
}

export namespace DepthColumnLayoutsDialogNgComponent {
    export type ClosePromise = Promise<BidAskColumnLayoutDefinitions | undefined>;
    export const captionInjectionToken = new InjectionToken<string>('DepthColumnLayoutsEditorDialogNgComponent.Caption');

    export function open(
        container: ViewContainerRef,
        opener: LockOpenListItem.Opener,
        caption: string,
        allowedSourcedFieldsColumnLayoutDefinitions: BidAskAllowedSourcedFieldsColumnLayoutDefinitions,
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
        const bidAskAllowedFields: BidAskAllowedGridFields = {
            bid: allowedSourcedFieldsColumnLayoutDefinitions.bid.allowedFields,
            ask: allowedSourcedFieldsColumnLayoutDefinitions.ask.allowedFields,
        };

        const bidAskColumnLayoutDefinitions: BidAskColumnLayoutDefinitions = {
            bid: allowedSourcedFieldsColumnLayoutDefinitions.bid,
            ask: allowedSourcedFieldsColumnLayoutDefinitions.ask,
        };

        const bidAskAllowedFieldsProvider: ValueProvider = {
            provide: bidAskAllowedFieldsInjectionToken,
            useValue: bidAskAllowedFields,
        };
        const oldBidAskLayoutDefinitionProvider: ValueProvider = {
            provide: oldBidAskLayoutDefinitionInjectionToken,
            useValue: bidAskColumnLayoutDefinitions,
        };
        const injector = Injector.create({
            providers: [openerProvider, captionProvider, bidAskAllowedFieldsProvider, oldBidAskLayoutDefinitionProvider],
        });

        const componentRef = container.createComponent(DepthColumnLayoutsDialogNgComponent, { injector });
        assert(componentRef.instance instanceof DepthColumnLayoutsDialogNgComponent, 'ID:157271511202');

        const component = componentRef.instance;

        return component.open();
    }
}
