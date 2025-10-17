import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AssertInternalError, delay1Tick } from '@pbkware/js-utils';
import { ButtonUiAction, CommandRegisterService, InternalCommand, StringId, Strings } from '@plxtra/motif-core';
import { ComponentBaseNgDirective } from 'component-ng-api';
import { CommandRegisterNgService } from 'component-services-ng-api';
import { ButtonInputNgComponent } from 'controls-ng-api';

@Component({
    selector: 'app-signed-out',
    templateUrl: './signed-out-ng.component.html',
    styleUrls: ['./signed-out-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonInputNgComponent]
})
export class SignedOutNgComponent extends ComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    public signedOutText = Strings[StringId.SignedOut];

    private readonly _router = inject(Router);

    private readonly _signInAgainButtonComponentSignal = viewChild.required<ButtonInputNgComponent>('signInAgainButton');

    private readonly _commandRegisterService: CommandRegisterService;
    private readonly _signInAgainUiAction: ButtonUiAction;

    private _signInAgainButtonComponent: ButtonInputNgComponent;

    constructor() {
        const commandRegisterNgService = inject(CommandRegisterNgService);

        super(++SignedOutNgComponent.typeInstanceCreateCount);

        this._commandRegisterService = commandRegisterNgService.service;
        this._signInAgainUiAction = this.createSignInAgainUiAction();
    }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._signInAgainButtonComponent = this._signInAgainButtonComponentSignal();

        delay1Tick(() => this.initialise());
    }

    private handleSignInAgainSignal() {
        const promise = this._router.navigate(['/startup']);
        promise.then(
            () => {/**/},
            (error: unknown) => { throw AssertInternalError.createIfNotError(error, 'SINGHSIAS'); }
        )
    }

    private createSignInAgainUiAction() {
        const commandName = InternalCommand.Id.SignInAgain;
        const displayId = StringId.SignInAgain;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.signalEvent = () => this.handleSignInAgainSignal();
        return action;
    }

    private initialise() {
        this._signInAgainButtonComponent.initialise(this._signInAgainUiAction);
    }

    private finalise() {
        this._signInAgainUiAction.finalise();
    }
}
