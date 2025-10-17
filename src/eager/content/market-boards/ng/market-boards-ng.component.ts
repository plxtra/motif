import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, OnDestroy, ValueProvider, ViewContainerRef, inject, viewChild } from '@angular/core';
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
import { MarketBoardsGridNgComponent } from '../grid/ng-api';
import { IntegerCaptionedRadioNgComponent as IntegerCaptionedRadioNgComponent_1 } from '../../../controls/enum/integer-captioned-radio/ng/integer-captioned-radio-ng.component';
import { SvgButtonNgComponent as SvgButtonNgComponent_1 } from '../../../controls/boolean/button/icon/svg-button/ng/svg-button-ng.component';
import { MarketBoardsGridNgComponent as MarketBoardsGridNgComponent_1 } from '../grid/ng/market-boards-grid-ng.component';

@Component({
    selector: 'app-market-boards',
    templateUrl: './market-boards-ng.component.html',
    styleUrls: ['./market-boards-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IntegerCaptionedRadioNgComponent_1, SvgButtonNgComponent_1, MarketBoardsGridNgComponent_1]
})
export class MarketBoardsNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    public dialogActive = false;

    public readonly listRadioName: string;

    private readonly _cdr = inject(ChangeDetectorRef);
    private readonly _toastNgService = inject(ToastNgService);
    private readonly _opener = inject<LockOpenListItem.Opener>(CoreInjectionTokens.lockOpenListItemOpener);

    private readonly _gridComponentSignal = viewChild.required<MarketBoardsGridNgComponent>('grid');
    private readonly _knownListControlComponentSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('knownListControl');
    private readonly _environmentDefaultListControlComponentSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('environmentDefaultListControl');
    private readonly _unknownListControlComponentSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('unknownListControl');
    private readonly _columnsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('columnsButton');
    private readonly _autoSizeColumnWidthsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('autoSizeColumnWidthsButton');
    private readonly _dialogContainerSignal = viewChild.required('dialogContainer', { read: ViewContainerRef });

    private readonly _marketsService: MarketsService;

    private readonly _listUiAction: IntegerListSelectItemUiAction;
    private readonly _columnsUiAction: IconButtonUiAction;
    private readonly _autoSizeColumnWidthsUiAction: IconButtonUiAction;

    private _gridComponent: MarketBoardsGridNgComponent;
    private _knownListControlComponent: IntegerCaptionedRadioNgComponent;
    private _environmentDefaultListControlComponent: IntegerCaptionedRadioNgComponent;
    private _unknownListControlComponent: IntegerCaptionedRadioNgComponent;
    private _columnsButtonComponent: SvgButtonNgComponent;
    private _autoSizeColumnWidthsButtonComponent: SvgButtonNgComponent;
    private _dialogContainer: ViewContainerRef;

    constructor() {
        const marketsNgService = inject(MarketsNgService);
        const commandRegisterNgService = inject(CommandRegisterNgService);

        super(++MarketBoardsNgComponent.typeInstanceCreateCount);
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
        const listIds = MarketsService.List.allIds;
        const list = listIds.map<IntegerListSelectItemUiAction.ItemProperties>(
            (listId) => (
                {
                    item: listId,
                    caption: MarketsService.List.idToDisplay(listId),
                    title: MarketsService.List.idToDescription(listId, Strings[StringId.MarketBoards]),
                }
            )
        );
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
        this._columnsButtonComponent.initialise(this._columnsUiAction);
        this._autoSizeColumnWidthsButtonComponent.initialise(this._autoSizeColumnWidthsUiAction);

        this._gridComponent.initialise();
    }

    private openList(listId: MarketsService.ListId) {
        switch (listId) {
            case MarketsService.ListId.Known:
                this._gridComponent.setList(this._marketsService.marketBoards);
                break;
            case MarketsService.ListId.EnvironmentDefault:
                this._gridComponent.setList(this._marketsService.defaultExchangeEnvironmentMarketBoards);
                break;
            case MarketsService.ListId.Unknown:
                this._gridComponent.setList(this._marketsService.unknownMarketBoards);
                break;
            default:
                throw new UnreachableCaseError('ENCCLUA33008', listId);
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
}

export namespace MarketBoardsNgComponent {

    export function create(container: ViewContainerRef, opener: LockOpenListItem.Opener) {
        container.clear();

        const openerProvider: ValueProvider = {
            provide: CoreInjectionTokens.lockOpenListItemOpener,
            useValue: opener,
        };
        const injector = Injector.create({
            providers: [openerProvider],
        });

        const componentRef = container.createComponent(MarketBoardsNgComponent, { injector });
        assert(componentRef.instance instanceof MarketBoardsNgComponent, 'ENGC31175');
        return componentRef.instance;
    }
}
