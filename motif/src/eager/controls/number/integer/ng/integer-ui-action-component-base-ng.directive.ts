import { Directive } from '@angular/core';
import { isPartialIntlFormattedInteger, parseIntStrict } from '@pbkware/js-utils';
import { StringId, Strings } from '@plxtra/motif-core';
import { NumberUiActionComponentBaseNgDirective } from '../../ng/number-ui-action-component-base-ng.directive';

@Directive()
export abstract class IntegerUiActionComponentBaseNgDirective extends NumberUiActionComponentBaseNgDirective {
    protected isTextOk(value: string) {
        return isPartialIntlFormattedInteger(value, this.numberFormatCharParts);
    }

    protected override parseString(value: string): NumberUiActionComponentBaseNgDirective.ParseStringResult {
        const numberGroupCharRemoveRegex = this.numberGroupCharRemoveRegex;
        if (numberGroupCharRemoveRegex !== undefined) {
            value = value.replace(numberGroupCharRemoveRegex, '');
        }
        const parsedNumber = parseIntStrict(value);
        if (parsedNumber === undefined) {
            return { errorText: Strings[StringId.InvalidIntegerString] };
        } else {
            return { parsedNumber };
        }
    }
}
