import { Injectable } from '@angular/core';
import { SignOutService } from '../sign-out-service';

@Injectable({
    providedIn: 'root',
})
export class SignOutNgService {
    private readonly _service: SignOutService;

    constructor() {
        this._service = new SignOutService();
    }

    get service() { return this._service; }
}
