import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, input, model, viewChild } from '@angular/core';
import { Err, Ok, Result } from '@pbkware/js-utils';
import { DateUiAction, UiAction } from '@pbkware/ui-action';
import { DateText, StringId, Strings } from '@plxtra/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';

@Component({
    selector: 'app-date-input',
    templateUrl: './date-input-ng.component.html',
    styleUrls: ['./date-input-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DateInputNgComponent extends ControlComponentBaseNgDirective implements OnInit, AfterViewInit{
    private static typeInstanceCreateCount = 0;

    public dateAsStr = DateInputNgComponent.emptyDateStr;

    readonly size = input('12');
    readonly inputId = model<string>();

    private readonly _dateInputSignal = viewChild.required<ElementRef<HTMLInputElement>>('dateInput');

    private _dateInput: ElementRef<HTMLInputElement>;

    private _utc = true;

    constructor(elRef: ElementRef<HTMLElement>, cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(elRef, ++DateInputNgComponent.typeInstanceCreateCount, cdr, settingsNgService.service, ControlComponentBaseNgDirective.textControlStateColorItemIdArray);
        this.inputId.set(`DateInput:${this.typeInstanceId}`);
    }

    get utc() { return this._utc; }

    public override get uiAction() { return super.uiAction as DateUiAction; }

    ngOnInit() {
        this.setInitialiseReady();
    }

    ngAfterViewInit(): void {
        this._dateInput = this._dateInputSignal();
    }

    onInput(value: string): void {
        if (this.uiAction.stateId !== UiAction.StateId.Readonly) {
            this.input(value);
        }
    }

    onEnterKeyDown(text: string): void {
        if (this.uiAction.stateId !== UiAction.StateId.Readonly) {
            this.tryCommitText(text, UiAction.CommitTypeId.Explicit);
        }
    }

    onBlur(text: string): void {
        if (this.uiAction.stateId !== UiAction.StateId.Readonly) {
            this.tryCommitText(text, UiAction.CommitTypeId.Implicit);
        }
    }

    onChange(text: string): void {
        if (this.uiAction.stateId !== UiAction.StateId.Readonly) {
            this.tryCommitText(text, UiAction.CommitTypeId.Implicit);
        }
    }

    protected override pushSettings() {
        super.pushSettings();
        this.applyValue(this.uiAction.value, this.uiAction.edited);
    }

    protected override setUiAction(action: DateUiAction) {
        const pushEventHandlersInterface = super.setUiAction(action) as DateUiAction.PushEventHandlersInterface;

        pushEventHandlersInterface.value = (value, edited) => this.handleValuePushEvent(value, edited);

        this.applyValue(action.value, action.edited);

        return pushEventHandlersInterface;
    }

    private handleValuePushEvent(value: Date | undefined, edited: boolean) {
        this.applyValue(value, edited);
    }

    private applyValue(value: Date | undefined, edited: boolean) {
        if (!edited) {
            let dateAsStr: string;
            if (value === undefined) {
                dateAsStr = DateInputNgComponent.emptyDateStr;
            } else {
                dateAsStr = DateText.fromDate(value, this._utc);
            }

            this.applyValueAsString(dateAsStr);
        }
    }

    private applyValueAsString(dateAsStr: string) {
            // hack to get around value attribute change detection not working
            if (dateAsStr === this.dateAsStr) {
                this._dateInput.nativeElement.value = dateAsStr;
                // this._renderer.setProperty(this._dateInput, 'value', dateAsStr);
            }

            this.dateAsStr = dateAsStr;
            this.markForCheck();
    }

    private parseString(value: string): Result<Date> {
        const parsedDate = DateText.toDate(value, this._utc);
        if (parsedDate === undefined) {
            return new Err(Strings[StringId.InvalidDate]);
        } else {
            return new Ok(parsedDate);
        }
    }

    private input(text: string) {
        let valid: boolean;
        let missing: boolean;
        let value: Date | undefined;
        let errorText: string | undefined;
        if (text !== DateInputNgComponent.emptyDateStr) {
            const parseResult = this.parseString(text);
            if (parseResult.isErr()) {
                errorText = parseResult.error;
            } else {
                value = parseResult.value
            }
            valid = value !== undefined;
            missing = false;
        } else {
            missing = this.uiAction.valueRequired;
            if (missing) {
                valid = false;
                errorText = Strings[StringId.ValueRequired];
            } else {
                valid = true;
            }
        }

        this.uiAction.input(text, valid, missing, errorText);

        if (valid && this.uiAction.commitOnAnyValidInput) {
            this.commitValue(value, UiAction.CommitTypeId.Input);
        }
    }

    private commitValue(value: Date | undefined, typeId: UiAction.CommitTypeId) {
        this.uiAction.commitValue(value, typeId);
    }

    private tryCommitText(text: string, typeId: UiAction.CommitType.NotInputId) {
        if (text === DateInputNgComponent.emptyDateStr) {
            if (!this.uiAction.valueRequired) {
                this.commitValue(undefined, typeId);
            }
        } else {
            const parseResult = this.parseString(text);
            if (parseResult.isOk()) {
                this.commitValue(parseResult.value, typeId);
            }
        }
    }
}

export namespace DateInputNgComponent {
    export const emptyDateStr = '';
}
