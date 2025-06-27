import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, model, Renderer2, viewChild } from '@angular/core';
import { AssertInternalError, delay1Tick, ModifierKey } from '@pbkware/js-utils';
import { BooleanUiAction, UiAction } from '@pbkware/ui-action';
import { ButtonUiAction } from '@plxtra/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../../ng/control-component-base-ng.directive';

@Component({
    selector: 'app-button-input',
    templateUrl: './button-input-ng.component.html',
    styleUrls: ['./button-input-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ButtonInputNgComponent extends ControlComponentBaseNgDirective implements AfterViewInit{
    private static typeInstanceCreateCount = 0;

    readonly inputId = model<string>();

    private readonly _buttonRefSignal = viewChild.required<ElementRef>('button');

    private _buttonRef: ElementRef;

    private _value: boolean;

    constructor(elRef: ElementRef<HTMLElement>, private _renderer: Renderer2, cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(elRef, ++ButtonInputNgComponent.typeInstanceCreateCount, cdr, settingsNgService.service, ControlComponentBaseNgDirective.clickControlStateColorItemIdArray);
        this.inputId.set(`ButtonInput:${this.typeInstanceId}`);
    }

    public override get uiAction() { return super.uiAction as ButtonUiAction; }
    private get value() { return this._value; }

    ngAfterViewInit(): void {
        this._buttonRef = this._buttonRefSignal();

        delay1Tick(() => this.setInitialiseReady());
    }

    onClick(event: Event) {
        if (!(event instanceof MouseEvent)) {
            throw new AssertInternalError('BICOE1999580');
        } else {
            const downKeys = ModifierKey.IdSet.create(event.altKey, event.ctrlKey, event.metaKey, event.shiftKey);
            this.uiAction.signal(UiAction.SignalTypeId.MouseClick, downKeys);
        }
    }

    onEnterKeyDown(event: Event) {
        if (!(event instanceof KeyboardEvent)) {
            throw new AssertInternalError('BICOSED33845092');
        } else {
            const downKeys = ModifierKey.IdSet.create(event.altKey, event.ctrlKey, event.metaKey, event.shiftKey);
            this.uiAction.signal(UiAction.SignalTypeId.EnterKeyPress, downKeys);
        }
    }

    onSpacebarKeyDown(event: Event) {
        if (!(event instanceof KeyboardEvent)) {
            throw new AssertInternalError('BICOSKD4474982');
        } else {
            const downKeys = ModifierKey.IdSet.create(event.altKey, event.ctrlKey, event.metaKey, event.shiftKey);
            this.uiAction.signal(UiAction.SignalTypeId.SpacebarKeyPress, downKeys);
        }
    }

    protected override setUiAction(action: ButtonUiAction) {
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
            this._value = false;
        } else {
            this._value = value;
        }
        this.markForCheck();
    }
}
