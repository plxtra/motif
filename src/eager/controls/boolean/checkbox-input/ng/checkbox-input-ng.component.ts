import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, model, OnInit, viewChild } from '@angular/core';
import { BooleanUiAction, UiAction } from '@pbkware/ui-action';
import { SettingsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';

@Component({
    selector: 'app-checkbox-input', // should be xxx-checkbox
    templateUrl: './checkbox-input-ng.component.html',
    styleUrls: ['./checkbox-input-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class CheckboxInputNgComponent extends ControlComponentBaseNgDirective implements OnInit, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    readonly checked = model<boolean>(false);
    readonly inputId = model<string>();

    private readonly _checkboxInputSignal = viewChild.required<ElementRef<HTMLInputElement>>('checkboxInput');

    private _checkboxInput: ElementRef<HTMLInputElement>;

    constructor(elRef: ElementRef<HTMLElement>, cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(elRef, ++CheckboxInputNgComponent.typeInstanceCreateCount, cdr, settingsNgService.service, ControlComponentBaseNgDirective.clickControlStateColorItemIdArray);
        this.inputId.set(`Checkbox:${this.typeInstanceId}`);
    }

    public override get uiAction() { return super.uiAction as BooleanUiAction; }

    ngOnInit() {
        this.setInitialiseReady();
    }

    ngAfterViewInit(): void {
        this._checkboxInput = this._checkboxInputSignal();
    }

    onChange(checked: boolean) {
        this.commitValue(checked);
    }

    protected override setUiAction(action: BooleanUiAction) {
        const pushEventHandlersInterface = super.setUiAction(action) as BooleanUiAction.PushEventHandlersInterface;

        pushEventHandlersInterface.value = (value, edited) => this.handleValuePushEvent(value, edited);

        this.applyValue(action.value, action.edited);

        return pushEventHandlersInterface;
    }

    private handleValuePushEvent(value: boolean | undefined, edited: boolean) {
        this.applyValue(value, edited);
    }

    private applyValue(value: boolean | undefined, _edited: boolean) {
        if (value === undefined) {
            this._checkboxInput.nativeElement.indeterminate = true;
        } else {
            this._checkboxInput.nativeElement.indeterminate = false;
            this.checked.set(value);
        }
        this.markForCheck();
    }

    private commitValue(value: boolean) {
        this.uiAction.commitValue(value, UiAction.CommitTypeId.Explicit);
    }
}
