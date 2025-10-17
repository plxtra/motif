import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, input, model, viewChild } from '@angular/core';
import { delay1Tick } from '@pbkware/js-utils';
import { StringUiAction, UiAction } from '@pbkware/ui-action';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { NgStyle } from '@angular/common';

@Component({
    selector: 'app-text-input', // should be xxx-input-control
    templateUrl: './text-input-ng.component.html',
    styleUrls: ['./text-input-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgStyle]
})
export class TextInputNgComponent extends ControlComponentBaseNgDirective implements AfterViewInit {
    private static typeInstanceCreateCount = 0;

    readonly inputId = model<string>();
    readonly size = input('20'); // same as HTML default

    public displayValue = '';

    private readonly _textInputSignal = viewChild.required<ElementRef<HTMLInputElement>>('textInput');

    private _textInput: ElementRef<HTMLInputElement>;

    constructor() {
        super(++TextInputNgComponent.typeInstanceCreateCount, ControlComponentBaseNgDirective.textControlStateColorItemIdArray);
        this.inputId.set(`TextInput:${this.typeInstanceId}`);
    }

    public override get uiAction() { return super.uiAction as StringUiAction; }

    ngAfterViewInit(): void {
        this._textInput = this._textInputSignal();

        delay1Tick(() => this.setInitialiseReady());
    }

    onInput(value: string): void {
        if (this.uiAction.stateId !== UiAction.StateId.Readonly) {
            this.input(value);
        }
    }

    onEnterKeyDown(value: string): void {
        if (this.uiAction.stateId !== UiAction.StateId.Readonly) {
            this.commitValue(value, UiAction.CommitTypeId.Explicit);
        }
    }

    onBlur(value: string): void {
        if (this.uiAction.stateId !== UiAction.StateId.Readonly) {
            this.commitValue(value, UiAction.CommitTypeId.Implicit);
        }
    }

    onEscKeyDown(): void {
        this.uiAction.cancelEdit();
    }

    protected override setUiAction(action: StringUiAction) {
        const pushEventHandlersInterface = super.setUiAction(action) as StringUiAction.PushEventHandlersInterface;

        pushEventHandlersInterface.value = (value, edited) => this.handleValuePushEvent(value, edited)

        this.applyValue(action.value, action.edited);

        return pushEventHandlersInterface;
    }

    private handleValuePushEvent(value: string | undefined, edited: boolean) {
        this.applyValue(value, edited);
    }

    private applyValue(value: string | undefined, edited: boolean) {
        if (!edited) {
            let displayValue: string;
            if (value === undefined) {
                displayValue = '';
            } else {
                displayValue = value;
            }

            this.applyValueAsString(displayValue);
        }
    }

    private applyValueAsString(displayValue: string) {
        // hack to get around value attribute change detection not working
        if (displayValue === this.displayValue) {
            this._textInput.nativeElement.value = displayValue;
            // this._renderer.setProperty(this._dateInput, 'value', dateAsStr);
        }

        this.displayValue = displayValue;
        this.markForCheck();
    }

    private input(text: string) {
        this.uiAction.input(text, true, false, undefined);

        if (this.uiAction.commitOnAnyValidInput) {
            this.commitValue(text, UiAction.CommitTypeId.Input);
        }
    }

    private commitValue(value: string, typeId: UiAction.CommitTypeId) {
        this.uiAction.commitValue(value, typeId);
    }
}
