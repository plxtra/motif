import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy, viewChild } from '@angular/core';
import { delay1Tick } from '@pbkware/js-utils';
import { ButtonUiAction, CommandRegisterService, InternalCommand, StringId, Strings } from '@plxtra/motif-core';
import { ComponentBaseNgDirective } from 'component-ng-api';
import { CommandRegisterNgService } from 'component-services-ng-api';
import { ButtonInputNgComponent } from 'controls-ng-api';
import { ButtonInputNgComponent as ButtonInputNgComponent_1 } from '../../../../controls/boolean/button/button-input/ng/button-input-ng.component';

@Component({
    selector: 'app-advert-ticker',
    templateUrl: './advert-ticker-ng.component.html',
    styleUrls: ['./advert-ticker-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonInputNgComponent_1]
})
export class AdvertTickerNgComponent extends ComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    private readonly _leftInterestedButtonComponentSignal = viewChild.required<ButtonInputNgComponent>('leftInterestedButton');
    private readonly _rightInterestedButtonComponentSignal = viewChild.required<ButtonInputNgComponent>('rightInterestedButton');

    private readonly _interestedUiAction: ButtonUiAction;

    private readonly _commandRegisterService: CommandRegisterService;

    private _leftInterestedButtonComponent: ButtonInputNgComponent;
    private _rightInterestedButtonComponent: ButtonInputNgComponent;

    constructor() {
        const commandRegisterNgService = inject(CommandRegisterNgService);

        super(++AdvertTickerNgComponent.typeInstanceCreateCount);

        this._commandRegisterService = commandRegisterNgService.service;

        this._interestedUiAction = this.createInterestedUiAction();
    }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit() {
        this._leftInterestedButtonComponent = this._leftInterestedButtonComponentSignal();
        this._rightInterestedButtonComponent = this._rightInterestedButtonComponentSignal();

        delay1Tick(() => this.initialiseUiActions());
    }

    private finalise() {
        this._interestedUiAction.finalise();
    }

    private createInterestedUiAction(): ButtonUiAction {
        const commandName = InternalCommand.Id.RegisterInterestInFocusedAdvertisement;
        const displayId = StringId.Interested;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.AdvertTicker_InterestedTitle]);
        action.pushUnselected();
        // action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }

    private initialiseUiActions() {
        this._leftInterestedButtonComponent.initialise(this._interestedUiAction);
        this._rightInterestedButtonComponent.initialise(this._interestedUiAction);
    }
}
