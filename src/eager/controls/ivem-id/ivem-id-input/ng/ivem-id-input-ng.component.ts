import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, model, viewChild } from '@angular/core';
import { UiAction } from '@pbkware/ui-action';
import { IvemId, IvemIdUiAction, MarketsService, StringId, Strings, SymbolsService } from '@plxtra/motif-core';
import { MarketsNgService, SymbolsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';

@Component({
    selector: 'app-ivem-id-input',
    templateUrl: './ivem-id-input-ng.component.html',
    styleUrls: ['./ivem-id-input-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class IvemIdInputNgComponent extends ControlComponentBaseNgDirective implements AfterViewInit {
    private static typeInstanceCreateCount = 0;

    readonly inputId = model<string>();

    public symbol = IvemIdInputNgComponent.emptySymbol;

    private readonly ivemidInputSignal = viewChild.required<ElementRef>('ivemidInput');

    private readonly _marketsService: MarketsService;
    private readonly _symbolsService: SymbolsService;

    private ivemidInput: ElementRef;

    constructor() {
        super(++IvemIdInputNgComponent.typeInstanceCreateCount, ControlComponentBaseNgDirective.textControlStateColorItemIdArray);

        const marketsNgService = inject(MarketsNgService);
        const symbolsNgService = inject(SymbolsNgService);

        this._marketsService = marketsNgService.service;
        this._symbolsService = symbolsNgService.service;
        this.inputId.set(`IvemIdInput:${this.typeInstanceId}`);
    }

    public override get uiAction() { return super.uiAction as IvemIdUiAction; }

    ngAfterViewInit(): void {
        this.ivemidInput = this.ivemidInputSignal();
    }

    onInput(value: string): void {
        if (this.uiAction.stateId !== UiAction.StateId.Readonly) {
            this.input(value);
        }
    }

    onEnterKeyDown(value: string): void {
        if (this.uiAction.stateId !== UiAction.StateId.Readonly) {
            this.tryCommitText(value, UiAction.CommitTypeId.Explicit);
        }
    }

    onBlur(value: string): void {
        if (this.uiAction.stateId !== UiAction.StateId.Readonly) {
            this.tryCommitText(value, UiAction.CommitTypeId.Implicit);
        }
    }

    protected override pushSettings() {
        super.pushSettings();
        this.applyValue(this.uiAction.value, false);
    }

    protected override setUiAction(action: IvemIdUiAction) {
        const pushEventHandlersInterface = super.setUiAction(action) as IvemIdUiAction.PushEventHandlersInterface;

        pushEventHandlersInterface.value = (value, edited, selectAll) => this.handleValuePushEvent(value, edited, selectAll);

        this.applyValue(action.value, action.edited);

        return pushEventHandlersInterface;
    }

    private handleValuePushEvent(value: IvemId | undefined, edited: boolean, selectAll: boolean) {
        this.applyValue(value, edited, selectAll);
    }

    private applyValue(value: IvemId | undefined, edited: boolean, selectAll = true) {
        if (!edited) {
            let symbol: string;
            if (value === undefined) {
                symbol = IvemIdInputNgComponent.emptySymbol;
            } else {
                symbol = this._symbolsService.ivemIdToDisplay(value);
            }

            if (symbol !== this.symbol) {
                this.symbol = symbol;
                this.markForCheck();
            }

            if (selectAll) {
                // delay1Tick(() => this.selectAllText() );
            }
        }
    }

    private parseSymbol(value: string): SymbolsService.IvemIdParseDetails {
        return this._symbolsService.parseIvemId(value);
    }

    private input(text: string) {
        let parseDetails: SymbolsService.IvemIdParseDetails | undefined;
        let errorText: string | undefined;
        const missing = text === '';
        if (!missing) {
            parseDetails = this.parseSymbol(text);
            errorText = parseDetails.errorText;
        } else {
            if (this.uiAction.valueRequired) {
                parseDetails = SymbolsService.IvemIdParseDetails.createFail(this._marketsService, text, Strings[StringId.ValueRequired]);
                errorText = parseDetails.errorText;
            } else {
                errorText = undefined;
            }
        }

        const valid = errorText === undefined;
        this.uiAction.input(text, valid, missing, errorText);

        if (valid && this.uiAction.commitOnAnyValidInput) {
            this.commitValue(parseDetails, UiAction.CommitTypeId.Input);
        }
    }

    private commitValue(parseDetails: SymbolsService.IvemIdParseDetails | undefined, typeId: UiAction.CommitTypeId) {
        this.uiAction.commitValue(parseDetails, typeId);
    }

    private tryCommitText(text: string, typeId: UiAction.CommitType.NotInputId) {
        if (text === '') {
            if (!this.uiAction.valueRequired) {
                this.commitValue(undefined, typeId);
            }
        } else {
            const parseDetails = this.parseSymbol(text);
            if (parseDetails.errorText === undefined) {
                this.commitValue(parseDetails, typeId);
            } // else input will show error
        }
    }

    private selectAllText() {
        (this.ivemidInput.nativeElement as HTMLInputElement).select();
    }
}

export namespace IvemIdInputNgComponent {
    export const emptySymbol = '';
}
