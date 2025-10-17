import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, ViewContainerRef, inject, viewChild } from '@angular/core';
import { AssertInternalError, JsonElement, LockOpenListItem, ModifierKey, ModifierKeyId, delay1Tick } from '@pbkware/js-utils';
import { StringUiAction, UiAction } from '@pbkware/ui-action';
import {
    AllowedSourcedFieldsColumnLayoutDefinition,
    ButtonUiAction,
    ColumnLayoutOrReference,
    DataIvemId,
    IconButtonUiAction,
    InternalCommand,
    StringId,
    Strings,
    UiComparableList
} from '@plxtra/motif-core';
import { AdiNgService, CoreInjectionTokens, LockOpenListItemOpenerNgUseClass, MarketsNgService, ScansNgService, SymbolsNgService, ToastNgService } from 'component-services-ng-api';
import { DataIvemIdListEditorDialogNgComponent, NameableColumnLayoutEditorDialogNgComponent, ScanEditorNgComponent, ScanListNgComponent } from 'content-ng-api';
import { ButtonInputNgComponent, SvgButtonNgComponent, TextInputNgComponent } from 'controls-ng-api';
import { RevColumnLayoutOrReferenceDefinition } from 'revgrid';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { ScansDitemFrame } from '../scans-ditem-frame';
import { TextInputNgComponent as TextInputNgComponent_1 } from '../../../controls/string/text-input/ng/text-input-ng.component';
import { ButtonInputNgComponent as ButtonInputNgComponent_1 } from '../../../controls/boolean/button/button-input/ng/button-input-ng.component';
import { SvgButtonNgComponent as SvgButtonNgComponent_1 } from '../../../controls/boolean/button/icon/svg-button/ng/svg-button-ng.component';
import { SplitComponent, SplitAreaComponent } from 'angular-split';
import { ScanListNgComponent as ScanListNgComponent_1 } from '../../../content/scan/list/ng/scan-list-ng.component';
import { ScanEditorNgComponent as ScanEditorNgComponent_1 } from '../../../content/scan/editor/ng/scan-editor-ng.component';

@Component({
    selector: 'app-scans-ditem-ng',
    templateUrl: './scans-ditem-ng.component.html',
    styleUrls: ['./scans-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: CoreInjectionTokens.lockOpenListItemOpener, useClass: LockOpenListItemOpenerNgUseClass }],
    imports: [TextInputNgComponent_1, ButtonInputNgComponent_1, SvgButtonNgComponent_1, SplitComponent, SplitAreaComponent, ScanListNgComponent_1, ScanEditorNgComponent_1]
})
export class ScansDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    readonly listAreaWidth = 540;
    readonly listAreaMinWidth = 50;
    readonly splitterGutterSize = 3;

    public dialogActive = false;

    private readonly _toastNgService = inject(ToastNgService);
    private readonly _opener = inject<LockOpenListItem.Opener>(CoreInjectionTokens.lockOpenListItemOpener, { self: true });

    private readonly _newButtonComponentSignal = viewChild.required<ButtonInputNgComponent>('newButton');
    private readonly _filterEditComponentSignal = viewChild.required<TextInputNgComponent>('filterEdit');
    private readonly _symbolLinkButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('symbolLinkButton');
    private readonly _columnsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('columnsButton');
    private readonly _autoSizeColumnWidthsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('autoSizeColumnWidthsButton');
    private readonly _dialogContainerSignal = viewChild.required('dialogContainer', { read: ViewContainerRef });
    private readonly _listComponentSignal = viewChild.required<ScanListNgComponent>('scanList');
    private readonly _editorComponentSignal = viewChild.required<ScanEditorNgComponent>('scanEditor');

    private readonly _newUiAction: ButtonUiAction;
    private readonly _filterEditUiAction: StringUiAction;
    private readonly _autoSizeColumnWidthsUiAction: IconButtonUiAction;
    private readonly _columnsUiAction: IconButtonUiAction;
    private readonly _toggleSymbolLinkingUiAction: IconButtonUiAction;

    private readonly _frame: ScansDitemFrame;

    // recordFocusEventer: ScansNgComponent.RecordFocusEventer;
    // gridClickEventer: ScansNgComponent.GridClickEventer;
    // columnsViewWithsChangedEventer: ScansNgComponent.ColumnsViewWithsChangedEventer;

    private _newButtonComponent: ButtonInputNgComponent;
    private _filterEditComponent: TextInputNgComponent;
    private _symbolLinkButtonComponent: SvgButtonNgComponent;
    private _columnsButtonComponent: SvgButtonNgComponent;
    private _autoSizeColumnWidthsButtonComponent: SvgButtonNgComponent;
    private _dialogContainer: ViewContainerRef;
    private _listComponent: ScanListNgComponent;
    private _editorComponent: ScanEditorNgComponent;

    constructor() {
        super(++ScansDitemNgComponent.typeInstanceCreateCount);

        const marketsNgService = inject(MarketsNgService);
        const desktopAccessNgService = inject(DesktopAccessNgService);
        const symbolsNgService = inject(SymbolsNgService);
        const adiNgService = inject(AdiNgService);
        const scansNgService = inject(ScansNgService);

        this._opener = {
            lockerName: `${Strings[StringId.ScanEditor]}:${ScansDitemNgComponent.typeInstanceCreateCount}`,
        };

        this._frame = new ScansDitemFrame(
            this,
            this.settingsService,
            marketsNgService.service,
            this.commandRegisterService,
            desktopAccessNgService.service,
            symbolsNgService.service,
            adiNgService.service,
            scansNgService.service,
            this._toastNgService.service,
            this._opener,
            (editor) => this._editorComponent.setEditor(editor),
        );

        this._newUiAction = this.createNewUiAction();
        this._filterEditUiAction = this.createFilterEditUiAction();
        this._autoSizeColumnWidthsUiAction = this.createAutoSizeColumnWidthsUiAction();
        this._columnsUiAction = this.createColumnsUiAction();
        this._toggleSymbolLinkingUiAction = this.createToggleSymbolLinkingUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());
        this.pushSymbolLinkSelectState();
    }

    get ditemFrame() { return this._frame; }
    protected get stateSchemaVersion() { return ScansDitemNgComponent.stateSchemaVersion; }

    public ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._newButtonComponent = this._newButtonComponentSignal();
        this._filterEditComponent = this._filterEditComponentSignal();
        this._symbolLinkButtonComponent = this._symbolLinkButtonComponentSignal();
        this._columnsButtonComponent = this._columnsButtonComponentSignal();
        this._autoSizeColumnWidthsButtonComponent = this._autoSizeColumnWidthsButtonComponentSignal();
        this._dialogContainer = this._dialogContainerSignal();
        this._listComponent = this._listComponentSignal();
        this._editorComponent = this._editorComponentSignal();

        delay1Tick(() => this.initialise());
    }

    handleSplitterDragEnd() {
        //
    }

    override processSymbolLinkedChanged() {
        this.pushSymbolLinkSelectState();
    }

    protected override initialise() {
        const componentStateElement = this.getInitialComponentStateJsonElement();
        const frameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        this._frame.initialise(frameElement, this._listComponent.frame);

        // this.pushFilterSelectState();
        this.pushFilterEditValue();

        this.initialiseChildComponents();

        // this._frame.open();

        super.initialise();
    }

    protected override finalise() {
        this._editorComponent.editGridColumnsEventer = undefined;
        this._editorComponent.popoutTargetsMultiSymbolListEditorEventer = undefined;

        this._newUiAction.finalise();
        this._toggleSymbolLinkingUiAction.finalise();
        this._filterEditUiAction.finalise();
        this._autoSizeColumnWidthsUiAction.finalise();
        this._columnsUiAction.finalise();

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

    private handleNewUiActionSignalEvent() {
        this._frame.newOrFocusNewScan();
    }

    private handleFilterEditUiActionCommitEvent() {
        this._frame.filterText = this._filterEditUiAction.definedValue;
    }

    private handleAutoSizeColumnWidthsUiActionSignalEvent(_signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        const widenOnly = ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Shift);
        this._frame.autoSizeAllColumnWidths(widenOnly);
    }

    private handleColumnsUiActionSignalEvent() {
        const allowedSourcedFieldsColumnLayoutDefinition = this._frame.createAllowedSourcedFieldsColumnLayoutDefinition();

        const closePromise = NameableColumnLayoutEditorDialogNgComponent.open(
            this._dialogContainer,
            this._opener,
            Strings[StringId.Scans_ColumnsDialogCaption],
            allowedSourcedFieldsColumnLayoutDefinition,
        );

        closePromise.then(
            (layoutOrReferenceDefinition) => {
                if (layoutOrReferenceDefinition !== undefined) {
                    const openPromise = this._frame.tryOpenColumnLayoutOrReferenceDefinition(layoutOrReferenceDefinition);
                    openPromise.then(
                        (openResult) => {
                            if (openResult.isErr()) {
                                const error = ColumnLayoutOrReference.formatError(openResult.error);
                                this._toastNgService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.Scans]} ${Strings[StringId.ColumnLayout]}: ${error}`);
                            }
                        },
                        (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'SDNCSLECPOP68823'); }
                    );
                }
                this.closeDialog();
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'SDNCHCUASE44534'); }
        );

        this.dialogActive = true;
        this.markForCheck();
    }

    private handleSymbolLinkUiActionSignalEvent() {
        this._frame.dataIvemIdLinked = !this._frame.dataIvemIdLinked;
    }

    private createNewUiAction(): ButtonUiAction {
        const commandName = InternalCommand.Id.NewScan;
        const displayId = StringId.NewScan;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.BannerAdvert_ContactMeTitle]);
        action.pushUnselected();
        action.signalEvent = () => this.handleNewUiActionSignalEvent();
        return action;
    }

    private createFilterEditUiAction() {
        const action = new StringUiAction();
        action.pushTitle(Strings[StringId.Filter]);
        action.pushPlaceholder(Strings[StringId.Filter]);
        action.commitEvent = () => this.handleFilterEditUiActionCommitEvent();
        return action;
    }

    private createAutoSizeColumnWidthsUiAction() {
        const commandName = InternalCommand.Id.AutoSizeGridColumnWidths;
        const displayId = StringId.AutoSizeColumnWidthsCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.AutoSizeColumnWidthsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.AutoSizeColumnWidths);
        action.pushUnselected();
        action.signalEvent = (signalTypeId, downKeys) => this.handleAutoSizeColumnWidthsUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private createColumnsUiAction() {
        const commandName = InternalCommand.Id.SelectGridColumns;
        const displayId = StringId.SelectColumnsCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.SelectColumnsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SelectColumns);
        action.pushUnselected();
        action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }

    private createToggleSymbolLinkingUiAction() {
        const commandName = InternalCommand.Id.ToggleSymbolLinking;
        const displayId = StringId.ToggleSymbolLinkingCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ToggleSymbolLinkingTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SymbolLink);
        action.signalEvent = () => this.handleSymbolLinkUiActionSignalEvent();
        return action;
    }

    private initialiseChildComponents() {
        this._newButtonComponent.initialise(this._newUiAction);
        this._symbolLinkButtonComponent.initialise(this._toggleSymbolLinkingUiAction);
        this._filterEditComponent.initialise(this._filterEditUiAction);
        this._autoSizeColumnWidthsButtonComponent.initialise(this._autoSizeColumnWidthsUiAction);
        this._columnsButtonComponent.initialise(this._columnsUiAction);

        this._editorComponent.editGridColumnsEventer = (
            caption,
            allowedFieldsAndLayoutDefinition
        ) => this.openGridColumnsEditorDialog(caption, allowedFieldsAndLayoutDefinition);

        this._editorComponent.popoutTargetsMultiSymbolListEditorEventer = (caption, list, columnsEditCaption) => {
            this.openTargetMultiSymbolListEditorDialog(caption, list, columnsEditCaption);
        }

        // this._frame.open();
    }

    private pushSymbolLinkSelectState() {
        if (this._frame.dataIvemIdLinked) {
            this._toggleSymbolLinkingUiAction.pushSelected();
        } else {
            this._toggleSymbolLinkingUiAction.pushUnselected();
        }
    }

    private pushFilterEditValue() {
        this._filterEditUiAction.pushValue(this._frame.filterText);
    }

    private openGridColumnsEditorDialog(caption: string, allowedFieldsAndLayoutDefinition: AllowedSourcedFieldsColumnLayoutDefinition) {
        this.dialogActive = true;

        // We cannot just return the promise from the dialog as we need to close the dialog as well.
        // So return a separate promise which is resolved when dialog is closed.
        let definitonResolveFtn: (this: void, definition: RevColumnLayoutOrReferenceDefinition | undefined) => void;

        const definitionPromise = new Promise<RevColumnLayoutOrReferenceDefinition | undefined>(
            (resolve) => {
                definitonResolveFtn = resolve;
            }
        )

        const closePromise = NameableColumnLayoutEditorDialogNgComponent.open(
            this._dialogContainer,
            this._frame.opener,
            caption,
            allowedFieldsAndLayoutDefinition,
        );
        closePromise.then(
            (definition) => {
                definitonResolveFtn(definition);
                this.closeDialog();
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'ODNCSLEDCPTR20987'); }
        );

        this.markForCheck();

        return definitionPromise;
    }

    private openTargetMultiSymbolListEditorDialog(caption: string, list: UiComparableList<DataIvemId>, columnsEditCaption: string) {
        this.dialogActive = true;

        const closePromise = DataIvemIdListEditorDialogNgComponent.open(
            this._dialogContainer,
            this._frame.opener,
            caption,
            list,
            columnsEditCaption
        );
        closePromise.then(
            () => {
                this.closeDialog();
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'ODNCSLEDCPTR20987'); }
        );

        this.markForCheck();
    }

    private closeDialog() {
        this._dialogContainer.clear();
        this.dialogActive = false;
        this.markForCheck();
    }
}

export namespace ScansDitemNgComponent {
    export const stateSchemaVersion = '2';
}
