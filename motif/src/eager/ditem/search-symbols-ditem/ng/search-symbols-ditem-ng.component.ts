import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    OnDestroy,
    viewChild,
    ViewContainerRef
} from '@angular/core';
import {
    AssertInternalError,
    delay1Tick,
    getErrorMessage,
    Integer,
    JsonElement
} from '@pbkware/js-utils';
import { BooleanUiAction, IntegerListSelectItemsUiAction, IntegerListSelectItemUiAction, IntegerUiAction, SelectItemsUiAction, StringUiAction } from '@pbkware/ui-action';
import {
    ColumnLayoutOrReference,
    ExchangeListSelectItemUiAction,
    IconButtonUiAction,
    InternalCommand,
    MarketListSelectItemsUiAction,
    MarketsService,
    StringId,
    Strings,
    SymbolField,
    SymbolFieldId,
    SymbolsService
} from '@plxtra/motif-core';
import {
    AdiNgService,
    CommandRegisterNgService,
    DecimalFactoryNgService,
    MarketsNgService,
    SettingsNgService,
    SymbolsNgService,
    ToastNgService
} from 'component-services-ng-api';
import { NameableColumnLayoutEditorDialogNgComponent, SearchSymbolsNgComponent } from 'content-ng-api';
import {
    ButtonInputNgComponent,
    CaptionedCheckboxNgComponent,
    CaptionLabelNgComponent,
    DataMarketCaptionedItemsCheckboxNgComponent,
    DataMarketSelectItemsNgComponent,
    EnumArrayInputNgComponent,
    ExchangeCaptionedRadioNgComponent,
    ExchangeSelectItemNgComponent,
    IntegerCaptionedItemsCheckboxNgComponent,
    IntegerCaptionedRadioNgComponent,
    IntegerLabelNgComponent,
    IntegerTextInputNgComponent,
    SvgButtonNgComponent,
    TextInputNgComponent
} from 'controls-ng-api';
import { ComponentContainer } from 'golden-layout';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { SearchSymbolsDitemFrame } from '../search-symbols-ditem-frame';

@Component({
    selector: 'app-search-symbols-ditem',
    templateUrl: './search-symbols-ditem-ng.component.html',
    styleUrls: ['./search-symbols-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SearchSymbolsDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements OnDestroy, AfterViewInit, SearchSymbolsDitemFrame.ComponentAccess {
    private static typeInstanceCreateCount = 0;

    public readonly exchangeRadioName: string;
    public readonly indicesRadioName: string;

    public paginationActive = false; // hide this until implemented

    private readonly _toolbarExecuteButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('toolbarExecuteButton');
    private readonly _symbolLinkButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('symbolLinkButton');
    private readonly _columnsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('columnsButton');

    // Parameters
    private readonly _exchangeLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('exchangeLabel');
    private readonly _defaultExchangeControlComponentSignal = viewChild.required<ExchangeCaptionedRadioNgComponent>('defaultExchangeControl');
    private readonly _exchangeControlComponentSignal = viewChild.required<ExchangeSelectItemNgComponent>('exchangeControl');
    private readonly _marketsLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('marketsLabel');
    private readonly _defaultMarketControlComponentSignal = viewChild.required<DataMarketCaptionedItemsCheckboxNgComponent>('defaultMarketControl');
    private readonly _marketsControlComponentSignal = viewChild.required<DataMarketSelectItemsNgComponent>('marketsControl');
    private readonly _cfiLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('cfiLabel');
    private readonly _cfiControlComponentSignal = viewChild.required<TextInputNgComponent>('cfiControl');
    private readonly _fieldsLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('fieldsLabel');
    private readonly _codeControlComponentSignal = viewChild.required<IntegerCaptionedItemsCheckboxNgComponent>('codeControl');
    private readonly _nameControlComponentSignal = viewChild.required<IntegerCaptionedItemsCheckboxNgComponent>('nameControl');
    private readonly _fieldsControlComponentSignal = viewChild.required<EnumArrayInputNgComponent>('fieldsControl');
    private readonly _indicesLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('indicesLabel');
    private readonly _excludeIndicesControlComponentSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('excludeIndicesControl');
    private readonly _includeIndicesControlComponentSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('includeIndicesControl');
    private readonly _onlyIndicesControlComponentSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('onlyIndicesControl');
    private readonly _optionsLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('optionsLabel');
    private readonly _partialControlComponentSignal = viewChild.required<CaptionedCheckboxNgComponent>('partialControl');
    private readonly _preferExactControlComponentSignal = viewChild.required<CaptionedCheckboxNgComponent>('preferExactControl');
    private readonly _showFullControlComponentSignal = viewChild.required<CaptionedCheckboxNgComponent>('showFullControl');
    private readonly _pageSizeLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('pageSizeLabel');
    private readonly _pageSizeControlComponentSignal = viewChild.required<IntegerTextInputNgComponent>('pageSizeControl');
    private readonly _searchTextLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('searchTextLabel');
    private readonly _searchTextControlComponentSignal = viewChild.required<TextInputNgComponent>('searchTextControl');
    private readonly _searchTextButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('searchTextButton');

    // Parameters Description
    private readonly _descriptionLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('descriptionLabel');

    // Top page indicator
    private readonly _topPageLabelSignal = viewChild.required<CaptionLabelNgComponent>('topPageLabel');
    private readonly _topPageNumberLabelComponentSignal = viewChild.required<IntegerLabelNgComponent>('topPageNumberLabel');
    private readonly _topOfLabelSignal = viewChild.required<CaptionLabelNgComponent>('topOfLabel');
    private readonly _topPageCountLabelSignal = viewChild.required<IntegerLabelNgComponent>('topPageCountLabel');
    private readonly _topNextButtonComponentSignal = viewChild.required<ButtonInputNgComponent>('topNextButton');

    // Query Search results
    private readonly _searchSymbolsComponentSignal = viewChild.required<SearchSymbolsNgComponent>('searchSymbols');

    // Bottom Query page indicator
    private readonly _bottomPageLabelSignal = viewChild.required<CaptionLabelNgComponent>('bottomPageLabel');
    private readonly _bottomPageNumberLabelComponentSignal = viewChild.required<IntegerLabelNgComponent>('bottomPageNumberLabel');
    private readonly _bottomOfLabelSignal = viewChild.required<CaptionLabelNgComponent>('bottomOfLabel');
    private readonly _bottomPageCountLabelSignal = viewChild.required<IntegerLabelNgComponent>('bottomPageCountLabel');
    private readonly _bottomNextButtonComponentSignal = viewChild.required<ButtonInputNgComponent>('bottomNextButton');

    private readonly _dialogContainerSignal = viewChild.required('layoutEditorContainer', { read: ViewContainerRef });

    private readonly _marketsService: MarketsService;

    private readonly _toggleSymbolLinkingUiAction: IconButtonUiAction;
    private readonly _columnsUiAction: IconButtonUiAction;

    // Query
    private readonly _sourceUiAction: StringUiAction;
    private readonly _exchangeUiAction: ExchangeListSelectItemUiAction;
    private readonly _marketsUiAction: MarketListSelectItemsUiAction;
    private readonly _cfiUiAction: StringUiAction;
    private readonly _fieldsUiAction: IntegerListSelectItemsUiAction;
    private readonly _optionsUiAction: StringUiAction;
    private readonly _indicesInclusionUiAction: IntegerListSelectItemUiAction;
    private readonly _partialUiAction: BooleanUiAction;
    private readonly _preferExactUiAction: BooleanUiAction;
    private readonly _showFullUiAction: BooleanUiAction;
    private readonly _pageSizeUiAction: IntegerUiAction;
    private readonly _searchUiAction: StringUiAction;
    private readonly _queryUiAction: IconButtonUiAction;

    // Description
    private readonly _descriptionUiAction: StringUiAction;

    // Top page indicator
    private readonly _pageUiAction: StringUiAction;
    private readonly _pageNumberUiAction: IntegerUiAction;
    private readonly _ofUiAction: StringUiAction;
    private readonly _pageCountUiAction: IntegerUiAction;
    private readonly _nextPageUiAction: BooleanUiAction;

    private readonly _symbolsService: SymbolsService;
    private readonly _frame: SearchSymbolsDitemFrame;

    private _toolbarExecuteButtonComponent: SvgButtonNgComponent;
    private _symbolLinkButtonComponent: SvgButtonNgComponent;
    private _columnsButtonComponent: SvgButtonNgComponent;

    // Parameters
    private _exchangeLabelComponent: CaptionLabelNgComponent;
    private _defaultExchangeControlComponent: ExchangeCaptionedRadioNgComponent;
    private _exchangeControlComponent: ExchangeSelectItemNgComponent;
    private _marketsLabelComponent: CaptionLabelNgComponent;
    private _defaultMarketControlComponent: DataMarketCaptionedItemsCheckboxNgComponent;
    private _marketsControlComponent: DataMarketSelectItemsNgComponent;
    private _cfiLabelComponent: CaptionLabelNgComponent;
    private _cfiControlComponent: TextInputNgComponent;
    private _fieldsLabelComponent: CaptionLabelNgComponent;
    private _codeControlComponent: IntegerCaptionedItemsCheckboxNgComponent;
    private _nameControlComponent: IntegerCaptionedItemsCheckboxNgComponent;
    private _fieldsControlComponent: EnumArrayInputNgComponent;
    private _indicesLabelComponent: CaptionLabelNgComponent;
    private _excludeIndicesControlComponent: IntegerCaptionedRadioNgComponent;
    private _includeIndicesControlComponent: IntegerCaptionedRadioNgComponent;
    private _onlyIndicesControlComponent: IntegerCaptionedRadioNgComponent;
    private _optionsLabelComponent: CaptionLabelNgComponent;
    private _partialControlComponent: CaptionedCheckboxNgComponent;
    private _preferExactControlComponent: CaptionedCheckboxNgComponent;
    private _showFullControlComponent: CaptionedCheckboxNgComponent;
    private _pageSizeLabelComponent: CaptionLabelNgComponent;
    private _pageSizeControlComponent: IntegerTextInputNgComponent;
    private _searchTextLabelComponent: CaptionLabelNgComponent;
    private _searchTextControlComponent: TextInputNgComponent;
    private _searchTextButtonComponent: SvgButtonNgComponent;

    // Parameters Description
    private _descriptionLabelComponent: CaptionLabelNgComponent;

    // Top page indicator
    private _topPageLabel: CaptionLabelNgComponent;
    private _topPageNumberLabelComponent: IntegerLabelNgComponent;
    private _topOfLabel: CaptionLabelNgComponent;
    private _topPageCountLabel: IntegerLabelNgComponent;
    private _topNextButtonComponent: ButtonInputNgComponent;

    // Query Search results
    private _searchSymbolsComponent: SearchSymbolsNgComponent;

    // Bottom Query page indicator
    private _bottomPageLabel: CaptionLabelNgComponent;
    private _bottomPageNumberLabelComponent: IntegerLabelNgComponent;
    private _bottomOfLabel: CaptionLabelNgComponent;
    private _bottomPageCountLabel: IntegerLabelNgComponent;
    private _bottomNextButtonComponent: ButtonInputNgComponent;

    private _dialogContainer: ViewContainerRef;

    private _modeId = SearchSymbolsDitemNgComponent.ModeId.Main;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        @Inject(BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken) container: ComponentContainer,
        decimalFactoryNgService: DecimalFactoryNgService,
        settingsNgService: SettingsNgService,
        marketsNgService: MarketsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        desktopAccessNgService: DesktopAccessNgService,
        symbolsNgService: SymbolsNgService,
        adiNgService: AdiNgService,
        private readonly _toastNgService: ToastNgService,
    ) {
        super(
            elRef,
            ++SearchSymbolsDitemNgComponent.typeInstanceCreateCount,
            cdr,
            container,
            settingsNgService.service,
            commandRegisterNgService.service
        );

        this._marketsService = marketsNgService.service;

        this._symbolsService = symbolsNgService.service;

        this.exchangeRadioName = this.generateInstancedRadioName('exchange');
        this.indicesRadioName = this.generateInstancedRadioName('indices');

        this._frame = new SearchSymbolsDitemFrame(
            this,
            decimalFactoryNgService.service,
            this.settingsService,
            this._marketsService,
            this.commandRegisterService,
            desktopAccessNgService.service,
            symbolsNgService.service,
            adiNgService.service,
        );

        this._toggleSymbolLinkingUiAction = this.createToggleSymbolLinkingUiAction();
        this._columnsUiAction = this.createColumnsUiAction();
        this._sourceUiAction = this.createSourceUiAction();
        this._exchangeUiAction = this.createExchangeUiAction();
        this._marketsUiAction = this.createMarketsUiAction();
        this._cfiUiAction = this.createCfiUiAction();
        this._fieldsUiAction = this.createFieldsUiAction();
        this._optionsUiAction = this.createOptionsUiAction();
        this._indicesInclusionUiAction = this.createIndicesInclusionUiAction();
        this._partialUiAction = this.createPartialUiAction();
        this._preferExactUiAction = this.createPreferExactUiAction();
        this._showFullUiAction = this.createShowFullUiAction();
        this._pageSizeUiAction = this.createPageSizeUiAction();
        this._searchUiAction = this.createSearchUiAction();
        this._queryUiAction = this.createQueryUiAction();
        this._descriptionUiAction = this.createQuerySearchDescriptionUiAction();
        this._pageUiAction = this.createPageUiAction();
        this._pageNumberUiAction = this.createPageNumberUiAction();
        this._ofUiAction = this.createOfUiAction();
        this._pageCountUiAction = this.createPageCountUiAction();
        this._nextPageUiAction = this.createNextPageUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());

        this.pushSymbolLinkButtonState();
        this._exchangeUiAction.pushValue(this._frame.exchange);
        this._marketsUiAction.pushValue(this._frame.markets);
        this._cfiUiAction.pushValue(this._frame.cfi);
        this._fieldsUiAction.pushValue(this._frame.fieldIds);
        this._indicesInclusionUiAction.pushValue(this._frame.indicesInclusion);
        this._partialUiAction.pushValue(this._frame.isPartial);
        this._preferExactUiAction.pushValue(this._frame.preferExact);
        this._showFullUiAction.pushValue(this._frame.showFull);
        this._pageSizeUiAction.pushValue(this._frame.count);
        this._searchUiAction.pushValue(this._frame.searchText);
    }

    get ditemFrame() { return this._frame; }

    protected get stateSchemaVersion() { return SearchSymbolsDitemNgComponent.stateSchemaVersion; }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._toolbarExecuteButtonComponent = this._toolbarExecuteButtonComponentSignal();
        this._symbolLinkButtonComponent = this._symbolLinkButtonComponentSignal();
        this._columnsButtonComponent = this._columnsButtonComponentSignal();
        this._exchangeLabelComponent = this._exchangeLabelComponentSignal();
        this._defaultExchangeControlComponent = this._defaultExchangeControlComponentSignal();
        this._exchangeControlComponent = this._exchangeControlComponentSignal();
        this._marketsLabelComponent = this._marketsLabelComponentSignal();
        this._defaultMarketControlComponent = this._defaultMarketControlComponentSignal();
        this._marketsControlComponent = this._marketsControlComponentSignal();
        this._cfiLabelComponent = this._cfiLabelComponentSignal();
        this._cfiControlComponent = this._cfiControlComponentSignal();
        this._fieldsLabelComponent = this._fieldsLabelComponentSignal();
        this._codeControlComponent = this._codeControlComponentSignal();
        this._nameControlComponent = this._nameControlComponentSignal();
        this._fieldsControlComponent = this._fieldsControlComponentSignal();
        this._indicesLabelComponent = this._indicesLabelComponentSignal();
        this._excludeIndicesControlComponent = this._excludeIndicesControlComponentSignal();
        this._includeIndicesControlComponent = this._includeIndicesControlComponentSignal();
        this._onlyIndicesControlComponent = this._onlyIndicesControlComponentSignal();
        this._optionsLabelComponent = this._optionsLabelComponentSignal();
        this._partialControlComponent = this._partialControlComponentSignal();
        this._preferExactControlComponent = this._preferExactControlComponentSignal();
        this._showFullControlComponent = this._showFullControlComponentSignal();
        this._pageSizeLabelComponent = this._pageSizeLabelComponentSignal();
        this._pageSizeControlComponent = this._pageSizeControlComponentSignal();
        this._searchTextLabelComponent = this._searchTextLabelComponentSignal();
        this._searchTextControlComponent = this._searchTextControlComponentSignal();
        this._searchTextButtonComponent = this._searchTextButtonComponentSignal();
        this._descriptionLabelComponent = this._descriptionLabelComponentSignal();
        this._topPageLabel = this._topPageLabelSignal();
        this._topPageNumberLabelComponent = this._topPageNumberLabelComponentSignal();
        this._topOfLabel = this._topOfLabelSignal();
        this._topPageCountLabel = this._topPageCountLabelSignal();
        this._topNextButtonComponent = this._topNextButtonComponentSignal();
        this._searchSymbolsComponent = this._searchSymbolsComponentSignal();
        this._bottomPageLabel = this._bottomPageLabelSignal();
        this._bottomPageNumberLabelComponent = this._bottomPageNumberLabelComponentSignal();
        this._bottomOfLabel = this._bottomOfLabelSignal();
        this._bottomPageCountLabel = this._bottomPageCountLabelSignal();
        this._bottomNextButtonComponent = this._bottomNextButtonComponentSignal();
        this._dialogContainer = this._dialogContainerSignal();

        delay1Tick(() => this.initialise());
    }

    public isMainMode() {
        return this._modeId === SearchSymbolsDitemNgComponent.ModeId.Main;
    }

    public isLayoutEditorMode() {
        return this._modeId === SearchSymbolsDitemNgComponent.ModeId.LayoutEditor;
    }

    // Component Access Methods
    public processQueryTableOpen(description: string) {
        this._descriptionUiAction.pushCaption(description);
    }

    public processQueryRecordFocusChange(recordIdx: Integer) {
        // nothing implemented
    }

    public processSubscriptionRecordFocusChange(recordIdx: Integer) {
        // nothing implemented
    }

    public override processSymbolLinkedChanged() {
        this.pushSymbolLinkButtonState();
    }

    protected override initialise() {
        const defaultExchange = this._symbolsService.defaultExchange;
        const defaultMarket = defaultExchange.defaultLitMarket;

        this._symbolLinkButtonComponent.initialise(this._toggleSymbolLinkingUiAction);
        this._columnsButtonComponent.initialise(this._columnsUiAction);
        this._exchangeLabelComponent.initialise(this._exchangeUiAction);
        this._defaultExchangeControlComponent.initialiseEnum(this._exchangeUiAction, defaultExchange);
        this._exchangeControlComponent.initialise(this._exchangeUiAction);
        this._marketsLabelComponent.initialise(this._marketsUiAction);
        if (defaultMarket !== undefined) {
            this._defaultMarketControlComponent.initialiseEnum(this._marketsUiAction, defaultMarket);
        }
        this._marketsControlComponent.initialise(this._marketsUiAction);
        this._cfiLabelComponent.initialise(this._cfiUiAction);
        this._cfiControlComponent.initialise(this._cfiUiAction);
        this._fieldsLabelComponent.initialise(this._fieldsUiAction);
        this._codeControlComponent.initialiseEnum(this._fieldsUiAction, SymbolFieldId.Code);
        this._nameControlComponent.initialiseEnum(this._fieldsUiAction, SymbolFieldId.Name);
        this._fieldsControlComponent.initialise(this._fieldsUiAction);
        this._indicesLabelComponent.initialise(this._indicesInclusionUiAction);
        this._excludeIndicesControlComponent.initialiseEnum(this._indicesInclusionUiAction,
            SearchSymbolsDitemFrame.IndicesInclusionId.Exclude);
        this._includeIndicesControlComponent.initialiseEnum(this._indicesInclusionUiAction,
            SearchSymbolsDitemFrame.IndicesInclusionId.Include);
        this._onlyIndicesControlComponent.initialiseEnum(this._indicesInclusionUiAction,
            SearchSymbolsDitemFrame.IndicesInclusionId.Only);
        this._optionsLabelComponent.initialise(this._optionsUiAction);
        this._partialControlComponent.initialise(this._partialUiAction);
        this._preferExactControlComponent.initialise(this._preferExactUiAction);
        this._showFullControlComponent.initialise(this._showFullUiAction);
        this._pageSizeLabelComponent.initialise(this._pageSizeUiAction);
        this._pageSizeControlComponent.initialise(this._pageSizeUiAction);
        this._searchTextLabelComponent.initialise(this._searchUiAction);
        this._searchTextControlComponent.initialise(this._searchUiAction);
        this._toolbarExecuteButtonComponent.initialise(this._queryUiAction);
        this._searchTextButtonComponent.initialise(this._queryUiAction);
        this._descriptionLabelComponent.initialise(this._descriptionUiAction);
        this._topPageLabel.initialise(this._pageUiAction);
        this._topPageNumberLabelComponent.initialise(this._pageNumberUiAction);
        this._topOfLabel.initialise(this._ofUiAction);
        this._topPageCountLabel.initialise(this._pageCountUiAction);
        this._topNextButtonComponent.initialise(this._nextPageUiAction);
        this._bottomPageLabel.initialise(this._pageUiAction);
        this._bottomPageNumberLabelComponent.initialise(this._pageNumberUiAction);
        this._bottomOfLabel.initialise(this._ofUiAction);
        this._bottomPageCountLabel.initialise(this._pageCountUiAction);
        this._bottomNextButtonComponent.initialise(this._nextPageUiAction);

        const componentStateElement = this.getInitialComponentStateJsonElement();
        const frameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        this._frame.initialise(frameElement, this._searchSymbolsComponent.frame);

        super.initialise();
    }

    protected override finalise() {
        this._toggleSymbolLinkingUiAction.finalise();
        this._columnsUiAction.finalise();
        this._sourceUiAction.finalise();
        this._exchangeUiAction.finalise();
        this._marketsUiAction.finalise();
        this._cfiUiAction.finalise();
        this._fieldsUiAction.finalise();
        this._optionsUiAction.finalise();
        this._indicesInclusionUiAction.finalise();
        this._partialUiAction.finalise();
        this._preferExactUiAction.finalise();
        this._showFullUiAction.finalise();
        this._pageSizeUiAction.finalise();
        this._searchUiAction.finalise();
        this._queryUiAction.finalise();
        this._descriptionUiAction.finalise();
        this._pageUiAction.finalise();
        this._pageNumberUiAction.finalise();
        this._ofUiAction.finalise();
        this._pageCountUiAction.finalise();
        this._nextPageUiAction.finalise();

        this._frame.finalise();
        super.finalise();
    }

    protected constructLoad(element: JsonElement | undefined) {
        const frameElement = this.tryGetChildFrameJsonElement(element);
        this._frame.constructLoad(frameElement);
    }

    protected save(element: JsonElement) {
        const frameElement = this.createChildFrameJsonElement(element);
        this._frame.save(frameElement);
    }

    private handleSymbolLinkSignalEvent() {
        this._frame.dataIvemIdLinked = !this._frame.dataIvemIdLinked;
    }

    private handleColumnsUiActionSignalEvent() {
        this.showLayoutEditor();
    }

    private handleExchangeCommitEvent() {
        const exchange = this._exchangeUiAction.definedValue;
        this._frame.exchange = exchange;
        this._marketsUiAction.pushValue(this._frame.markets);
    }

    private handleMarketsCommitEvent() {
        const markets = this._marketsUiAction.definedValue;
        this._frame.markets = markets;
    }

    private handleCfiCommitEvent() {
        const cfi = this._cfiUiAction.definedValue;
        this._frame.cfi = cfi;
    }

    private handleFieldsCommitEvent() {
        const ids = this._fieldsUiAction.definedValue as readonly SymbolFieldId[];
        this._frame.fieldIds = ids;
    }

    private handleIndicesInclusionCommitEvent() {
        this._frame.indicesInclusion = this._indicesInclusionUiAction.definedValue;
    }

    private handlePartialCommitEvent() {
        this._frame.isPartial = this._partialUiAction.definedValue;
    }

    private handlePreferExactCommitEvent() {
        this._frame.preferExact = this._preferExactUiAction.definedValue;
    }

    private handleShowFullCommitEvent() {
        this._frame.showFull = this._showFullUiAction.definedValue;
    }

    private handlePageSizeCommitEvent() {
        this._frame.count = this._pageSizeUiAction.definedValue;
    }

    private handleSearchCommitEvent() {
        this._frame.searchText = this._searchUiAction.definedValue;
    }

    private handleQuerySignalEvent() {
        this._frame.executeRequest();
    }

    private handleNextPageSignalEvent() {
        // not sure about this yet
    }

    private showLayoutEditor() {
        this._modeId = SearchSymbolsDitemNgComponent.ModeId.LayoutEditor;
        const allowedFieldsAndLayoutDefinition = this._frame.createAllowedFieldsAndLayoutDefinition();

        const closePromise = NameableColumnLayoutEditorDialogNgComponent.open(
            this._dialogContainer,
            this._frame.opener,
            Strings[StringId.SymbolsDitemControlCaption_ColumnsDialogCaption],
            allowedFieldsAndLayoutDefinition
        );
        closePromise.then(
            (layoutOrReferenceDefinition) => {
                if (layoutOrReferenceDefinition !== undefined) {
                    const openPromise = this._frame.tryOpenColumnLayoutOrReferenceDefinition(layoutOrReferenceDefinition);
                    openPromise.then(
                        (openResult) => {
                            if (openResult.isErr()) {
                                const error = ColumnLayoutOrReference.formatError(openResult.error);
                                this._toastNgService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.SearchSymbols]} ${Strings[StringId.ColumnLayout]}: ${error}`);
                            }
                        },
                        (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'SSDNCSLECPOP68823'); }
                    );
                }
                this.closeLayoutEditor();
            },
            (reason: unknown) => {
                const errorText = getErrorMessage(reason);
                window.motifLogger.logError(`Symbols Layout Editor error: ${errorText}`);
                this.closeLayoutEditor();
            }
        );

        this.markForCheck();
    }

    private closeLayoutEditor() {
        this._dialogContainer.clear();
        this._modeId = SearchSymbolsDitemNgComponent.ModeId.Main;
        this.markForCheck();
    }

    private createToggleSymbolLinkingUiAction() {
        const commandName = InternalCommand.Id.ToggleSymbolLinking;
        const displayId = StringId.ToggleSymbolLinkingCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ToggleSymbolLinkingTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SymbolLink);
        action.signalEvent = () => this.handleSymbolLinkSignalEvent();
        return action;
    }

    private createColumnsUiAction() {
        const commandName = InternalCommand.Id.SelectGridColumns;
        const displayId = StringId.SelectColumnsCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.SelectColumnsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SelectColumns);
        action.pushUnselected();
        action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }

    private createSourceUiAction() {
        const action = new StringUiAction();
        action.pushCaption(Strings[StringId.Source]);
        return action;
    }

    private createExchangeUiAction() {
        const action = new ExchangeListSelectItemUiAction(this._marketsService);
        action.pushTitle(Strings[StringId.SymbolsDitemControlTitle_Exchange]);
        action.pushCaption(Strings[StringId.SymbolsDitemControlCaption_Exchange]);
        action.commitEvent = () => this.handleExchangeCommitEvent();
        return action;
    }

    private createMarketsUiAction() {
        const action = new MarketListSelectItemsUiAction(this._marketsService);
        action.pushTitle(Strings[StringId.SymbolsDitemControlTitle_Markets]);
        action.pushCaption(Strings[StringId.SymbolsDitemControlCaption_Markets]);
        action.commitEvent = () => this.handleMarketsCommitEvent();
        return action;
    }

    private createCfiUiAction() {
        const action = new StringUiAction();
        action.pushTitle(Strings[StringId.SymbolsDitemControlTitle_Cfi]);
        action.pushCaption(Strings[StringId.SymbolsDitemControlCaption_Cfi]);
        action.commitEvent = () => this.handleCfiCommitEvent();
        return action;
    }

    private createFieldsUiAction() {
        const action = new IntegerListSelectItemsUiAction();
        action.pushTitle(Strings[StringId.SymbolsDitemControlTitle_Fields]);
        action.pushCaption(Strings[StringId.SymbolsDitemControlCaption_Fields]);

        const entryCount = SymbolField.idCount;
        const list = new Array<SelectItemsUiAction.ItemProperties<SymbolFieldId>>(entryCount);
        for (let id = 0; id < entryCount; id++) {
            list[id] = {
                item: id,
                caption: SymbolField.idToDisplay(id),
                title: SymbolField.idToDescription(id),
            };
        }

        action.pushList(list, undefined);
        action.commitEvent = () => this.handleFieldsCommitEvent();
        return action;
    }

    private createOptionsUiAction() {
        const action = new StringUiAction();
        action.valueRequired = false;
        action.pushCaption(Strings[StringId.Options]);
        return action;
    }

    private createIndicesInclusionUiAction() {
        const action = new IntegerListSelectItemUiAction();
        action.pushTitle(Strings[StringId.SymbolsDitemControlTitle_Indices]);
        action.pushCaption(Strings[StringId.SymbolsDitemControlCaption_Indices]);

        const entryCount = SearchSymbolsDitemFrame.IndicesInclusion.idCount;
        const list = new Array<IntegerListSelectItemUiAction.ItemProperties>(entryCount);
        for (let id = 0; id < entryCount; id++) {
            list[id] = {
                item: id,
                caption: SearchSymbolsDitemFrame.IndicesInclusion.idToCaption(id),
                title: SearchSymbolsDitemFrame.IndicesInclusion.idToTitle(id),
            };
        }

        action.pushList(list, undefined);
        action.commitEvent = () => this.handleIndicesInclusionCommitEvent();
        return action;
    }

    private createPartialUiAction() {
        const action = new BooleanUiAction();
        action.pushTitle(Strings[StringId.SymbolsDitemControlTitle_Partial]);
        action.pushCaption(Strings[StringId.SymbolsDitemControlCaption_Partial]);
        action.commitEvent = () => this.handlePartialCommitEvent();
        return action;
    }

    private createPreferExactUiAction() {
        const action = new BooleanUiAction();
        action.pushTitle(Strings[StringId.SymbolsDitemControlTitle_PreferExact]);
        action.pushCaption(Strings[StringId.SymbolsDitemControlCaption_PreferExact]);
        action.commitEvent = () => this.handlePreferExactCommitEvent();
        return action;
    }

    private createShowFullUiAction() {
        const action = new BooleanUiAction();
        action.pushTitle(Strings[StringId.SymbolsDitemControlTitle_ShowFull]);
        action.pushCaption(Strings[StringId.SymbolsDitemControlCaption_ShowFull]);
        action.commitEvent = () => this.handleShowFullCommitEvent();
        return action;
    }

    private createPageSizeUiAction() {
        const action = new IntegerUiAction();
        action.pushTitle(Strings[StringId.SymbolsDitemControlTitle_PageSize]);
        action.pushCaption(Strings[StringId.SymbolsDitemControlCaption_PageSize]);
        action.commitEvent = () => this.handlePageSizeCommitEvent();
        return action;
    }

    private createSearchUiAction() {
        const action = new StringUiAction();
        action.pushTitle(Strings[StringId.SymbolsDitemControlTitle_Search]);
        action.pushCaption(Strings[StringId.SymbolsDitemControlCaption_Search]);
        action.commitEvent = () => this.handleSearchCommitEvent();
        return action;
    }

    private createQueryUiAction() {
        const commandName = InternalCommand.Id.Symbols_Query;
        const displayId = StringId.SymbolsDitemControlCaption_Query;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.SymbolsDitemControlTitle_Query]);
        action.pushIcon(IconButtonUiAction.IconId.Execute);
        action.signalEvent = () => this.handleQuerySignalEvent();
        return action;
    }

    private createQuerySearchDescriptionUiAction() {
        const action = new StringUiAction();
        action.pushTitle(Strings[StringId.SymbolsDitemControlTitle_QuerySearchDescription]);
        return action;
    }

    private createPageUiAction() {
        const action = new StringUiAction();
        action.pushValue(Strings[StringId.Page]);
        return action;
    }

    private createPageNumberUiAction() {
        const action = new IntegerUiAction();
        return action;
    }

    private createOfUiAction() {
        const action = new StringUiAction();
        action.pushValue(Strings[StringId.Of]);
        return action;
    }

    private createPageCountUiAction() {
        const action = new IntegerUiAction();
        return action;
    }

    private createNextPageUiAction() {
        const commandName = InternalCommand.Id.Symbols_NextPage;
        const displayId = StringId.SymbolsDitemControlCaption_NextPage;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.SymbolsDitemControlTitle_NextPage]);
        action.pushIcon(IconButtonUiAction.IconId.Execute);
        action.signalEvent = () => this.handleNextPageSignalEvent();
        return action;
    }

    private pushSymbolLinkButtonState() {
        if (this._frame.dataIvemIdLinked) {
            this._toggleSymbolLinkingUiAction.pushSelected();
        } else {
            this._toggleSymbolLinkingUiAction.pushUnselected();
        }
    }
}

export namespace SearchSymbolsDitemNgComponent {
    export const stateSchemaVersion = '2';

    export const enum ModeId {
        Main,
        LayoutEditor,
    }

}
