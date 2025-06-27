import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, input, model, viewChild } from '@angular/core';
import { delay1Tick, Integer, isPartialIntlFormattedNumber } from '@pbkware/js-utils';
import { StringId, Strings } from '@plxtra/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { NumberUiActionComponentBaseNgDirective } from '../../ng/number-ui-action-component-base-ng.directive';

@Component({
    selector: 'app-number-input',
    templateUrl: './number-input-ng.component.html',
    styleUrls: ['./number-input-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class NumberInputNgComponent extends NumberUiActionComponentBaseNgDirective implements AfterViewInit {
    private static typeInstanceCreateCount = 0;

    readonly size = input('12');
    readonly inputId = model<string>();

    private readonly _numberInputSignal = viewChild.required<ElementRef<HTMLInputElement>>('numberInput');

    private _numberInput: ElementRef<HTMLInputElement>;

    private _numberInputElement: HTMLInputElement;
    private _oldText: string | undefined;
    private _oldSelectionStart: Integer | null;
    private _oldSelectionEnd: Integer | null;

    constructor(elRef: ElementRef<HTMLElement>, cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(
            elRef,
            ++NumberInputNgComponent.typeInstanceCreateCount,
            cdr,
            settingsNgService.service,
            ControlComponentBaseNgDirective.textControlStateColorItemIdArray
        );
        this.inputId.set(`NumberInput:${this.typeInstanceId}`);
    }

    ngAfterViewInit(): void {
        this._numberInput = this._numberInputSignal();

        delay1Tick(() => {
            this.setNumberInputElement(this._numberInput.nativeElement);
            this.setInitialiseReady();
        });
    }

    protected override parseString(value: string): NumberUiActionComponentBaseNgDirective.ParseStringResult {
        const numberGroupCharRemoveRegex = this.numberGroupCharRemoveRegex;
        if (numberGroupCharRemoveRegex !== undefined) {
            value = value.replace(numberGroupCharRemoveRegex, '');
        }
        const parsedNumber = Number(value);
        if (isNaN(parsedNumber)) {
            return { errorText: Strings[StringId.InvalidNumber] };
        } else {
            return { parsedNumber };
        }
    }

    protected override applyValue(value: number | undefined, edited: boolean) {
        if (!edited) {
            let numberAsStr: string;
            if (value === undefined) {
                numberAsStr = NumberUiActionComponentBaseNgDirective.emptyNumberStr;
            } else {
                numberAsStr = this.numberFormat.format(value);
                this.numberAsStr = numberAsStr;
            }

            this.applyValueAsString(numberAsStr);
        }
    }

    protected testInputValue(text?: string): boolean {
        text = (text === undefined) ? this._numberInputElement.value : text;
        if (this.isTextOk(text) || text.length === 0) {
            this._oldText = text;
            this._oldSelectionStart = this._numberInputElement.selectionStart;
            this._oldSelectionEnd = this._numberInputElement.selectionEnd;
            return true;
        } else {
            const valueAsText = this._oldText === undefined ? '' : this._oldText;
            this.applyValueAsString(valueAsText);
            if (this._oldSelectionStart !== null && this._oldSelectionEnd !== null) {
                this._numberInputElement.setSelectionRange(this._oldSelectionStart, this._oldSelectionEnd);
            }
            return false;
        }
    }

    private applyValueAsString(numberAsStr: string) {
        // hack to get around value attribute change detection not working
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (numberAsStr === this.numberAsStr && this._numberInputElement !== undefined) {
            this._numberInputElement.value = numberAsStr;
            // this._renderer.setProperty(this._numberInput, 'value', numberAsStr);
        }

        this.numberAsStr = numberAsStr;
        this.markForCheck();
    }

    private setNumberInputElement(value: HTMLInputElement) {
        this._numberInputElement = value;
        ['keydown', 'keyup', 'mousedown', 'mouseup', 'select', 'contextmenu', 'drop'].forEach((event: string) => {
            this._numberInputElement.addEventListener(event, () => this.testInputValue());
        });
    }

    private isTextOk(value: string) {
        return isPartialIntlFormattedNumber(value, this.numberFormatCharParts);
    }
}
