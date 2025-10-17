import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { CaptionLabelNgComponent } from '../../../controls/label/caption-label/ng/caption-label-ng.component';
import { TextInputNgComponent } from '../../../controls/string/text-input/ng/text-input-ng.component';
import { IntegerCaptionedItemsCheckboxNgComponent } from '../../../controls/enum-array/captioned-enum-array-checkbox/ng/integer-captioned-items-checkbox-ng.component';
import { EnumArrayInputNgComponent } from '../../../controls/enum-array/enum-array-input/ng/enum-array-input-ng.component';
import { CaptionedCheckboxNgComponent } from '../../../controls/boolean/captioned-checkbox/ng/captioned-checkbox-ng.component';
import { SvgButtonNgComponent } from '../../../controls/boolean/button/icon/svg-button/ng/svg-button-ng.component';

@Component({
    selector: 'app-search-symbols-condition-ng',
    templateUrl: './search-symbols-condition-ng.component.html',
    styleUrls: ['./search-symbols-condition-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CaptionLabelNgComponent, TextInputNgComponent, IntegerCaptionedItemsCheckboxNgComponent, EnumArrayInputNgComponent, CaptionedCheckboxNgComponent, SvgButtonNgComponent]
})
export class SearchSymbolsConditionNgComponent extends ContentComponentBaseNgDirective {
    private static typeInstanceCreateCount = 0;

    constructor() {
        super(++SearchSymbolsConditionNgComponent.typeInstanceCreateCount);
    }
}
