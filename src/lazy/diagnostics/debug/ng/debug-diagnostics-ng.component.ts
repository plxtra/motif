import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, viewChild } from '@angular/core';
import { delay1Tick } from '@pbkware/js-utils';
import { AdiService, ButtonUiAction, CommandRegisterService, InternalCommand, StringId, ZenithExtConnectionDataDefinition, ZenithExtConnectionDataItem } from '@plxtra/motif-core';
import { AdiNgService, CommandRegisterNgService, SessionInfoNgService } from 'component-services-ng-api';
import { ButtonInputNgComponent } from 'controls-ng-api';
import { DiagnosticsComponentBaseNgDirective } from '../../ng/diagnostics-component-base-ng.directive';

@Component({
    selector: 'app-debug-diagnostics-ng',
    templateUrl: './debug-diagnostics-ng.component.html',
    styleUrls: ['./debug-diagnostics-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DebugDiagnosticsNgComponent extends DiagnosticsComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    private readonly _closeSocketConnectionButtonComponentSignal = viewChild.required<ButtonInputNgComponent>('closeSocketConnectionButton');

    private readonly _zenithEndpoints: readonly string[];
    private readonly _adiService: AdiService;

    private readonly _closeSocketConnectionUiAction: ButtonUiAction;

    private _closeSocketConnectionButtonComponent: ButtonInputNgComponent;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        commandRegisterNgService: CommandRegisterNgService,
        adiNgService: AdiNgService,
        sessionInfoNgService: SessionInfoNgService,
    ) {
        super(elRef, ++DebugDiagnosticsNgComponent.typeInstanceCreateCount, cdr);

        this._zenithEndpoints = sessionInfoNgService.service.zenithEndpoints;
        this._adiService = adiNgService.service;

        const commandRegisterService = commandRegisterNgService.service;
        this._closeSocketConnectionUiAction = this.createCloseSocketConnectionUiAction(commandRegisterService);
    }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._closeSocketConnectionButtonComponent = this._closeSocketConnectionButtonComponentSignal();

        delay1Tick(() => this.initialiseComponents());
    }

    protected override finalise() {
        this._closeSocketConnectionUiAction.finalise();

        super.finalise();
    }

    private handleCreateCloseSocketConnectionSignalEvent() {
        const zenithExtConnectionDataDefinition = new ZenithExtConnectionDataDefinition();
        zenithExtConnectionDataDefinition.zenithWebsocketEndpoints = this._zenithEndpoints;
        const zenithExtConnectionDataItem = this._adiService.subscribe(zenithExtConnectionDataDefinition) as ZenithExtConnectionDataItem;
        zenithExtConnectionDataItem.diagnosticCloseSocket();
        this._adiService.unsubscribe(zenithExtConnectionDataItem);
    }

    private createCloseSocketConnectionUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.Diagnostics_CloseSocketConnection;
        const displayId = StringId.Diagnostics_CloseSocketConnection;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.signalEvent = () => this.handleCreateCloseSocketConnectionSignalEvent();
        return action;
    }

    private initialiseComponents() {
        this._closeSocketConnectionButtonComponent.initialise(this._closeSocketConnectionUiAction);
    }
}
