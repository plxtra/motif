import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EagerControlsNgModule } from 'controls-ng-api';
import { DebugDiagnosticsNgComponent } from '../debug/ng-api';

@NgModule({
    exports: [
        DebugDiagnosticsNgComponent,
    ],
    imports: [
        CommonModule,
        EagerControlsNgModule,
        DebugDiagnosticsNgComponent,
    ]
})

export class DiagnosticsNgModule {
    get debugComponentType() { return DebugDiagnosticsNgComponent; }
}
