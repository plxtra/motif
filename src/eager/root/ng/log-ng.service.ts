import { Injectable, isDevMode, inject } from '@angular/core';
import { LogService } from '../log-service';
import { TelemetryNgService } from './telemetry-ng.service';

@Injectable({
    providedIn: 'root'
})
export class LogNgService {
    private _service: LogService;

    constructor() {
        const telemetryNgService = inject(TelemetryNgService);

        this._service = new LogService(
            isDevMode(),
            telemetryNgService.service
        );
    }

    get service() { return this._service; }
}
