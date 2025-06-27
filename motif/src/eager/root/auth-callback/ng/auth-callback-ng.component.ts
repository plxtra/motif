import { ChangeDetectionStrategy, Component, ElementRef, OnInit } from '@angular/core';
import { AssertInternalError } from '@pbkware/js-utils';
import { ComponentBaseNgDirective } from 'component-ng-api';
import { SessionNgService } from '../../ng/session-ng.service';
import { SessionService } from '../../session-service';

@Component({
    selector: 'app-auth-callback',
    templateUrl: './auth-callback-ng.component.html',
    styleUrls: ['./auth-callback-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class AuthCallbackNgComponent extends ComponentBaseNgDirective implements OnInit {
    private static typeInstanceCreateCount = 0;

    private readonly _sessionService: SessionService;

    constructor(elRef: ElementRef<HTMLElement>, sessionNgService: SessionNgService) {
        super(elRef, ++AuthCallbackNgComponent.typeInstanceCreateCount);
        this._sessionService = sessionNgService.session;
    }

    ngOnInit() {
        const promise = this._sessionService.completeAuthentication();
        AssertInternalError.throwErrorIfPromiseRejected(promise, 'ACNCNOI20256');
    }
}
