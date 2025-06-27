import { Injectable } from '@angular/core';
import { NotificationChannelsService } from '@plxtra/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root'
})
export class NotificationChannelsNgService {
    private _service: NotificationChannelsService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.notificationChannelsService;
    }

    get service() { return this._service; }
}
