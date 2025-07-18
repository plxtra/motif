import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    Injector,
    OnDestroy,
    ValueProvider,
    ViewContainerRef,
    viewChild
} from '@angular/core';
import { AssertInternalError, LockOpenListItem, ModifierKey, UnreachableCaseError, delay1Tick } from '@pbkware/js-utils';
import { IntegerListSelectItemUiAction } from '@pbkware/ui-action';
import {
    ColumnLayoutOrReference,
    CommandRegisterService,
    IconButtonUiAction,
    InternalCommand,
    MarketsService,
    StringId,
    Strings,
    assert
} from '@plxtra/motif-core';
import { CommandRegisterNgService, CoreInjectionTokens, MarketsNgService, ToastNgService } from 'component-services-ng-api';
import {
    IntegerCaptionedRadioNgComponent,
    SvgButtonNgComponent
} from 'controls-ng-api';
import { NameableColumnLayoutEditorDialogNgComponent } from '../../nameable-grid-layout-editor-dialog/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { DataMarketsGridNgComponent } from '../grid/ng-api';

@Component({
    selector: 'app-data-markets',
    templateUrl: './data-markets-ng.component.html',
    styleUrls: ['./data-markets-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DataMarketsNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    public dialogActive = false;
    public withBoardsActive = false;

    public readonly listRadioName: string;

    private readonly _gridComponentSignal = viewChild.required<DataMarketsGridNgComponent>('grid', { debugName: 'grid'});
    private readonly _knownListControlComponentSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('knownListControl', { debugName: 'knownListControl' });
    private readonly _environmentDefaultListControlComponentSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('environmentDefaultListControl', { debugName: 'environmentDefaultListControl' });
    private readonly _unknownListControlComponentSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('unknownListControl', { debugName: 'unknownListControl' });
    private readonly _withBoardsControlComponentSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('withBoardsControl', { debugName: 'withBoardsControl' });
    private readonly _columnsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('columnsButton', { debugName: 'columnsButton' });
    private readonly _autoSizeColumnWidthsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('autoSizeColumnWidthsButton', { debugName: 'autoSizeColumnWidthsButton' });
    private readonly _dialogContainerSignal = viewChild.required('dialogContainer', { read: ViewContainerRef, debugName: 'dialogContainer' });

    private _gridComponent: DataMarketsGridNgComponent;
    private _knownListControlComponent: IntegerCaptionedRadioNgComponent;
    private _environmentDefaultListControlComponent: IntegerCaptionedRadioNgComponent;
    private _unknownListControlComponent: IntegerCaptionedRadioNgComponent;
    private _withBoardsControlComponent: IntegerCaptionedRadioNgComponent;
    private _columnsButtonComponent: SvgButtonNgComponent;
    private _autoSizeColumnWidthsButtonComponent: SvgButtonNgComponent;
    private _dialogContainer: ViewContainerRef;

    private readonly _marketsService: MarketsService;

    private readonly _listUiAction: IntegerListSelectItemUiAction;
    private readonly _columnsUiAction: IconButtonUiAction;
    private readonly _autoSizeColumnWidthsUiAction: IconButtonUiAction;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private readonly _cdr: ChangeDetectorRef,
        marketsNgService: MarketsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        private readonly _toastNgService: ToastNgService,
        @Inject(CoreInjectionTokens.lockOpenListItemOpener) private readonly _opener: LockOpenListItem.Opener,
    ) {
        super(elRef, ++DataMarketsNgComponent.typeInstanceCreateCount);
        this._marketsService = marketsNgService.service;

        this.listRadioName = this.generateInstancedRadioName('list');

        const commandRegisterService = commandRegisterNgService.service;
        this._listUiAction = this.createListUiAction();
        this._columnsUiAction = this.createColumnsUiAction(commandRegisterService);
        this._autoSizeColumnWidthsUiAction = this.createAutoSizeColumnWidthsUiAction(commandRegisterService);

        this._listUiAction.pushValue(MarketsService.ListId.Known);
    }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._gridComponent = this._gridComponentSignal();
        this._knownListControlComponent = this._knownListControlComponentSignal();
        this._environmentDefaultListControlComponent = this._environmentDefaultListControlComponentSignal();
        this._unknownListControlComponent = this._unknownListControlComponentSignal();
        this._withBoardsControlComponent = this._withBoardsControlComponentSignal();
        this._columnsButtonComponent = this._columnsButtonComponentSignal();
        this._autoSizeColumnWidthsButtonComponent = this._autoSizeColumnWidthsButtonComponentSignal();
        this._dialogContainer = this._dialogContainerSignal();

        delay1Tick(() => {
            this.initialiseComponents();

            const listId = this._listUiAction.definedValue as MarketsService.ListId;
            this.openList(listId);

            this._cdr.markForCheck();
        });
    }

    protected finalise() {
        this._listUiAction.finalise();
        this._columnsUiAction.finalise();
        this._autoSizeColumnWidthsUiAction.finalise();
    }

    private createListUiAction() {
        const action = new IntegerListSelectItemUiAction();
        action.pushCaption(Strings[StringId.List]);
        // action.pushTitle(Strings[StringId.List]);
        const marketServiceListIds = MarketsService.List.allIds;
        const marketServiceListIdCount = marketServiceListIds.length;
        const list = new Array<IntegerListSelectItemUiAction.ItemProperties>(marketServiceListIdCount + 1);

        for (let i = 0; i < marketServiceListIdCount; i++) {
            const id = marketServiceListIds[i];
            list[i] = {
                item: id,
                caption: MarketsService.List.idToDisplay(id),
                title: MarketsService.List.idToDescription(id, Strings[StringId.DataMarkets]),
            };
        }

        list[marketServiceListIdCount] = {
            item: DataMarketsNgComponent.withBoardsListId,
            caption: Strings[StringId.DataMarketsNgComponent_withBoardsListCaption],
            title: Strings[StringId.DataMarketsNgComponent_withBoardsListTitle],
        }

        action.pushList(list, undefined);
        action.commitEvent = () => {
            const listId = this._listUiAction.definedValue as MarketsService.ListId;
            this.openList(listId);
        };
        return action;
    }

    private createColumnsUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.SelectGridColumns;
        const displayId = StringId.SelectColumnsCaption;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.SelectColumnsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SelectColumns);
        action.pushUnselected();
        action.signalEvent = () => this.openGridColumnsEditorDialog();
        return action;
    }

    private createAutoSizeColumnWidthsUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.AutoSizeGridColumnWidths;
        const displayId = StringId.AutoSizeColumnWidthsCaption;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.AutoSizeColumnWidthsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.AutoSizeColumnWidths);
        action.pushUnselected();
        action.signalEvent = (signalTypeId, downKeys) => this.autoSizeColumnWidths(downKeys);
        return action;
    }

    private initialiseComponents() {
        this._knownListControlComponent.initialiseEnum(this._listUiAction, MarketsService.ListId.Known);
        this._environmentDefaultListControlComponent.initialiseEnum(this._listUiAction, MarketsService.ListId.EnvironmentDefault);
        this._unknownListControlComponent.initialiseEnum(this._listUiAction, MarketsService.ListId.Unknown);
        this._withBoardsControlComponent.initialiseEnum(this._listUiAction, DataMarketsNgComponent.withBoardsListId);
        this._columnsButtonComponent.initialise(this._columnsUiAction);
        this._autoSizeColumnWidthsButtonComponent.initialise(this._autoSizeColumnWidthsUiAction);

        this._gridComponent.initialise();
    }

    private openList(listId: DataMarketsNgComponent.ListId) {
        if (listId === DataMarketsNgComponent.withBoardsListId) {
            this.setWithBoardsActive(true);
        } else {
            const marketsServiceListId = listId as MarketsService.ListId;
            switch (marketsServiceListId) {
                case MarketsService.ListId.Known:
                    this._gridComponent.setList(this._marketsService.dataMarkets);
                    break;
                case MarketsService.ListId.EnvironmentDefault:
                    this._gridComponent.setList(this._marketsService.defaultExchangeEnvironmentDataMarkets);
                    break;
                case MarketsService.ListId.Unknown:
                    this._gridComponent.setList(this._marketsService.unknownDataMarkets);
                    break;
                default:
                    throw new UnreachableCaseError('ENCCLUA33008', marketsServiceListId);
            }
            this.setWithBoardsActive(false);
        }
    }

    private openGridColumnsEditorDialog() {
        const allowedSourcedFieldsColumnLayoutDefinition = this._gridComponent.frame.createAllowedSourcedFieldsColumnLayoutDefinition();

        const closePromise = NameableColumnLayoutEditorDialogNgComponent.open(
            this._dialogContainer,
            this._opener,
            Strings[StringId.Scans_ColumnsDialogCaption],
            allowedSourcedFieldsColumnLayoutDefinition,
        );

        closePromise.then(
            (layoutOrReferenceDefinition) => {
                if (layoutOrReferenceDefinition !== undefined) {
                    const openPromise = this._gridComponent.frame.tryOpenColumnLayoutOrReferenceDefinition(layoutOrReferenceDefinition);
                    openPromise.then(
                        (openResult) => {
                            if (openResult.isErr()) {
                                const error = ColumnLayoutOrReference.formatError(openResult.error);
                                this._toastNgService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.NotificationChannels]} ${Strings[StringId.ColumnLayout]}: ${error}`);
                            }
                        },
                        (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'ENCOGCEDO58113'); }
                    );
                }
                this.closeDialog();
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'ENCOGCEDE58113'); }
        );

        this.dialogActive = true;
        this._cdr.markForCheck();
    }

    private autoSizeColumnWidths(downKeys: ModifierKey.IdSet) {
        const widenOnly = NameableColumnLayoutEditorDialogNgComponent.doesModifierKeyIdSetSpecifyWiden(downKeys);
        this._gridComponent.frame.autoSizeAllColumnWidths(widenOnly);
    }

    private closeDialog() {
        this._dialogContainer.clear();
        this.dialogActive = false;
        this._cdr.markForCheck();
    }

    private setWithBoardsActive(value: boolean) {
        if (value !== this.withBoardsActive) {
            this.withBoardsActive = value;
            if (value) {
                this._columnsUiAction.pushDisabled();
                this._autoSizeColumnWidthsUiAction.pushDisabled();
            } else {
                this._columnsUiAction.pushValidOrMissing();
                this._autoSizeColumnWidthsUiAction.pushValidOrMissing();
            }
            this._cdr.markForCheck();
        }
    }
}

export namespace DataMarketsNgComponent {
    export const withBoardsListId = MarketsService.List.idCount;

    export type ListId = MarketsService.ListId | typeof withBoardsListId;
    export const listIdCount = MarketsService.List.idCount + 1;

    export function create(container: ViewContainerRef, opener: LockOpenListItem.Opener) {
        container.clear();

        const openerProvider: ValueProvider = {
            provide: CoreInjectionTokens.lockOpenListItemOpener,
            useValue: opener,
        };
        const injector = Injector.create({
            providers: [openerProvider],
        });

        const componentRef = container.createComponent(DataMarketsNgComponent, { injector });
        assert(componentRef.instance instanceof DataMarketsNgComponent, 'ENGC31175');
        return componentRef.instance;
    }
}
