import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { ScanEditor } from '@plxtra/motif-core';
import { ComponentBaseNgDirective } from 'component-ng-api';
import { ZenithScanFormulaViewNgDirective } from '../../ng/zenith-scan-formula-view-ng.directive';

@Component({
    selector: 'app-rank-zenith-scan-formula-view',
    templateUrl: './rank-zenith-scan-formula-view-ng.component.html',
    styleUrls: ['./rank-zenith-scan-formula-view-ng.component.scss'],
    providers: [{ provide: ComponentBaseNgDirective.typeInstanceCreateIdInjectionToken, useValue: ++RankZenithScanFormulaViewNgComponent.typeInstanceCreateCount }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class RankZenithScanFormulaViewNgComponent extends ZenithScanFormulaViewNgDirective implements OnDestroy {
    protected getFormulaAsZenithText(editor: ScanEditor) {
        return editor.rankAsZenithText;
    }

    protected override setFormulaAsZenithText(editor: ScanEditor, text: string, modifier: ScanEditor.Modifier) {
        return editor.setRankAsZenithText(text, modifier);
    }

    protected getFormulaAsZenithTextIfChanged(editor: ScanEditor, changedFieldIds: readonly ScanEditor.FieldId[]): string | undefined {
        for (const fieldId of changedFieldIds) {
            if (fieldId === ScanEditor.FieldId.RankAsZenithText || fieldId === ScanEditor.FieldId.Rank) {
                return editor.rankAsZenithText;
            }
        }
        return undefined;
    }
}

export namespace RankZenithScanFormulaViewNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;
}
