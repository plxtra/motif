import { AfterViewInit, Directive, inject, model, viewChild } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { AssertInternalError, compareString, ComparisonResult, DecimalFactory, delay1Tick, Integer, MultiEvent } from '@pbkware/js-utils';
import { BooleanUiAction, UiAction } from '@pbkware/ui-action';
import {
    AdiService,
    CommandRegisterService,
    DataIvemId,
    DataMarket,
    Exchange,
    IconButtonUiAction,
    InternalCommand,
    Market,
    MarketIvemId,
    MarketIvemIdUiAction,
    MarketsService,
    SearchSymbolsDataDefinition,
    SearchSymbolsDataIvemBaseDetail,
    StringId,
    Strings,
    SymbolDetailCacheService,
    SymbolsDataItem,
    SymbolsService,
    TradingMarket
} from '@plxtra/motif-core';
import { AdiNgService, CommandRegisterNgService, DecimalFactoryNgService, MarketsNgService, SymbolDetailCacheNgService, SymbolsNgService } from 'component-services-ng-api';
import { distinctUntilChanged, map, merge, Observable, Observer, of, Subject, switchAll, tap, Unsubscribable } from 'rxjs';
import { SvgButtonNgComponent } from '../../boolean/ng-api';
import { NgSelectUtils } from '../../ng-select-utils';
import { ControlComponentBaseNgDirective } from '../../ng/control-component-base-ng.directive';
import { NgSelectOverlayNgService } from '../../ng/ng-select-overlay-ng.service';

@Directive()
export abstract class MarketIvemIdSelectNgDirective<T extends Market> extends ControlComponentBaseNgDirective implements AfterViewInit {
    public readonly inputId = model<string>();

    public symbol = MarketIvemIdSelectNgDirective.emptySymbol;

    // Compilation fails with public items: Observable<DataIvemIdSelectComponent.Item[]>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public items: Observable<any>;
    public loading = false;
    public typeahead = new Subject<string>();
    public selected: MarketIvemIdSelectNgDirective.Item<T> | null;
    public minCodeLength = 2;

    private readonly _ngSelectOverlayNgService = inject(NgSelectOverlayNgService);

    private readonly _ngSelectComponentSignal = viewChild.required<NgSelectComponent>('ngSelect');
    private readonly _searchTermNotExchangedMarketProcessedToggleButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('searchTermNotExchangedMarketProcessedToggleButton');

    private readonly _decimalFactory: DecimalFactory
    private readonly _adiService: AdiService;
    private readonly _symbolsService: SymbolsService;
    private readonly _symbolDetailCacheService: SymbolDetailCacheService;
    private readonly _searchTermNotExchangedMarketProcessedToggleUiAction: BooleanUiAction;

    private readonly _allMarkets: MarketsService.AllKnownMarkets<T>;
    private readonly _defaultEnvironmentMarkets: MarketsService.DefaultExchangeEnvironmentKnownMarkets<T>;

    private _ngSelectComponent: NgSelectComponent;
    private _searchTermNotExchangedMarketProcessedToggleButtonComponent: SvgButtonNgComponent;

    private _applyValueTransactionId = 0;
    private _nextSearchNumber = 1;
    private _debounceDelayingCount = 0;
    private _queryRunningCount = 0;
    private _selectedObservable = new MarketIvemIdSelectNgDirective.SelectedObservable<T>();

    private _measureCanvasContextsEventSubscriptionId: MultiEvent.SubscriptionId;
    private _measureCanvasContext: CanvasRenderingContext2D;
    private _measureBoldCanvasContext: CanvasRenderingContext2D;

    private _notFoundText = Strings[StringId.NoMatchingSymbolsOrNamesFound];

    constructor(
        typeInstanceCreateId: Integer,
        marketTypeId: Market.TypeId,
        private readonly _marketIvemIdConstructor: MarketIvemId.Constructor<T>,
        private readonly _resolveMarketsEventer: MarketIvemIdSelectNgDirective.ResolveMarketsEventer<T>,
    ) {
        super(
            typeInstanceCreateId,
            ControlComponentBaseNgDirective.textControlStateColorItemIdArray
        );

        const decimalFactoryNgService = inject(DecimalFactoryNgService);
        const commandRegisterNgService = inject(CommandRegisterNgService);
        const marketsNgService = inject(MarketsNgService);
        const adiNgService = inject(AdiNgService);
        const symbolsNgService = inject(SymbolsNgService);
        const symbolDetailCacheNgService = inject(SymbolDetailCacheNgService);

        this._decimalFactory = decimalFactoryNgService.service;
        this._adiService = adiNgService.service;
        this._symbolsService = symbolsNgService.service;
        this._symbolDetailCacheService = symbolDetailCacheNgService.service;

        const marketsService = marketsNgService.service;
        this._allMarkets = marketsService.getAllMarkets<T>(marketTypeId);
        this._defaultEnvironmentMarkets = marketsService.getDefaultExchangeEnvironmentMarkets<T>(marketTypeId);

        this.inputId.set('DataIvemIdInput' + this.typeInstanceId);
        this._searchTermNotExchangedMarketProcessedToggleUiAction =
            this.createSearchTermNotExchangedMarketProcessedToggleUiAction(commandRegisterNgService.service);

        this._measureCanvasContext = this._ngSelectOverlayNgService.measureCanvasContext;
        this._measureBoldCanvasContext = this._ngSelectOverlayNgService.measureBoldCanvasContext;
        this._measureCanvasContextsEventSubscriptionId = this._ngSelectOverlayNgService.subscribeMeasureCanvasContextsEvent(
            () => this.handleMeasureCanvasContextsEvent()
        );
    }

    override get uiAction() { return super.uiAction as MarketIvemIdUiAction<T>; }

    ngAfterViewInit() {
        this._ngSelectComponent = this._ngSelectComponentSignal();
        this._searchTermNotExchangedMarketProcessedToggleButtonComponent = this._searchTermNotExchangedMarketProcessedToggleButtonComponentSignal();
        this._searchTermNotExchangedMarketProcessedToggleButtonComponent.initialise(this._searchTermNotExchangedMarketProcessedToggleUiAction);
        this.startSearchProcessor();
        delay1Tick(() => this.setInitialiseReady());
    }

    public generateTitle(item: MarketIvemIdSelectNgDirective.Item<T>, nameIncluded: boolean) {
        const itemDetail = item.detail;
        if (itemDetail === undefined) {
            return `<${Strings[StringId.FetchingSymbolDetails]}>`;
        } else {
            if (itemDetail === null) {
                return `<${Strings[StringId.SymbolNotFound]}>`;
            } else {
                // let tradingMarketsText: string;
                // const tradingMarkets = itemDetails.tradingMarkets;
                // const count = tradingMarkets.length;
                // switch (count) {
                //     case 0: {
                //         tradingMarketsText = MarketIvemIdSelectNgDirective.noneTradingMarketsText;
                //         break;
                //     }
                //     case 1: {
                //         tradingMarketsText = tradingMarkets[0].display;
                //         break;
                //     }
                //     default: {
                //         const tradingMarketDisplays = new Array<string>(count);
                //         for (let i = 0; i < count; i++) {
                //             tradingMarketDisplays[i] = tradingMarkets[i].display;
                //         }
                //         tradingMarketsText = CommaText.fromStringArray(tradingMarketDisplays);
                //     }
                // }

                let result = `${Strings[StringId.Market]}: ${item.marketIvemId.market.display}\n` +
                    `${Strings[StringId.Exchange]}: ${item.marketIvemId.exchange.abbreviatedDisplay}`;

                if (nameIncluded) {
                    result = `${itemDetail.name}\n${result}`;
                }

                return result;
            }
        }
    }

    public handleSelectChangeEvent(event: unknown) {
        const changeEvent = event as MarketIvemIdSelectNgDirective.ChangeEvent<T>;
        if (changeEvent !== undefined && changeEvent !== null) {
            const parseDetails: SymbolsService.MarketIvemIdParseDetails<T> = {
                marketIvemId: changeEvent.marketIvemId,
                isZenith: false,
                exchangeValidAndExplicit: false,
                marketValidAndExplicit: false,
                errorText: undefined,
                value: '',
            };

            const detail = changeEvent.detail;
            if (detail !== undefined && detail !== null) {
                this._symbolDetailCacheService.setDataIvemId(detail);
            }
            this.commitValue(parseDetails, UiAction.CommitTypeId.Explicit);
        } else {
            // if (!this.uiAction.required) {
            //     this.commitValue(undefined, UiAction.CommitTypeId.Explicit);
            // }
        }
    }

    public handleSelectOpenEvent() {
        this._ngSelectOverlayNgService.notifyDropDownOpen();

        const list = this._ngSelectComponent.itemsList;
        const ngOptions = list.items;
        const count = ngOptions.length;
        const items = new Array<MarketIvemIdSelectNgDirective.Item<T>>(count);
        for (let i = 0; i < count; i++) {
            const ngOption = ngOptions[i];
            items[i] = ngOption.value as MarketIvemIdSelectNgDirective.Item<T>;
        }
        this.updateNgSelectWidthsFromItems(items, false);
    }

    public trackByFn(item: MarketIvemIdSelectNgDirective.Item<T>) {
        return item.marketIvemId.mapKey;
    }

    override focus() {
        this._ngSelectComponent.focus();
    }

    protected override pushSettings() {
        super.pushSettings();
        this.applyValueWithoutWait(this.uiAction.value, this.uiAction.edited, false);
    }

    protected override setUiAction(action: MarketIvemIdUiAction<T>) {
        const pushEventHandlersInterface = super.setUiAction(action) as MarketIvemIdUiAction.PushEventHandlersInterface<T>;

        pushEventHandlersInterface.value = (value, edited, selectAll) => this.handleValuePushEvent(value, edited, selectAll);

        this.applyValueWithoutWait(action.value, action.edited);

        return pushEventHandlersInterface;
    }

    protected override finalise() {
        this._searchTermNotExchangedMarketProcessedToggleUiAction.finalise();

        this._ngSelectOverlayNgService.unsubscribeMeasureCanvasContextsEvent(this._measureCanvasContextsEventSubscriptionId);
        super.finalise();
    }

    protected override setStateColors(stateId: UiAction.StateId) {
        super.setStateColors(stateId);

        NgSelectUtils.ApplyColors(this._ngSelectComponent.element, this.foreColor, this.bkgdColor);
    }

    protected getNotFoundText() {
        return this._notFoundText;
    }

    private handleMeasureCanvasContextsEvent() {
        this._measureCanvasContext = this._ngSelectOverlayNgService.measureCanvasContext;
        this._measureBoldCanvasContext = this._ngSelectOverlayNgService.measureBoldCanvasContext;
    }

    private calculateNgSelectWidths(items: MarketIvemIdSelectNgDirective.Item<T>[]) {
        let maxBoldIdWidth = 0;
        let maxNameWidth = 0;
        const count = items.length;
        for (let i = 0; i < count; i++) {
            const item = items[i];
            const id = item.idDisplay;
            const boldIdMetrics = this._measureBoldCanvasContext.measureText(id);
            if (boldIdMetrics.width > maxBoldIdWidth) {
                maxBoldIdWidth = boldIdMetrics.width;
            }
            const description = item.description;
            const descriptionMetrics = this._measureCanvasContext.measureText(description);
            if (descriptionMetrics.width > maxNameWidth) {
                maxNameWidth = descriptionMetrics.width;
            }
        }
        const spaceMetrics = this._measureCanvasContext.measureText(' ');
        const firstColumnRightPaddingWidth = Math.ceil(2 * spaceMetrics.width);
        const firstColumnWidth = firstColumnRightPaddingWidth + Math.ceil(maxBoldIdWidth);

        let dropDownPanelWidth = firstColumnWidth + Math.ceil(maxNameWidth) + 2 * NgSelectUtils.ngOptionLeftRightPadding;
        const componentWidth = this._ngSelectComponent.element.clientWidth;
        if (dropDownPanelWidth < componentWidth) {
            dropDownPanelWidth = componentWidth;
        }
        const ngSelectWidths: MarketIvemIdSelectNgDirective.NgSelectWidths = {
            firstColumn: firstColumnWidth,
            dropDownPanel: dropDownPanelWidth,
        };

        return ngSelectWidths;
    }

    private handleValuePushEvent(value: MarketIvemId<T> | undefined, edited: boolean, selectAll: boolean) {
        this.applyValueWithoutWait(value, edited, selectAll);
    }

    private handleSearchTermNotExchangedMarketProcessedToggleUiActionSignal() {
        const toggledValue = !this._searchTermNotExchangedMarketProcessedToggleUiAction.definedValue;
        this._searchTermNotExchangedMarketProcessedToggleUiAction.pushValue(toggledValue);
    }

    private startSearchProcessor() {
        const searchItemsObservable = this.typeahead.pipe<
            MarketIvemIdSelectNgDirective.ParsedSearchTerm<T>,
            MarketIvemIdSelectNgDirective.ParsedSearchTerm<T>,
            Observable<MarketIvemIdSelectNgDirective.Item<T>[]>,
            Observable<MarketIvemIdSelectNgDirective.Item<T>[]>
        >(
            map<string | null, MarketIvemIdSelectNgDirective.ParsedSearchTerm<T>>((term) => this.createParsedSearchTerm(term)),
            distinctUntilChanged<MarketIvemIdSelectNgDirective.ParsedSearchTerm<T>>(
                (prev, curr) => MarketIvemIdSelectNgDirective.ParsedSearchTerm.isEqual(prev, curr)
            ),
            // debounceTime(800),
            map<MarketIvemIdSelectNgDirective.ParsedSearchTerm<T>, Observable<MarketIvemIdSelectNgDirective.Item<T>[]>>(
                (parsedTerm) => new MarketIvemIdSelectNgDirective.ItemArrayObservable<T>(
                    this._decimalFactory,
                    this._adiService,
                    this._symbolsService,
                    this._symbolDetailCacheService,
                    parsedTerm,
                    800,
                    this._marketIvemIdConstructor,
                    this._resolveMarketsEventer,
                    (start) => this.handleQueryStartFinishEvent(start),
                    (start) => this.handleDebounceDelayStartFinishEvent(start)
                )
            ),
            tap<Observable<MarketIvemIdSelectNgDirective.Item<T>[]>>(() => { this._nextSearchNumber++; }) // this needs to be reviewed
        );

        this.items = merge<Observable<MarketIvemIdSelectNgDirective.Item<T>[]>[]>(searchItemsObservable, this._selectedObservable).pipe(
            switchAll(),
            tap<MarketIvemIdSelectNgDirective.Item<T>[]>((itemArray) => this.updateNgSelectWidthsFromItems(itemArray, true))
        );
    }

    private createSearchTermNotExchangedMarketProcessedToggleUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.DataIvemIdSelect_ToggleSearchTermNotExchangedMarketProcessed;
        const displayId = StringId.ToggleSearchTermNotExchangedMarketProcessedCaption;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ToggleSearchTermNotExchangedMarketProcessedTitle]);
        action.pushIcon(IconButtonUiAction.IconId.ToggleSearchTermNotExchangedMarketProcessed);
        action.pushUnselected();
        action.signalEvent = () => this.handleSearchTermNotExchangedMarketProcessedToggleUiActionSignal();
        return action;
    }

    private setNotFoundText(value: string) {
        this._notFoundText = value;
    }

    private checkSetNotFoundTextToSymbolSearchRequiresCodeWithAtLeast(searchable: boolean) {
        if (!searchable) {
            this.setNotFoundText(`${Strings[StringId.SearchRequiresAtLeast]} ` +
                `${this.minCodeLength} ${Strings[StringId.Characters]}`);
        }
    }

    private createParsedSearchTerm(term: string | null): MarketIvemIdSelectNgDirective.ParsedSearchTerm<T> {
        let result: MarketIvemIdSelectNgDirective.ParsedSearchTerm<T>;
        if (term === null) {
            result = {
                searchNumber: this._nextSearchNumber,
                searchable: false,
                term: '',
                marketIvemId: undefined,
                validExplicitExchange: undefined,
                validExplicityMarket: undefined,
                parseErrorText: undefined,
            };
            this.checkSetNotFoundTextToSymbolSearchRequiresCodeWithAtLeast(result.searchable);
        } else {
            if (term === '') {
                result = {
                    searchNumber: this._nextSearchNumber,
                    searchable: true,
                    term: '',
                    marketIvemId: undefined,
                    validExplicitExchange: undefined,
                    validExplicityMarket: undefined,
                    parseErrorText: undefined,
                };
            } else {
                if (this._searchTermNotExchangedMarketProcessedToggleUiAction.value) {
                    result = {
                        searchNumber: this._nextSearchNumber,
                        searchable: term.length >= this.minCodeLength,
                        term,
                        marketIvemId: undefined,
                        validExplicitExchange: undefined,
                        validExplicityMarket: undefined,
                        parseErrorText: undefined,
                    };
                    this.checkSetNotFoundTextToSymbolSearchRequiresCodeWithAtLeast(result.searchable);
                } else {
                    const parseDetails = this._symbolsService.parseMarketIvemId(this._allMarkets, this._defaultEnvironmentMarkets, this._marketIvemIdConstructor, term);
                    const parseErrorText = parseDetails.errorText;
                    const code = parseDetails.marketIvemId.code;
                    const marketIvemId = parseDetails.marketIvemId;
                    const exchangeValidAndExplicit = parseDetails.exchangeValidAndExplicit;
                    const marketValidAndExplicit = parseDetails.marketValidAndExplicit;
                    result = {
                        searchNumber: this._nextSearchNumber,
                        searchable: code.length >= this.minCodeLength,
                        term,
                        marketIvemId: parseDetails.marketIvemId,
                        validExplicitExchange: exchangeValidAndExplicit ? marketIvemId.exchange : undefined,
                        validExplicityMarket: marketValidAndExplicit ? marketIvemId.market : undefined,
                        parseErrorText,
                    };

                    if (parseErrorText !== undefined) {
                        // this.setNotFoundText(Strings[StringId.InvalidSymbol]);
                        this.setNotFoundText(parseErrorText);
                    } else {
                        this.checkSetNotFoundTextToSymbolSearchRequiresCodeWithAtLeast(result.searchable);
                    }
                }
            }
        }

        return result;
    }

    private updateNgSelectWidthsFromItems(items: MarketIvemIdSelectNgDirective.Item<T>[], widenOnly: boolean) {
        const widths = this.calculateNgSelectWidths(items);

        this._ngSelectOverlayNgService.setDropDownPanelClientWidth(widths.dropDownPanel, widenOnly);
        this._ngSelectOverlayNgService.setFirstColumnWidth(widths.firstColumn, widenOnly);
    }

    private applyValueWithoutWait(value: MarketIvemId<T> | undefined, edited: boolean, selectAll = true) {
        const applyPromise = this.applyValue(value, edited, selectAll);
        AssertInternalError.throwErrorIfPromiseRejected(applyPromise, 'RIISNCIAOSF34344');
    }

    private async applyValue(value: MarketIvemId<T> | undefined, edited: boolean, selectAll: boolean) {
        if (!edited) {
            const applyValueTransactionId = ++this._applyValueTransactionId;
            let selected: MarketIvemIdSelectNgDirective.Item<T> | null;
            if (value === undefined) {
                selected = null;
            } else {
                const bestDataIvemId = this._symbolsService.tryGetBestDataIvemIdFromMarketIvemId(value);
                if (bestDataIvemId === undefined) {
                    selected = null;
                } else {
                    const cachedDetail = await this._symbolDetailCacheService.getDataIvemId(bestDataIvemId);
                    if (cachedDetail === undefined) {
                        selected = null;
                    } else {
                        selected = MarketIvemIdSelectNgDirective.createItemFromCachedDetail(
                            this._symbolsService,
                            value,
                            cachedDetail,
                            undefined,
                            undefined,
                            this._marketIvemIdConstructor,
                            this._resolveMarketsEventer,
                        );
                    }
                }
            }

            if (applyValueTransactionId === this._applyValueTransactionId) {
                if (selected !== this.selected) {
                    this._ngSelectComponent.searchTerm = '';
                    this._selectedObservable.setSelected(selected);
                    this.selected = selected;
                    this.markForCheck();
                }

                if (selectAll) {
                    //                delay1Tick(() => this.selectAllText() );
                }
            }
        }
    }

    private commitValue(parseDetails: SymbolsService.MarketIvemIdParseDetails<T>, typeId: UiAction.CommitTypeId) {
        this.uiAction.commitValue(parseDetails, typeId);
    }

    // private selectAllText() {
    //     (this.symbolInput.nativeElement as HTMLInputElement).select();
    // }

    private handleDebounceDelayStartFinishEvent(start: boolean) {
        // give priority to queryRunning
        if (start) {
            if (this._debounceDelayingCount++ === 0) {
                if (this._queryRunningCount === 0) {
                    this._notFoundText = Strings[StringId.TypingPauseWaiting];
                }
            }
        } else {
            if (--this._debounceDelayingCount === 0) {
                if (this._queryRunningCount === 0) {
                    this._notFoundText = Strings[StringId.NoMatchingSymbolsOrNamesFound];
                }
            }
        }
    }

    private handleQueryStartFinishEvent(start: boolean) {
        if (start) {
            if (this._queryRunningCount++ === 0) {
                this.loading = true;
                this._notFoundText = Strings[StringId.NoMatchingSymbolsOrNamesFound];
            }
        } else {
            if (--this._queryRunningCount === 0) {
                this.loading = false;
                if (this._debounceDelayingCount > 0) {
                    this._notFoundText = Strings[StringId.TypingPauseWaiting];
                }
            }
        }
    }
}

export namespace MarketIvemIdSelectNgDirective {
    export const emptySymbol = '';
    export const noneTradingMarketsText = `<${Strings[StringId.None]}>`;

    export interface Item<T extends Market> {
        readonly detail: SearchSymbolsDataIvemBaseDetail | null | undefined; // null means symbol not found, undefined means fetching
        readonly marketIvemId: MarketIvemId<T>;
        readonly idDisplay: string;
        readonly description: string;
        readonly disabled: boolean;
    }

    export interface ParsedSearchTerm<T extends Market> {
        readonly searchNumber: Integer;
        readonly searchable: boolean;
        readonly term: string;
        readonly marketIvemId: MarketIvemId<T> | undefined;
        readonly validExplicitExchange: Exchange | undefined;
        readonly validExplicityMarket: T | undefined;
        readonly parseErrorText: string | undefined;
    }

    export namespace ParsedSearchTerm {
        export function isEqual<T extends Market>(left: ParsedSearchTerm<T>, right: ParsedSearchTerm<T>) {
            return left.searchNumber === right.searchNumber &&
                left.term === right.term // &&
                // left.marketIvemId.exchange === right.exchange &&
                // left.market === right.market;
        }
    }

    export type ChangeEvent<T extends Market> = Item<T> | undefined | null;

    export interface TryCreateMarketIvemIdResult<T extends Market> {
        readonly marketIvemId: MarketIvemId<T>;
        readonly bestDataIvemId: DataIvemId | undefined;
    }
    export type TryCreateMarketIvemIdEventer<T extends Market> = (
        this: void,
        code: string,
        exchange: Exchange | undefined,
        market: T | undefined,
    ) => TryCreateMarketIvemIdResult<T> | undefined;

    export type ResolveMarketsEventer<T extends Market> = (this: void, dataMarket: DataMarket, tradingMarkets: readonly TradingMarket[]) => readonly T[];

    export interface NgSelectWidths {
        dropDownPanel: number;
        firstColumn: number;
    }

    export function createItemFromCachedDetail<T extends Market>(
        symbolsService: SymbolsService,
        marketIvemId: MarketIvemId<T>,
        cacheDetail: SymbolDetailCacheService.DataIvemIdDetail | undefined,
        requiredMarket: T | undefined,
        requiredExchange: Exchange | undefined,
        marketIvemIdConstructor: MarketIvemId.Constructor<T>,
        resolveMarketsEventer: ResolveMarketsEventer<T>,
    ): Item<T> {
        if (cacheDetail === undefined) {
            return {
                detail: undefined,
                marketIvemId,
                idDisplay: symbolsService.marketIvemIdToDisplay(marketIvemId),
                description: Strings[StringId.FetchingSymbolDetails],
                disabled: false,
            };
        } else {
            if (!cacheDetail.exists) {
                return {
                    detail: null,
                    marketIvemId,
                    idDisplay: symbolsService.marketIvemIdToDisplay(marketIvemId),
                    description: Strings[StringId.SymbolNotFound],
                    disabled: false, // should be true
                };
            } else {
                const dataIvemId = cacheDetail.dataIvemId;
                const resolvedMarkets = resolveMarketsEventer(dataIvemId.market, cacheDetail.tradingMarkets);
                const code = dataIvemId.code;
                switch (resolvedMarkets.length) {
                    case 0: {
                        // Can happen if CacheDetail has no trading markets
                        return {
                            detail: null,
                            marketIvemId,
                            idDisplay: symbolsService.marketIvemIdToDisplay(marketIvemId),
                            description: Strings[StringId.SymbolSelect_NoMarkets],
                            disabled: true,
                        };
                    }
                    case 1: {
                        const resolvedMarket = resolvedMarkets[0];
                        if (requiredMarket !== undefined && resolvedMarket !== requiredMarket) {
                            // Can happen if CacheDetail market does not match market being searched for
                            return {
                                detail: null,
                                marketIvemId,
                                idDisplay: symbolsService.marketIvemIdToDisplay(marketIvemId),
                                description: Strings[StringId.SymbolSelect_NotFoundInMarket],
                                disabled: true,
                            };
                        } else {
                            const resolvedMarketIvemId = new marketIvemIdConstructor(code, resolvedMarket);
                            return MarketIvemIdSelectNgDirective.createSelectableItemFromCachedDetail(symbolsService, resolvedMarketIvemId, cacheDetail, undefined);
                        }
                    }
                    default: {
                        // need to pick best market
                        const exchangeDefaultMarket = (requiredExchange === undefined) ? undefined : requiredExchange.getDefaultMarket<T>(marketIvemId.market.typeId);
                        const resolvedMarketCount = resolvedMarkets.length;
                        let requiredResolvedMarket: T | undefined;
                        let exchangeDefaultResolvedMarket: T | undefined;
                        for (let i = 0; i < resolvedMarketCount; i++) {
                            const resolvedMarket = resolvedMarkets[i];
                            if (requiredMarket !== undefined && resolvedMarket === requiredMarket) {
                                // This is the one we are looking for
                                requiredResolvedMarket = resolvedMarket;
                                break;
                            } else {
                                if (exchangeDefaultMarket !== undefined && resolvedMarket === exchangeDefaultResolvedMarket) {
                                    exchangeDefaultResolvedMarket = resolvedMarket;
                                    // keep searching in case we find best
                                }
                            }
                        }

                        let bestResolvedMarket: T;
                        if (requiredResolvedMarket !== undefined) {
                            bestResolvedMarket = requiredResolvedMarket;
                        } else {
                            if (exchangeDefaultResolvedMarket !== undefined) {
                                bestResolvedMarket = exchangeDefaultResolvedMarket;
                            } else {
                                bestResolvedMarket = resolvedMarkets[0]; // just pick first
                            }
                        }
                        const resolvedMarketIvemId = new marketIvemIdConstructor(code, bestResolvedMarket);
                        return MarketIvemIdSelectNgDirective.createSelectableItemFromCachedDetail(symbolsService, resolvedMarketIvemId, cacheDetail, undefined);
                    }
                }
            }
        }

    }


    export function createSelectableItemFromCachedDetail<T extends Market>(
        symbolsService: SymbolsService,
        marketIvemId: MarketIvemId<T>,
        cachedDetail: SymbolDetailCacheService.DataIvemIdDetail | null | undefined,
        symbolDetail: SearchSymbolsDataIvemBaseDetail | undefined,
    ): Item<T> {
        let name: string;
        if (cachedDetail === null) {
            name = `<${Strings[StringId.SymbolNotFound]}>`;
            cachedDetail = undefined;
        } else {
            if (cachedDetail === undefined) {
                name = `<${Strings[StringId.FetchingSymbolDetails]}>`;
            } else {
                name = symbolsService.calculateSymbolName(
                    cachedDetail.exchange,
                    cachedDetail.name,
                    cachedDetail.dataIvemId.code,
                    cachedDetail.alternateCodes,
                );
            }
        }

        return createItem(symbolsService, marketIvemId, name, symbolDetail);
    }

    export function createItem<T extends Market>(
        symbolsService: SymbolsService,
        marketIvemId: MarketIvemId<T>,
        description: string,
        detail: SearchSymbolsDataIvemBaseDetail | undefined,
    ) {
        const item: Item<T> = {
            detail,
            marketIvemId,
            idDisplay: symbolsService.marketIvemIdToDisplay(marketIvemId),
            description,
            disabled: false,
        };

        return item;
    }

    export class ItemArrayObservable<T extends Market> extends Observable<Item<T>[]> {
        private _dataItem: SymbolsDataItem | undefined;
        private _dataItemCorrectnessChangeSubcriptionId: MultiEvent.SubscriptionId;
        private _observer: Observer<Item<T>[]>;
        private _termDataIvemIdFetching = false;
        private _searchDelaySetTimeoutHandle: ReturnType<typeof setTimeout> | undefined;
        private _termItem: Item<T> | undefined;
        private _searchItems: Item<T>[] | undefined;

        constructor(
            private readonly _decimalFactory: DecimalFactory,
            private readonly _adiService: AdiService,
            private readonly _symbolsService: SymbolsService,
            private readonly _symbolDetailCacheService: SymbolDetailCacheService,
            private readonly _parsedSearchTerm: ParsedSearchTerm<T>,
            private readonly _searchDelay: Integer,
            private readonly _marketIvemIdConstructor: MarketIvemId.Constructor<T>,
            private readonly _resolveMarketsEventer: ResolveMarketsEventer<T>,
            private readonly _queryStartFinishEventer: (this: void, start: boolean) => void,
            private readonly _debounceDelayStartFinishEventer: (this: void, start: boolean) => void
        ) {
            super((observer) => this.subscribeFtn(observer));
        }

        private dispose() {
            this.checkUnsubscribeDataItem();
            if (this._termDataIvemIdFetching) {
                this._termDataIvemIdFetching = false;
            }
            if (this._searchDelaySetTimeoutHandle !== undefined) {
                clearTimeout(this._searchDelaySetTimeoutHandle);
                this._searchDelaySetTimeoutHandle = undefined;
                this._debounceDelayStartFinishEventer(false);
            }
        }

        private subscribeFtn(observer: Observer<Item<T>[]>) {
            this._observer = observer;

            const marketIvemId = this._parsedSearchTerm.marketIvemId;
            const term = this._parsedSearchTerm.term;

            // const tryCreateMarketIvemIdResult = this._tryCreateMarketIvemIdEventer(codeOrName, requiredExchange, requiredMarket);
            if (marketIvemId === undefined || term === '') {
                this.emitItems();
            } else {
                const parseErrorText = this._parsedSearchTerm.parseErrorText;
                if (parseErrorText !== undefined) {
                    this._termItem = {
                        detail: null,
                        marketIvemId,
                        idDisplay: this._parsedSearchTerm.term,
                        description: parseErrorText,
                        disabled: true,
                    };
                    this.emitItems();
                } else {
                    const bestDataIvemId = this._symbolsService.tryGetBestDataIvemIdFromMarketIvemId(marketIvemId);
                    if (bestDataIvemId === undefined) {
                        this._termItem = {
                            detail: null,
                            marketIvemId,
                            idDisplay: this._symbolsService.marketIvemIdToDisplay(marketIvemId),
                            description: Strings[StringId.SymbolSelect_NoDataSymbolAvailable],
                            disabled: true,
                        };
                        this.emitItems();
                    } else {
                        const requiredExchange = this._parsedSearchTerm.validExplicitExchange;
                        const requiredMarket = this._parsedSearchTerm.validExplicityMarket;
                        const cachedDetail = this._symbolDetailCacheService.getDataIvemIdFromCache(bestDataIvemId);
                        this._termItem = MarketIvemIdSelectNgDirective.createItemFromCachedDetail(
                            this._symbolsService,
                            marketIvemId,
                            cachedDetail,
                            requiredMarket,
                            requiredExchange,
                            this._marketIvemIdConstructor,
                            this._resolveMarketsEventer,
                        );

                        const fetchTermRequired = this._termItem.detail === undefined;

                        this.emitItems();

                        if (fetchTermRequired) {
                            const fetchTermDetailAndEmitPromise = this.fetchTermDetailAndEmit(marketIvemId, bestDataIvemId, requiredMarket, requiredExchange);
                            fetchTermDetailAndEmitPromise.then(
                                () => {/**/},
                                (error: unknown) => { throw AssertInternalError.createIfNotError(error, 'LIISNCIAOSF34344'); }
                            )
                        }
                    }
                }
            }

            if (this._parsedSearchTerm.searchable) {
                this._debounceDelayStartFinishEventer(true);
                this._searchDelaySetTimeoutHandle = setTimeout(() => this.initiateSearch(), this._searchDelay);
            } else {
                if (!this._termDataIvemIdFetching) {
                    this.complete();
                }
            }

            const result: Unsubscribable = {
                unsubscribe: () => this.dispose()
            };
            return result;
        }

        private complete() {
            this.dispose(); // probably not necessary as observer will teardown as well
            this._observer.complete();
        }

        private async fetchTermDetailAndEmit(marketIvemId: MarketIvemId<T>, dataIvemId: DataIvemId, requiredMarket: T | undefined, requiredExchange: Exchange | undefined) {
            this._termDataIvemIdFetching = true;
            const cachedDetail = await this._symbolDetailCacheService.getDataIvemId(dataIvemId);
            this._termDataIvemIdFetching = false;
            if (cachedDetail !== undefined) {
                this._termItem = MarketIvemIdSelectNgDirective.createItemFromCachedDetail(
                    this._symbolsService,
                    marketIvemId,
                    cachedDetail,
                    requiredMarket,
                    requiredExchange,
                    this._marketIvemIdConstructor,
                    this._resolveMarketsEventer,
                );

                this.emitItems();
            }

            if (this._searchDelaySetTimeoutHandle === undefined) {
                this.complete();
            }
        }

        private initiateSearch() {
            this._searchDelaySetTimeoutHandle = undefined;
            this._debounceDelayStartFinishEventer(false);
            this._queryStartFinishEventer(true);

            const exchange = this._parsedSearchTerm.validExplicitExchange;
            const fieldIds = this._symbolsService.calculateSymbolSearchFieldIds(exchange);

            const condition: SearchSymbolsDataDefinition.Condition = {
                text: this._parsedSearchTerm.term,
                fieldIds,
                isCaseSensitive: false,
            };

            const market = this._parsedSearchTerm.validExplicityMarket;
            const definition = new SearchSymbolsDataDefinition(this._decimalFactory);
            definition.conditions = [condition];
            definition.exchangeZenithCode = exchange === undefined ? undefined : exchange.zenithCode;
            definition.marketZenithCodes = market === undefined ? undefined : [market.zenithCode];
            definition.fullSymbol = true; // AlternateCodesFix: should be false
            definition.count = 100;
            this._dataItem = this._adiService.subscribe(definition) as SymbolsDataItem;
            if (this._dataItem.incubated) {
                this.processDataItemIncubated(this._dataItem);
            } else {
                this._dataItemCorrectnessChangeSubcriptionId = this._dataItem.subscribeCorrectnessChangedEvent(
                    () => this.handleDataItemCorrectnessChange()
                );
            }
        }

        private handleDataItemCorrectnessChange() {
            if (this._dataItem === undefined) {
                throw new AssertInternalError('LIISCIAOHDICC19966434');
            } else {
                if (this._dataItem.incubated) {
                    this.processDataItemIncubated(this._dataItem);
                }
            }
        }

        private checkUnsubscribeDataItem() {
            if (this._dataItem !== undefined) {
                this._dataItem.unsubscribeCorrectnessChangedEvent(this._dataItemCorrectnessChangeSubcriptionId);
                this._dataItemCorrectnessChangeSubcriptionId = undefined;
                this._adiService.unsubscribe(this._dataItem);
                this._dataItem = undefined;
                this._queryStartFinishEventer(false);
            }
        }

        private processDataItemIncubated(dataItem: SymbolsDataItem) {
            if (dataItem.usable) {
                const records = dataItem.records;
                const recordCount = records.length;
                const items = new Array<Item<T>>(recordCount * 2);
                let itemCount = 0;
                for (let i = 0; i < recordCount; i++) {
                    const record = records[i];
                    const exchange = record.exchange;
                    const code = record.dataIvemId.code;
                    const name = this._symbolsService.calculateSymbolName(
                        exchange,
                        record.name,
                        code,
                        record.alternateCodes,
                    );

                    const resolvedMarkets = this._resolveMarketsEventer(record.market, record.tradingMarkets);

                    const requiredMarket = this._parsedSearchTerm.validExplicityMarket;
                    const resolvedMarketCount = resolvedMarkets.length;

                    for (let r = 0; r < resolvedMarketCount; r++) {
                        const resolvedMarket = resolvedMarkets[r];
                        if (requiredMarket === undefined || requiredMarket === resolvedMarket) {
                            const marketIvemId = new this._marketIvemIdConstructor(code, resolvedMarket);
                            const item = MarketIvemIdSelectNgDirective.createItem(this._symbolsService, marketIvemId, name, record);
                            if (itemCount === items.length) {
                                items.length *= 2;
                            }
                            items[itemCount++] = item;
                        }
                    }
                }
                items.length = itemCount;

                const priorityExchange = this._parsedSearchTerm.validExplicitExchange ?? this._symbolsService.defaultExchange;

                items.sort((left, right) => {
                    const leftDataIvemId = left.marketIvemId;
                    const leftIvemId = leftDataIvemId.ivemId;
                    const rightDataIvemId = right.marketIvemId;
                    const rightIvemId = rightDataIvemId.ivemId;
                    let result = Exchange.compareByDisplayPriorityAndHighest(leftIvemId.exchange, rightIvemId.exchange, priorityExchange);
                    if (result === ComparisonResult.LeftEqualsRight) {
                        result = compareString(leftIvemId.code, rightIvemId.code);
                        if (result === ComparisonResult.LeftEqualsRight) {
                            result = Market.compareByDisplayPriority(leftDataIvemId.market, rightDataIvemId.market);
                        }
                    }
                    return result;
                });

                this._searchItems = items;
                this.emitItems();
            }

            this.checkUnsubscribeDataItem();

            if (!this._termDataIvemIdFetching) {
                this.complete();
            }
        }

        private emitItems() {
            const termItem = this._termItem;
            const searchItems = this._searchItems;
            if (termItem === undefined) {
                if (searchItems !== undefined) {
                    this._observer.next(searchItems);
                } else {
                    this._observer.next([]);
                }
            } else {
                if (searchItems === undefined) {
                    this._observer.next([termItem]);
                } else {
                    const searchItemCount = searchItems.length;
                    if (searchItemCount === 0) {
                        this._observer.next([termItem]);
                    } else {
                        const termMarketIvemId = termItem.marketIvemId;
                        if (MarketIvemId.isUndefinableEqual(termMarketIvemId, searchItems[0].marketIvemId)) {
                            this._observer.next(searchItems);
                        } else {
                            const combinedItems = new Array<Item<T>>(searchItemCount + 1);
                            combinedItems[0] = termItem;
                            combinedItems[1] = searchItems[0];
                            let count = 2;
                            for (let i = 1; i < searchItemCount; i++) {
                                const searchItem = searchItems[i];
                                if (!MarketIvemId.isUndefinableEqual(termMarketIvemId, searchItem.marketIvemId)) {
                                    combinedItems[count++] = searchItem;
                                }
                            }
                            combinedItems.length = count;
                            this._observer.next(combinedItems);
                        }
                    }
                }
            }
        }

        // private createItemFromCachedDetail(
        //     cacheDetail: SymbolDetailCacheService.DataIvemIdDetail | undefined,
        //     marketIvemId: MarketIvemId<T>,
        //     requiredMarket: T | undefined,
        //     requiredExchange: Exchange | undefined,
        // ): Item<T> {
        //     if (cacheDetail === undefined) {
        //         return {
        //             nameAndDetail: undefined,
        //             marketIvemId,
        //             idDisplay: marketIvemId.code,
        //         };
        //     } else {
        //         if (!cacheDetail.exists) {
        //             return {
        //                 nameAndDetail: null,
        //                 marketIvemId,
        //                 idDisplay: marketIvemId.code,
        //             };
        //         } else {
        //             const dataIvemId = cacheDetail.dataIvemId;
        //             const resolvedMarkets = this._resolveMarketsEventer(dataIvemId.market, cacheDetail.tradingMarkets);
        //             const code = dataIvemId.code;
        //             switch (resolvedMarkets.length) {
        //                 case 0: {
        //                     // Can happen if CacheDetail has no trading markets
        //                     return {
        //                         nameAndDetail: null,
        //                         marketIvemId,
        //                         idDisplay: this._symbolsService.marketIvemIdToDisplay(marketIvemId),
        //                     };
        //                 }
        //                 case 1: {
        //                     const resolvedMarket = resolvedMarkets[0];
        //                     if (requiredMarket !== undefined && resolvedMarket !== requiredMarket) {
        //                         // Can happen if CacheDetail market does not match market being searched for
        //                         return {
        //                             nameAndDetail: null,
        //                             marketIvemId,
        //                             idDisplay: this._symbolsService.marketIvemIdToDisplay(marketIvemId),
        //                         };
        //                     } else {
        //                         const resolvedMarketIvemId = new this._marketIvemIdConstructor(code, resolvedMarket);
        //                         return MarketIvemIdSelectNgDirective.createSelectableItemFromCachedDetail(this._symbolsService, resolvedMarketIvemId, cacheDetail, undefined);
        //                     }
        //                 }
        //                 default: {
        //                     // need to pick best market
        //                     const exchangeDefaultMarket = (requiredExchange === undefined) ? undefined : requiredExchange.getDefaultMarket(this._marketTypeId) as T;
        //                     const resolvedMarketCount = resolvedMarkets.length;
        //                     let requiredResolvedMarket: T | undefined;
        //                     let exchangeDefaultResolvedMarket: T | undefined;
        //                     for (let i = 0; i < resolvedMarketCount; i++) {
        //                         const resolvedMarket = resolvedMarkets[i];
        //                         if (requiredMarket !== undefined && resolvedMarket === requiredMarket) {
        //                             // This is the one we are looking for
        //                             requiredResolvedMarket = resolvedMarket;
        //                             break;
        //                         } else {
        //                             if (exchangeDefaultMarket !== undefined && resolvedMarket === exchangeDefaultResolvedMarket) {
        //                                 exchangeDefaultResolvedMarket = resolvedMarket;
        //                                 // keep searching in case we find best
        //                             }
        //                         }
        //                     }

        //                     let bestResolvedMarket: T;
        //                     if (requiredResolvedMarket !== undefined) {
        //                         bestResolvedMarket = requiredResolvedMarket;
        //                     } else {
        //                         if (exchangeDefaultResolvedMarket !== undefined) {
        //                             bestResolvedMarket = exchangeDefaultResolvedMarket;
        //                         } else {
        //                             bestResolvedMarket = resolvedMarkets[0]; // just pick first
        //                         }
        //                     }
        //                     const resolvedMarketIvemId = new this._marketIvemIdConstructor(code, bestResolvedMarket);
        //                     return MarketIvemIdSelectNgDirective.createSelectableItemFromCachedDetail(this._symbolsService, resolvedMarketIvemId, cacheDetail, undefined);
        //                 }
        //             }
        //         }
        //     }

        // }
    }

    export class SelectedObservable<T extends Market> extends Observable<Observable<Item<T>[]>> {
        private _observer: Observer<Observable<Item<T>[]>> | undefined;
        private _selected: Item<T> | null;

        constructor() {
            super((observer) => this.subscribeFtn(observer));
        }

        setSelected(value: Item<T> | null) {
            this._selected = value;
            if (this._observer !== undefined) {
                if (this._selected !== null) {
                    this._observer.next(of([this._selected]));
                } else {
                    this._observer.next(of([]));
                }
            }
        }

        private dispose() {
            // nothing to dispose
        }

        private subscribeFtn(observer: Observer<Observable<Item<T>[]>>) {
            this._observer = observer;
            const result: Unsubscribable = {
                unsubscribe: () => this.dispose()
            };
            return result;
        }
    }
}
