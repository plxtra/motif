import { AfterViewInit, Directive, ElementRef, inject, model, viewChild } from '@angular/core';
import { Integer } from '@pbkware/js-utils';
import { UiAction } from '@pbkware/ui-action';
import { Market, MarketIvemId, MarketsService, StringId, Strings, SymbolsService } from '@plxtra/motif-core';
import { MarketsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../ng/control-component-base-ng.directive';
import { ReadonlyMarketIvemIdNgDirective } from './readonly-market-ivem-id-ng.directive';

@Directive()
export abstract class MarketIvemIdInputNgComponent<T extends Market> extends ReadonlyMarketIvemIdNgDirective<T> implements AfterViewInit {
    readonly inputId = model<string>();

    private readonly symbolInputSignal = viewChild.required<ElementRef>('marketIvemIdInput');

    private readonly _allMarkets: MarketsService.AllKnownMarkets<T>;
    private readonly _defaultEnvironmentMarkets: MarketsService.DefaultExchangeEnvironmentKnownMarkets<T>;

    private symbolInput: ElementRef;

    constructor(
        typeInstanceCreateId: Integer,
        marketTypeId: Market.TypeId,
        private readonly _marketIvemIdConstructor: MarketIvemId.Constructor<T>,
    ) {
        super(typeInstanceCreateId, ControlComponentBaseNgDirective.textControlStateColorItemIdArray);

        const marketsNgService = inject(MarketsNgService);
        const marketsService = marketsNgService.service;
        this._allMarkets = marketsService.getAllMarkets<T>(marketTypeId);
        this._defaultEnvironmentMarkets = marketsService.getDefaultExchangeEnvironmentMarkets<T>(marketTypeId);
    }

    ngAfterViewInit(): void {
        this.symbolInput = this.symbolInputSignal();
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

    protected selectAllText() {
        (this.symbolInput.nativeElement as HTMLInputElement).select();
    }

    private parseSymbol(value: string): SymbolsService.MarketIvemIdParseDetails<T> {
        return this._symbolsService.parseMarketIvemId(this._allMarkets, this._defaultEnvironmentMarkets, this._marketIvemIdConstructor, value);
    }

    private input(text: string) {
        let parseDetails: SymbolsService.MarketIvemIdParseDetails<T> | undefined;
        let errorText: string | undefined;
        const missing = text === '';
        if (!missing) {
            parseDetails = this.parseSymbol(text);
            errorText = parseDetails.errorText;
        } else {
            if (this.uiAction.valueRequired) {
                parseDetails = SymbolsService.MarketIvemIdParseDetails.createFail(this._allMarkets.genericUnknownMarket, this._marketIvemIdConstructor, text, Strings[StringId.ValueRequired]);
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

    private commitValue(parseDetails: SymbolsService.MarketIvemIdParseDetails<T> | undefined, typeId: UiAction.CommitTypeId) {
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
}

export namespace MarketIvemIdInputNgComponent {
    export const emptySymbol = '';
}
