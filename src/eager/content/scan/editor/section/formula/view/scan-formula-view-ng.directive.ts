import { Directive, InjectionToken } from '@angular/core';
import { ScanEditor } from '@plxtra/motif-core';
import { ContentComponentBaseNgDirective } from '../../../../../ng/content-component-base-ng.directive';

@Directive()
export abstract class ScanFormulaViewNgDirective extends ContentComponentBaseNgDirective {
    protected _scanEditor: ScanEditor | undefined;

    get scanEditor() { return this._scanEditor; }

    setEditor(value: ScanEditor | undefined) {
        this._scanEditor = value;
    }
}

export namespace ScanFormulaViewNgDirective {
    export const enum FieldId {
        Criteria,
        Rank,
    }

    export const fieldIdInjectionToken = new InjectionToken<FieldId>('ScanFormulaViewFieldId');
}
