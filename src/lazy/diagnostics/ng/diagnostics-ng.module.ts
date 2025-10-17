import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DebugDiagnosticsNgComponent } from '../debug/ng-api';

@NgModule({
    exports: [
        DebugDiagnosticsNgComponent,
    ],
    imports: [
        CommonModule,
        DebugDiagnosticsNgComponent,
    ]
})

export class DiagnosticsNgModule {
    get debugComponentType() { return DebugDiagnosticsNgComponent; }
}
