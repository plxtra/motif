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
    Strings
} from '@plxtra/motif-core';
import { CommandRegisterNgService, CoreInjectionTokens } from 'component-services-ng-api';
import { SvgButtonNgComponent, TabListNgComponent } from 'controls-ng-api';
import { HoldingsDitemFrame } from 'ditem-internal-api';
import { RevColumnLayoutDefinition } from 'revgrid';
import { ColumnLayoutEditorNgComponent, allowedFieldsInjectionToken, definitionColumnListInjectionToken } from '../../grid-layout-dialog/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-holdings-grid-layouts-dialog',
    templateUrl: './holdings-grid-layouts-dialog-ng.component.html',
    styleUrls: ['./holdings-grid-layouts-dialog-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SvgButtonNgComponent, TabListNgComponent]
})
export class HoldingsColumnLayoutsDialogNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    readonly caption = inject(HoldingsColumnLayoutsDialogNgComponent.captionInjectionToken);

    private _cdr = inject(ChangeDetectorRef);
    private readonly _opener = inject<LockOpenListItem.Opener>(CoreInjectionTokens.lockOpenListItemOpener);

    private readonly _okButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('okButton');
    private readonly _cancelButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('cancelButton');
    private readonly _tabListComponentSignal = viewChild.required<TabListNgComponent>('tabList');
    private readonly _editorContainerSignal = viewChild.required('editorContainer', { read: ViewContainerRef });

    private _okButtonComponent: SvgButtonNgComponent;
    private _cancelButtonComponent: SvgButtonNgComponent;
    private _tabListComponent: TabListNgComponent;
    private _editorContainer: ViewContainerRef;

    private _commandRegisterService: CommandRegisterService;

    private _depthBidAllowedFields: readonly GridField[];
    private _depthAskAllowedFields: readonly GridField[];
    private _holdingsAllowedFields: readonly GridField[];
    private _balancesAllowedFields: readonly GridField[];

    private _depthBidLayoutDefinition: RevColumnLayoutDefinition;
    private _depthAskLayoutDefinition: RevColumnLayoutDefinition;
    private _holdingsLayoutDefinition: RevColumnLayoutDefinition;
    private _balancesLayoutDefinition: RevColumnLayoutDefinition;

    private _okUiAction: IconButtonUiAction;
    private _cancelUiAction: IconButtonUiAction;

    private _activeSubFrameId: HoldingsColumnLayoutsDialogNgComponent.SubFrameId | undefined;
    private _editorComponent: ColumnLayoutEditorNgComponent | undefined;

    private _closeResolve: (value: HoldingsDitemFrame.ColumnLayoutDefinitions | undefined) => void;
    private _closeReject: (reason: unknown) => void;

    constructor() {
        const commandRegisterNgService = inject(CommandRegisterNgService);
        const allowedFields = inject<HoldingsDitemFrame.AllowedGridFields>(HoldingsColumnLayoutsDialogNgComponent.holdingsAllowedFieldsInjectionToken);
        const oldLayoutDefinitions = inject<HoldingsDitemFrame.ColumnLayoutDefinitions>(HoldingsColumnLayoutsDialogNgComponent.oldHoldingsColumnLayoutDefinitionsInjectionToken);

        super(++HoldingsColumnLayoutsDialogNgComponent.typeInstanceCreateCount);

        this._commandRegisterService = commandRegisterNgService.service;

        this._okUiAction = this.createOkUiAction();
        this._cancelUiAction = this.createCancelUiAction();

        this._holdingsAllowedFields = allowedFields.holdings;
        this._balancesAllowedFields = allowedFields.balances;

        this._holdingsLayoutDefinition = oldLayoutDefinitions.holdings.createCopy();
        this._balancesLayoutDefinition = oldLayoutDefinitions.balances.createCopy();
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
        return new Promise<HoldingsDitemFrame.ColumnLayoutDefinitions | undefined>((resolve, reject) => {
            this._closeResolve = resolve;
            this._closeReject = reject;
        });
    }

    setSubFrameId(value: HoldingsColumnLayoutsDialogNgComponent.SubFrameId) {
        this.checkLoadLayoutFromEditor();

        if (value !== this._activeSubFrameId) {
            switch (value) {
                case HoldingsColumnLayoutsDialogNgComponent.SubFrameId.Holdings:
                    this._editorComponent = this.recreateEditor(this._holdingsAllowedFields, this._holdingsLayoutDefinition);
                    break;

                case HoldingsColumnLayoutsDialogNgComponent.SubFrameId.Balances:
                    this._editorComponent = this.recreateEditor(this._balancesAllowedFields, this._balancesLayoutDefinition);
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

    private handleActiveTabChangedEvent(tab: TabListNgComponent.Tab, subFrameId: HoldingsColumnLayoutsDialogNgComponent.SubFrameId) {
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
                caption: Strings[StringId.Holdings],
                initialActive: true,
                initialDisabled: false,
                activeChangedEventer: (tab) => this.handleActiveTabChangedEvent(tab, HoldingsColumnLayoutsDialogNgComponent.SubFrameId.Holdings),
            },
            {
                caption: Strings[StringId.Balances],
                initialActive: false,
                initialDisabled: false,
                activeChangedEventer: (tab) => this.handleActiveTabChangedEvent(tab, HoldingsColumnLayoutsDialogNgComponent.SubFrameId.Balances),
            },
        ];
        this._tabListComponent.setTabs(tabDefinitions);

        this.setSubFrameId(HoldingsColumnLayoutsDialogNgComponent.SubFrameId.Holdings);
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
                    case HoldingsColumnLayoutsDialogNgComponent.SubFrameId.Holdings:
                        this._holdingsLayoutDefinition = editorComponent.getColumnLayoutDefinition();
                        break;

                    case HoldingsColumnLayoutsDialogNgComponent.SubFrameId.Balances:
                        this._balancesLayoutDefinition = editorComponent.getColumnLayoutDefinition();
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
            const layouts: HoldingsDitemFrame.ColumnLayoutDefinitions = {
                holdings: this._holdingsLayoutDefinition,
                balances: this._balancesLayoutDefinition,
            };
            this._closeResolve(layouts);
        } else {
            this._closeResolve(undefined);
        }
    }
}

export namespace HoldingsColumnLayoutsDialogNgComponent {
    export const enum SubFrameId {
        Holdings,
        Balances,
    }

    export type ClosePromise = Promise<HoldingsDitemFrame.ColumnLayoutDefinitions | undefined>;

    export const captionInjectionToken = new InjectionToken<string>('HoldingsColumnLayoutsDialogNgComponent.caption');
    export const holdingsAllowedFieldsInjectionToken = new InjectionToken<HoldingsDitemFrame.AllowedGridFields>('HoldingsColumnLayoutsDialogNgComponent.allowedFields');
    export const oldHoldingsColumnLayoutDefinitionsInjectionToken = new InjectionToken<HoldingsDitemFrame.ColumnLayoutDefinitions>('HoldingsColumnLayoutsDialogNgComponent.allowedFields');

    export function open(
        container: ViewContainerRef,
        opener: LockOpenListItem.Opener,
        caption: string,
        allowedFieldsAndLayoutDefinition: HoldingsDitemFrame.AllowedFieldsAndLayoutDefinitions
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
        const allowedFields: HoldingsDitemFrame.AllowedGridFields = {
            holdings: allowedFieldsAndLayoutDefinition.holdings.allowedFields,
            balances: allowedFieldsAndLayoutDefinition.balances.allowedFields,
        };

        const columnLayoutDefinitions: HoldingsDitemFrame.ColumnLayoutDefinitions = {
            holdings: allowedFieldsAndLayoutDefinition.holdings,
            balances: allowedFieldsAndLayoutDefinition.balances,
        };

        const allowedFieldsProvider: ValueProvider = {
            provide: holdingsAllowedFieldsInjectionToken,
            useValue: allowedFields,
        };
        const oldBidAskLayoutDefinitionProvider: ValueProvider = {
            provide: oldHoldingsColumnLayoutDefinitionsInjectionToken,
            useValue: columnLayoutDefinitions,
        };
        const injector = Injector.create({
            providers: [openerProvider, captionProvider, allowedFieldsProvider, oldBidAskLayoutDefinitionProvider],
        });

        const componentRef = container.createComponent(HoldingsColumnLayoutsDialogNgComponent, { injector });
        const component = componentRef.instance;

        return component.open();
    }
}
