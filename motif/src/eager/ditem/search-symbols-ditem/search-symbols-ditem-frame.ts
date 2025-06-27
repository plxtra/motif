import {
    AssertInternalError,
    DecimalFactory,
    EnumInfoOutOfOrderError,
    Integer,
    JsonElement,
    UnreachableCaseError
} from '@pbkware/js-utils';
import {
    AdiService,
    CommandRegisterService,
    DataIvemBaseDetail,
    DataMarket,
    Exchange,
    IvemClassId,
    MarketsService,
    SearchSymbolsDataDefinition,
    SettingsService,
    StringId,
    Strings,
    SymbolField,
    SymbolFieldId,
    SymbolsService,
} from '@plxtra/motif-core';
import { SearchSymbolsFrame } from 'content-internal-api';
import { Decimal } from 'decimal.js-light';
import { RevColumnLayoutOrReferenceDefinition } from 'revgrid';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class SearchSymbolsDitemFrame extends BuiltinDitemFrame {
    private _searchParams: SearchSymbolsDitemFrame.SearchParams;
    private _searchSymbolsFrame: SearchSymbolsFrame | undefined;

    private _symbolApplying: boolean;

    constructor(
        private readonly _componentAccess: SearchSymbolsDitemFrame.ComponentAccess,
        private readonly _decimalFactory: DecimalFactory,
        settingsService: SettingsService,
        marketsService: MarketsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Symbols, _componentAccess,
            settingsService, marketsService, commandRegisterService, desktopAccessService, symbolsService, adiService
        );

        this._searchParams = new SearchSymbolsDitemFrame.SearchParams(this._decimalFactory, this._marketsService, this.symbolsService, undefined);
    }

    get initialised() { return this._searchSymbolsFrame !== undefined; }

    get searchText() { return this._searchParams.searchText; }
    set searchText(value: string) { this._searchParams.searchText = value; }
    get showFull() { return this._searchParams.fullSymbol; }
    set showFull(value: boolean) { this._searchParams.fullSymbol = value; }
    get exchange() { return this._searchParams.exchange; }
    set exchange(value: Exchange | undefined) {
        this._searchParams.exchange = value;
        if (value !== undefined) {
            const oldMarkets = this._searchParams.markets;
            if (oldMarkets !== undefined) {
                let oldMarketsIncludeNewExchange = false;
                for (const oldMarket of oldMarkets) {
                    const oldMarketExchange = oldMarket.exchange;
                    if (oldMarketExchange === value) {
                        oldMarketsIncludeNewExchange = true;
                        break;
                    }
                }

                if (!oldMarketsIncludeNewExchange) {
                    this._searchParams.markets = undefined;
                }
            }
        }
    }
    get markets(): readonly DataMarket[] | undefined { return this._searchParams.markets; }
    set markets(value: readonly DataMarket[] | undefined) {
        this._searchParams.markets = value?.slice();
        const currentExchange = this._searchParams.exchange;
        if (currentExchange !== undefined) {
            if (value === undefined || value.length === 0) {
                this._searchParams.exchange = undefined;
            } else {
                let currentExchangeMatched = false;
                for (const market of value) {
                    if (market.exchange === currentExchange) {
                        currentExchangeMatched = true;
                    }
                }
                if (!currentExchangeMatched) {
                    this._searchParams.exchange = undefined;
                }
            }
        }
    }
    get cfi() { return this._searchParams.cfi; }
    set cfi(value: string | undefined) { this._searchParams.cfi = value; }
    get fieldIds() { return this._searchParams.fieldIds; }
    set fieldIds(value: readonly SymbolFieldId[] | undefined) { this._searchParams.fieldIds = value?.slice(); }
    get indicesInclusion() {
        const index = this._searchParams.index;
        if (index === undefined) {
            return SearchSymbolsDitemFrame.IndicesInclusionId.Include;
        } else {
            if (index) {
                return SearchSymbolsDitemFrame.IndicesInclusionId.Only;
            } else {
                return SearchSymbolsDitemFrame.IndicesInclusionId.Exclude;
            }
        }
    }
    set indicesInclusion(value: SearchSymbolsDitemFrame.IndicesInclusionId) {
        switch (value) {
            case SearchSymbolsDitemFrame.IndicesInclusionId.Exclude:
                this._searchParams.index = false;
                break;
            case SearchSymbolsDitemFrame.IndicesInclusionId.Include:
                this._searchParams.index = undefined;
                break;
            case SearchSymbolsDitemFrame.IndicesInclusionId.Only:
                this._searchParams.index = true;
                break;
            default:
                throw new UnreachableCaseError('SSDFII10091', value);
        }
    }
    get isPartial() { return this._searchParams.isPartial; }
    set isPartial(value: boolean | undefined) { this._searchParams.isPartial = value; }
    get isCaseSensitive() { return this._searchParams.isCaseSensitive; }
    set isCaseSensitive(value: boolean | undefined) { this._searchParams.isCaseSensitive = value; }
    get preferExact() { return this._searchParams.preferExact; }
    set preferExact(value: boolean | undefined) { this._searchParams.preferExact = value; }
    get startIndex() { return this._searchParams.startIndex; }
    set startIndex(value: Integer | undefined) { this._searchParams.startIndex = value; }
    get count() { return this._searchParams.count; }
    set count(value: Integer | undefined) { this._searchParams.count = value; }

    initialise(ditemFrameElement: JsonElement | undefined, searchSymbolsFrame: SearchSymbolsFrame): void {
        this._searchSymbolsFrame = searchSymbolsFrame;

        searchSymbolsFrame.gridSourceOpenedEventer = (dataDefinition) => this.handleGridSourceOpenedEvent(dataDefinition);
        searchSymbolsFrame.recordFocusedEventer = (newRecordIndex) => this.handleRecordFocusedEvent(newRecordIndex);

        let layoutDefinition: RevColumnLayoutOrReferenceDefinition | undefined;
        if (ditemFrameElement !== undefined) {
            const searchSymbolsFrameElementResult = ditemFrameElement.tryGetElement(SearchSymbolsDitemFrame.JsonName.searchSymbolsFrame);
            if (searchSymbolsFrameElementResult.isOk()) {
                const searchSymbolsFrameElement = searchSymbolsFrameElementResult.value;
                const layoutDefinitionResult = searchSymbolsFrame.tryCreateLayoutDefinitionFromJson(searchSymbolsFrameElement);
                if (layoutDefinitionResult.isErr()) {
                    // toast in future
                } else {
                    layoutDefinition = layoutDefinitionResult.value;
                }
            }
        }

        searchSymbolsFrame.initialise(this.opener, layoutDefinition, false);
    }

    override finalise(): void {
        super.finalise();
    }

    override save(ditemFrameElement: JsonElement) {
        super.save(ditemFrameElement);

        const searchSymbolsFrame = this._searchSymbolsFrame;

        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        if (searchSymbolsFrame !== undefined && searchSymbolsFrame.opened) {
            const searchSymbolsFrameElement = ditemFrameElement.newElement(SearchSymbolsDitemFrame.JsonName.searchSymbolsFrame);
            searchSymbolsFrame.saveLayout(searchSymbolsFrameElement);
        }
    }

    executeRequest() {
        const searchSymbolsFrame = this._searchSymbolsFrame;
        if (searchSymbolsFrame === undefined) {
            throw new AssertInternalError('SSDFER13133');
        } else {
            const dataDefinition = this._searchParams.createDataDefinition();
            searchSymbolsFrame.executeRequest(dataDefinition);
        }
    }

    tryOpenColumnLayoutOrReferenceDefinition(columnLayoutOrReferenceDefinition: RevColumnLayoutOrReferenceDefinition) {
        const gridSourceFrame = this._searchSymbolsFrame;
        if (gridSourceFrame === undefined) {
            throw new AssertInternalError('SSDFOGLONRD13133');
        } else {
            return gridSourceFrame.tryOpenColumnLayoutOrReferenceDefinition(columnLayoutOrReferenceDefinition);
        }
    }

    createAllowedFieldsAndLayoutDefinition() {
        const gridSourceFrame = this._searchSymbolsFrame;
        if (gridSourceFrame === undefined) {
            throw new AssertInternalError('SSDFCAFALD13133');
        } else {
            return gridSourceFrame.createAllowedSourcedFieldsColumnLayoutDefinition();
        }
    }

    private handleGridSourceOpenedEvent(dataDefinition: SearchSymbolsDataDefinition) {
        this._searchParams = new SearchSymbolsDitemFrame.SearchParams(this._decimalFactory, this._marketsService, this.symbolsService, dataDefinition);
        const description = this.generateQueryDescription();
        this._componentAccess.processQueryTableOpen(description);
    }

    private handleRecordFocusedEvent(newRecordIndex: Integer | undefined) {
        if (newRecordIndex !== undefined) {
            const searchSymbolsFrame = this._searchSymbolsFrame;
            if (searchSymbolsFrame === undefined) {
                throw new AssertInternalError('SSDHGSOE13133');
            } else {
                const record = searchSymbolsFrame.recordList[newRecordIndex];
                this.processRecordFocusChange(record);
                this._componentAccess.processQueryRecordFocusChange(newRecordIndex);
            }
        }
    }

    private processRecordFocusChange(newFocusedRecord: DataIvemBaseDetail) {
        if (!this._symbolApplying) {
            const dataIvemId = newFocusedRecord.dataIvemId;
            this.applyDitemDataIvemIdFocus(dataIvemId, true);
        }
    }

    private generateQueryDescription() {
        let result = `${Strings[StringId.Query]}: `;
        const conditions = this._searchParams.conditions;
        const condition = (conditions !== undefined && conditions.length > 0) ? conditions[0] : undefined;
        if (condition === undefined) {
            result += `"", ${Strings[StringId.Fields]}: ""`;
        } else {
            let fieldsDisplay: string;
            const fieldIds = condition.fieldIds;
            if (fieldIds === undefined) {
                fieldsDisplay = '';
            } else {
                const fieldCount = fieldIds.length;
                const fieldDisplays = new Array<string>(fieldCount);
                for (let i = 0; i < fieldCount; i++) {
                    const fieldId = fieldIds[i];
                    fieldDisplays[i] = SymbolField.idToDisplay(fieldId);
                }
                fieldsDisplay = fieldDisplays.join();
            }
            result += `"${condition.text}", ${Strings[StringId.Fields]}: "${fieldsDisplay}"`;
        }
        const exchange = this._searchParams.exchange;
        if (exchange !== undefined) {
            result += `, ${Strings[StringId.Exchange]}: ${exchange.abbreviatedDisplay}`;
        }
        const markets = this._searchParams.markets;
        if (markets !== undefined) {
            const marketCount = markets.length;
            const marketDisplays = new Array<string>(marketCount);
            for (let i = 0; i < marketCount; i++) {
                const market = markets[i];
                marketDisplays[i] = market.display;
            }
            const marketsDisplay = marketDisplays.join();
            result += `, ${Strings[StringId.Markets]}: "${marketsDisplay}"`;
        }
        const cfi = this._searchParams.cfi;
        if (cfi !== undefined && cfi !== '') {
            result += `, ${Strings[StringId.Cfi]}: "${cfi}"`;
        }
        const options: string[] = [];
        if (condition !== undefined) {
            const matchIds = condition.matchIds;
            // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
            if (matchIds === undefined || !matchIds.includes(SearchSymbolsDataDefinition.Condition.MatchId.exact)) {
                options.push(Strings[StringId.Partial]);
            }
        }
        if (this._searchParams.preferExact) {
            options.push(Strings[StringId.Exact]);
        }
        if (this._searchParams.fullSymbol) {
            options.push(Strings[StringId.Full]);
        }
        const optionsDisplay = options.join();
        result += `, ${Strings[StringId.Options]}: "${optionsDisplay}"`;
        return result;
    }
}

export namespace SearchSymbolsDitemFrame {
    export namespace JsonName {
        export const searchSymbolsFrame = 'searchSymbolsFrame';
    }

    export class SearchParams {
        private readonly _dataDefinition: SearchSymbolsDataDefinition;
        private _exchange: Exchange | undefined;
        private _markets: readonly DataMarket[] | undefined;
        private _condition: SearchSymbolsDataDefinition.Condition | undefined;

        constructor(
            decimalFactory: DecimalFactory,
            marketsService: MarketsService,
            private readonly _symbolsService: SymbolsService,
            dataDefinition: SearchSymbolsDataDefinition | undefined
        ) {
            if (dataDefinition === undefined) {
                this._dataDefinition = new SearchSymbolsDataDefinition(decimalFactory);
                this.setDefault();
            } else {
                this._dataDefinition = dataDefinition;
                const exchangeZenithCode = dataDefinition.exchangeZenithCode;
                if (exchangeZenithCode === undefined) {
                    this._exchange = undefined;
                } else {
                    this._exchange = marketsService.getExchangeOrUnknown(exchangeZenithCode);
                }

                const marketZenithCodes = this._dataDefinition.marketZenithCodes;
                if (marketZenithCodes === undefined) {
                    this._markets = undefined;
                } else {
                    this._markets = marketZenithCodes.map((zenithCode) => marketsService.getDataMarketOrUnknown(zenithCode));
                }

                const conditions = this._dataDefinition.conditions;
                if (conditions === undefined || conditions.length === 0) {
                    this._condition = undefined;
                } else {
                    this._condition = conditions[0];
                }
            }
        }

        get conditions(): SearchSymbolsDataDefinition.Condition[] | undefined { return this._dataDefinition.conditions; }

        get exchange(): Exchange | undefined { return this._exchange; }
        set exchange(value: Exchange | undefined) {
            this._exchange = undefined;
            this._dataDefinition.exchangeZenithCode = value === undefined ? undefined : value.zenithCode;
        }
        get market(): readonly DataMarket[] | undefined { return this._markets; }
        set markets(value: readonly DataMarket[] | undefined) {
            this._markets = undefined;
            this._dataDefinition.marketZenithCodes = value === undefined ? undefined : value.map((market) => market.zenithCode);
        }

        get cfi(): string | undefined { return this._dataDefinition.cfi; }
        set cfi(value: string | undefined) { this._dataDefinition.cfi = value; }
        get combinationLeg(): string | undefined { return this._dataDefinition.combinationLeg; }
        set combinationLeg(value: string | undefined) { this._dataDefinition.combinationLeg = value; }
        get count(): Integer | undefined { return this._dataDefinition.count; }
        set count(value: Integer | undefined) { this._dataDefinition.count = value; }
        get expiryDateMin(): Date | undefined { return this._dataDefinition.expiryDateMin; }
        set expiryDateMin(value: Date | undefined) { this._dataDefinition.expiryDateMin = value; }
        get expiryDateMax(): Date | undefined { return this._dataDefinition.expiryDateMax; }
        set expiryDateMax(value: Date | undefined) { this._dataDefinition.expiryDateMax = value; }
        get index(): boolean | undefined { return this._dataDefinition.index; }
        set index(value: boolean | undefined) { this._dataDefinition.index = value; }
        get ivemClassId(): IvemClassId | undefined { return this._dataDefinition.ivemClassId; }
        set ivemClassId(value: IvemClassId | undefined) { this._dataDefinition.ivemClassId = value; }
        get fullSymbol(): boolean { return this._dataDefinition.fullSymbol; }
        set fullSymbol(value: boolean) { this._dataDefinition.fullSymbol = value; }
        get preferExact(): boolean | undefined { return this._dataDefinition.preferExact; }
        set preferExact(value: boolean | undefined) { this._dataDefinition.preferExact = value; }
        get startIndex(): Integer | undefined { return this._dataDefinition.startIndex; }
        set startIndex(value: Integer | undefined) { this._dataDefinition.startIndex = value; }
        get strikePriceMin(): Decimal | undefined { return this._dataDefinition.strikePriceMin; }
        set strikePriceMin(value: Decimal | undefined) { this._dataDefinition.strikePriceMin = value; }
        get strikePriceMax(): Decimal | undefined { return this._dataDefinition.strikePriceMax; }
        set strikePriceMax(value: Decimal | undefined) { this._dataDefinition.strikePriceMax = value; }


        get isPartial() {
            const condition = this._condition;
            if (condition === undefined) {
                return true;
            } else {
                if (condition.matchIds === undefined) {
                    return true;
                } else {
                    return condition.matchIds.includes(SearchSymbolsDataDefinition.Condition.MatchId.exact);
                }
            }
        }
        set isPartial(value: boolean | undefined) {
            const condition = this.forceGetCondition();
            if (value === true) {
                condition.matchIds = undefined;
            } else {
                condition.matchIds = [SearchSymbolsDataDefinition.Condition.MatchId.exact];
            }
        }

        get fieldIds() {
            if (this._condition === undefined) {
                return undefined;
            } else {
                return this._condition.fieldIds;
            }
        }
        set fieldIds(value: readonly SymbolFieldId[] | undefined) {
            const condition = this.forceGetCondition();
            condition.fieldIds = value?.slice();
        }

        get searchText() {
            if (this._condition === undefined) {
                return '';
            } else {
                return this._condition.text;
            }
        }
        set searchText(value: string) {
            const condition = this.forceGetCondition();
            condition.text = value;
        }

        get isCaseSensitive() {
            if (this._condition === undefined) {
                return undefined;
            } else {
                return this._condition.isCaseSensitive;
            }
        }
        set isCaseSensitive(value: boolean | undefined) {
            const condition = this.forceGetCondition();
            condition.isCaseSensitive = value;
        }

        createDataDefinition(): SearchSymbolsDataDefinition {
            return this._dataDefinition.createCopy();
        }

        setDefault() {
            const defaultExchange = this._symbolsService.defaultExchange;
            this._exchange = defaultExchange;
            this._dataDefinition.exchangeZenithCode = defaultExchange.zenithCode;
            const defaultLitMarket = defaultExchange.defaultLitMarket;
            if (defaultLitMarket === undefined) {
                this._markets = undefined;
                this._dataDefinition.marketZenithCodes = undefined;
            } else {
                this._markets = [defaultLitMarket];
                this._dataDefinition.marketZenithCodes = [defaultLitMarket.zenithCode];
            }

            this._dataDefinition.cfi = '';
            this._dataDefinition.index = false;
            this._dataDefinition.preferExact = false;
            this._dataDefinition.fullSymbol = false;
            this._dataDefinition.count = 200;

            this.setDefaultCondition(defaultExchange);
        }

        private forceGetCondition() {
            let condition = this._condition;
            if (condition === undefined) {
                condition = this.setDefaultCondition(this._exchange ?? this._symbolsService.defaultExchange);
            }
            return condition;
        }

        private setDefaultCondition(defaultExchange: Exchange) {
            const condition = this.createDefaultCondition(defaultExchange);
            this._dataDefinition.conditions = [condition];
            this._condition = condition;

            return condition;
        }

        private createDefaultCondition(defaultExchange: Exchange) {
            let defaultFieldIds: readonly SymbolFieldId[];
            const exchangeSettings = defaultExchange.settings;
            if (exchangeSettings === undefined) {
                defaultFieldIds = [SymbolFieldId.Code];
            } else {
                defaultFieldIds = exchangeSettings.symbolSearchFieldIds;
                if (defaultFieldIds.length === 0) {
                    defaultFieldIds = [SymbolFieldId.Code];
                }
            }

            const defaultCondition: SearchSymbolsDataDefinition.Condition = {
                text: '',
                fieldIds: defaultFieldIds,
                isCaseSensitive: false,
            };

            return defaultCondition;
        }
    }

    export type TargetFieldId = SymbolFieldId;
    export const CodeTargetFieldId = SymbolFieldId.Code;
    export const NameTargetFieldId = SymbolFieldId.Name;

    export type RecordFocusEvent = (this: void, newRecordIndex: Integer | undefined) => void;
    export type TableOpenEvent = (this: void, description: string) => void;

    export const enum LayoutTypeId {
        QueryBase,
        QueryFull,
        Subscription,
    }

    export const enum IndicesInclusionId {
        Exclude,
        Include,
        Only,
    }

    export namespace IndicesInclusion {
        type Id = IndicesInclusionId;

        interface Info {
            readonly id: Id;
            readonly captionId: StringId;
            readonly titleId: StringId;
        }

        type InfosObject = { [id in keyof typeof IndicesInclusionId]: Info };

        const infosObject: InfosObject = {
            Exclude: {
                id: IndicesInclusionId.Exclude,
                captionId: StringId.SearchSymbolsIndicesInclusion_ExcludeCaption,
                titleId: StringId.SearchSymbolsIndicesInclusion_ExcludeTitle,
            },
            Include: {
                id: IndicesInclusionId.Include,
                captionId: StringId.SearchSymbolsIndicesInclusion_IncludeCaption,
                titleId: StringId.SearchSymbolsIndicesInclusion_IncludeTitle,
            },
            Only: {
                id: IndicesInclusionId.Only,
                captionId: StringId.SearchSymbolsIndicesInclusion_OnlyCaption,
                titleId: StringId.SearchSymbolsIndicesInclusion_OnlyTitle,
            },
        } as const;

        const infos = Object.values(infosObject);
        export const idCount = infos.length;

        export function initialise() {
            for (let i = 0; i < idCount; i++) {
                if (infos[i].id !== i as IndicesInclusionId) {
                    throw new EnumInfoOutOfOrderError('SearchSymbolsDitemFrame.IndicesInclusion', i, idToCaption(i));
                }
            }
        }

        function idToCaptionId(id: Id) {
            return infos[id].captionId;
        }

        export function idToCaption(id: Id) {
            return Strings[idToCaptionId(id)];
        }

        function idToTitleId(id: Id) {
            return infos[id].titleId;
        }

        export function idToTitle(id: Id) {
            return Strings[idToTitleId(id)];
        }
    }

    export interface ComponentAccess extends DitemFrame.ComponentAccess {
        processQueryTableOpen(description: string): void;
        processQueryRecordFocusChange(recordIdx: Integer): void;
    }
}
