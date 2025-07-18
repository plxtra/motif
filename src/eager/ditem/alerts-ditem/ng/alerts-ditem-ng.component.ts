import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    OnDestroy,
    viewChild,
    ViewContainerRef
} from '@angular/core';
import { delay1Tick, JsonElement } from '@pbkware/js-utils';
import { StringUiAction } from '@pbkware/ui-action';
import {
    ButtonUiAction,
    IconButtonUiAction,
    InternalCommand,
    StringId,
    Strings
} from '@plxtra/motif-core';
import { AdiNgService, CellPainterFactoryNgService, CommandRegisterNgService, MarketsNgService, SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import { RowDataArrayGridNgComponent } from 'content-ng-api';
import { ButtonInputNgComponent, SvgButtonNgComponent, TextInputNgComponent } from 'controls-ng-api';
import { ComponentContainer } from 'golden-layout';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { AlertsDitemFrame } from '../alerts-ditem-frame';

@Component({
    selector: 'app-alerts-ditem-ng',
    templateUrl: './alerts-ditem-ng.component.html',
    styleUrls: ['./alerts-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class AlertsDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    public isMainMode = true;
    public isLayoutEditorMode = false;

    private readonly _filterEditComponentSignal = viewChild.required<TextInputNgComponent>('filterInput');
    private readonly _detailsButtonComponentSignal = viewChild.required<ButtonInputNgComponent>('detailsButton');
    private readonly _acknowledgeButtonComponentSignal = viewChild.required<ButtonInputNgComponent>('acknowledgeButton');
    private readonly _deleteButtonComponentSignal = viewChild.required<ButtonInputNgComponent>('deleteButton');
    private readonly _columnsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('columnsButton');
    private readonly _autoSizeColumnWidthsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('autoSizeColumnWidthsButton');
    private readonly _gridComponentSignal = viewChild.required(RowDataArrayGridNgComponent);
    private readonly _layoutEditorContainerSignal = viewChild.required('layoutEditorContainer', { read: ViewContainerRef });

    private readonly _frame: AlertsDitemFrame;

    private readonly _filterEditUiAction: StringUiAction;
    private readonly _detailsUiAction: ButtonUiAction;
    private readonly _acknowledgeUiAction: ButtonUiAction;
    private readonly _deleteUiAction: ButtonUiAction;
    private readonly _autoSizeColumnWidthsUiAction: IconButtonUiAction;
    private readonly _columnsUiAction: IconButtonUiAction;

    private _filterEditComponent: TextInputNgComponent;
    private _detailsButtonComponent: ButtonInputNgComponent;
    private _acknowledgeButtonComponent: ButtonInputNgComponent;
    private _deleteButtonComponent: ButtonInputNgComponent;
    private _columnsButtonComponent: SvgButtonNgComponent;
    private _autoSizeColumnWidthsButtonComponent: SvgButtonNgComponent;
    private _gridComponent: RowDataArrayGridNgComponent;
    private _layoutEditorContainer: ViewContainerRef;

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
        cellPainterFactoryNgService: CellPainterFactoryNgService,
    ) {
        super(
            elRef,
            ++AlertsDitemNgComponent.typeInstanceCreateCount,
            cdr,
            container,
            settingsNgService.service,
            commandRegisterNgService.service
        );

        this._frame = new AlertsDitemFrame(this, this.settingsService, marketsNgService.service, this.commandRegisterService,
            desktopAccessNgService.service, symbolsNgService.service, adiNgService.service, cellPainterFactoryNgService.service,
            this.rootHtmlElement);

        this._filterEditUiAction = this.createFilterEditUiAction();
        this._detailsUiAction = this.createDetailsUiAction();
        this._acknowledgeUiAction = this.createAcknowledgeUiAction();
        this._deleteUiAction = this.createDeleteUiAction();
        this._autoSizeColumnWidthsUiAction = this.createAutoSizeColumnWidthsUiAction();
        this._columnsUiAction = this.createColumnsUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());
    }

    get ditemFrame() { return this._frame; }
    protected get stateSchemaVersion() { return AlertsDitemNgComponent.stateSchemaVersion; }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._filterEditComponent = this._filterEditComponentSignal();
        this._detailsButtonComponent = this._detailsButtonComponentSignal();
        this._acknowledgeButtonComponent = this._acknowledgeButtonComponentSignal();
        this._deleteButtonComponent = this._deleteButtonComponentSignal();
        this._columnsButtonComponent = this._columnsButtonComponentSignal();
        this._autoSizeColumnWidthsButtonComponent = this._autoSizeColumnWidthsButtonComponentSignal();
        this._gridComponent = this._gridComponentSignal();
        this._layoutEditorContainer = this._layoutEditorContainerSignal();

        delay1Tick(() => this.initialise());
    }

    protected override initialise() {
        // const componentStateElement = this.getInitialComponentStateJsonElement();
        // const frameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        // this._frame.initialise(this._contentComponent.frame, frameElement);

        this.initialiseComponents();

        super.initialise();
    }

    protected override finalise() {
        this._filterEditUiAction.finalise();
        this._detailsUiAction.finalise();
        this._acknowledgeUiAction.finalise();
        this._deleteUiAction.finalise();
        this._autoSizeColumnWidthsUiAction.finalise();
        this._columnsUiAction.finalise();

        this._frame.finalise();
        super.finalise();
    }

    protected constructLoad(element: JsonElement | undefined) {
        // nothing to load
    }

    protected save(element: JsonElement) {
        // nothing to save
    }

    private createFilterEditUiAction() {
        const action = new StringUiAction();
        action.valueRequired = false;
        action.pushTitle(Strings[StringId.Filter]);
        action.pushPlaceholder(Strings[StringId.Filter]);
        // action.commitEvent = () => this.handleSymbolCommitEvent();
        // action.inputEvent = () => this.handleSymbolInputEvent();
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
        // action.signalEvent = () => this.handleAutoSizeColumnWidthsUiActionSignalEvent();
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
        // action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }

    private createDetailsUiAction() {
        const commandName = InternalCommand.Id.ShowSelectedAlertDetails;
        const displayId = StringId.Details;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.ShowSelectedAlertDetailsTitle]);
        action.pushUnselected();
        // action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }

    private createAcknowledgeUiAction() {
        const commandName = InternalCommand.Id.AcknowledgeSelectedAlert;
        const displayId = StringId.Acknowledge;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.AcknowledgeSelectedAlertTitle]);
        action.pushUnselected();
        action.pushDisabled();
        // action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }

    private createDeleteUiAction() {
        const commandName = InternalCommand.Id.DeleteSelectedAlert;
        const displayId = StringId.Delete;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.DeleteSelectedAlertTitle]);
        action.pushUnselected();
        action.pushDisabled();
        // action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }


    private initialiseComponents() {
        this._filterEditComponent.initialise(this._filterEditUiAction);
        this._detailsButtonComponent.initialise(this._detailsUiAction);
        this._acknowledgeButtonComponent.initialise(this._acknowledgeUiAction);
        this._deleteButtonComponent.initialise(this._deleteUiAction);
        this._autoSizeColumnWidthsButtonComponent.initialise(this._autoSizeColumnWidthsUiAction);
        this._columnsButtonComponent.initialise(this._columnsUiAction);

        // this._frame.open();
    }
}

export namespace AlertsDitemNgComponent {
    export const stateSchemaVersion = '2';
}
