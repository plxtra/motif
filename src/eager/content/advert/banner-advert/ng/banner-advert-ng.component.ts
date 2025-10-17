import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, viewChild, inject } from '@angular/core';
import { delay1Tick } from '@pbkware/js-utils';
import { ButtonUiAction, CommandRegisterService, InternalCommand, StringId, Strings } from '@plxtra/motif-core';
import { CommandRegisterNgService } from 'component-services-ng-api';
import { ButtonInputNgComponent } from 'controls-ng-api';

@Component({
    selector: 'app-banner-advert',
    templateUrl: './banner-advert-ng.component.html',
    styleUrls: ['./banner-advert-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonInputNgComponent]
})
export class BannerAdvertNgComponent implements OnDestroy, AfterViewInit {
    private readonly _leftContactMeButtonComponentSignal = viewChild.required<ButtonInputNgComponent>('leftContactMeButton');
    private readonly _leftInterestedButtonComponentSignal = viewChild.required<ButtonInputNgComponent>('leftInterestedButton');
    private readonly _leftSimilarButtonComponentSignal = viewChild.required<ButtonInputNgComponent>('leftSimilarButton');
    private readonly _leftNotInterestedButtonComponentSignal = viewChild.required<ButtonInputNgComponent>('leftNotInterestedButton');
    private readonly _rightContactMeButtonComponentSignal = viewChild.required<ButtonInputNgComponent>('rightContactMeButton');
    private readonly _rightInterestedButtonComponentSignal = viewChild.required<ButtonInputNgComponent>('rightInterestedButton');
    private readonly _rightSimilarButtonComponentSignal = viewChild.required<ButtonInputNgComponent>('rightSimilarButton');
    private readonly _rightNotInterestedButtonComponentSignal = viewChild.required<ButtonInputNgComponent>('rightNotInterestedButton');

    private readonly _contactMeUiAction: ButtonUiAction;
    private readonly _interestedUiAction: ButtonUiAction;
    private readonly _similarUiAction: ButtonUiAction;
    private readonly _notInterestedUiAction: ButtonUiAction;

    private readonly _commandRegisterService: CommandRegisterService;

    private _leftContactMeButtonComponent: ButtonInputNgComponent;
    private _leftInterestedButtonComponent: ButtonInputNgComponent;
    private _leftSimilarButtonComponent: ButtonInputNgComponent;
    private _leftNotInterestedButtonComponent: ButtonInputNgComponent;
    private _rightContactMeButtonComponent: ButtonInputNgComponent;
    private _rightInterestedButtonComponent: ButtonInputNgComponent;
    private _rightSimilarButtonComponent: ButtonInputNgComponent;
    private _rightNotInterestedButtonComponent: ButtonInputNgComponent;

    constructor() {
        const commandRegisterNgService = inject(CommandRegisterNgService);

        this._commandRegisterService = commandRegisterNgService.service;

        this._contactMeUiAction = this.createContactMeUiAction();
        this._interestedUiAction = this.createInterestedUiAction();
        this._similarUiAction = this.createSimilarUiAction();
        this._notInterestedUiAction = this.createNotInterestedUiAction();
    }

    ngOnDestroy(): void {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._leftContactMeButtonComponent = this._leftContactMeButtonComponentSignal();
        this._leftInterestedButtonComponent = this._leftInterestedButtonComponentSignal();
        this._leftSimilarButtonComponent = this._leftSimilarButtonComponentSignal();
        this._leftNotInterestedButtonComponent = this._leftNotInterestedButtonComponentSignal();
        this._rightContactMeButtonComponent = this._rightContactMeButtonComponentSignal();
        this._rightInterestedButtonComponent = this._rightInterestedButtonComponentSignal();
        this._rightSimilarButtonComponent = this._rightSimilarButtonComponentSignal();
        this._rightNotInterestedButtonComponent = this._rightNotInterestedButtonComponentSignal();

        delay1Tick(() => this.initialise());
    }

    private initialise() {
        this._leftContactMeButtonComponent.initialise(this._contactMeUiAction);
        this._leftInterestedButtonComponent.initialise(this._interestedUiAction);
        this._leftSimilarButtonComponent.initialise(this._similarUiAction);
        this._leftNotInterestedButtonComponent.initialise(this._notInterestedUiAction);
        this._rightContactMeButtonComponent.initialise(this._contactMeUiAction);
        this._rightInterestedButtonComponent.initialise(this._interestedUiAction);
        this._rightSimilarButtonComponent.initialise(this._similarUiAction);
        this._rightNotInterestedButtonComponent.initialise(this._notInterestedUiAction);
    }

    private finalise() {
        this._contactMeUiAction.finalise();
        this._interestedUiAction.finalise();
        this._similarUiAction.finalise();
        this._notInterestedUiAction.finalise();
    }

    private createContactMeUiAction(): ButtonUiAction {
        const commandName = InternalCommand.Id.RegisterContactRequestRegardingFocusedAdvertisement;
        const displayId = StringId.ContactMe;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.BannerAdvert_ContactMeTitle]);
        action.pushUnselected();
        // action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }

    private createInterestedUiAction(): ButtonUiAction {
        const commandName = InternalCommand.Id.RegisterInterestInFocusedAdvertisement;
        const displayId = StringId.Interested;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.BannerAdvert_InterestedTitle]);
        action.pushUnselected();
        // action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }

    private createSimilarUiAction(): ButtonUiAction {
        const commandName = InternalCommand.Id.RegisterInterestInSimilarToFocusedAdvertisement;
        const displayId = StringId.Similar;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.BannerAdvert_SimilarTitle]);
        action.pushUnselected();
        // action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }

    private createNotInterestedUiAction(): ButtonUiAction {
        const commandName = InternalCommand.Id.RegisterNotInterestedInFocusedAdvertisement;
        const displayId = StringId.NotInterested;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.BannerAdvert_NotInterestedTitle]);
        action.pushUnselected();
        // action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }
}
