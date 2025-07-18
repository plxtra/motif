import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewContainerRef,
    viewChild
} from '@angular/core';
import { MultiEvent, SourceTzOffsetDateTime, delay1Tick } from '@pbkware/js-utils';
import { BooleanUiAction, IntegerListSelectItemUiAction, IntegerListSelectItemsUiAction, IntegerUiAction, SelectItemsUiAction, StringUiAction } from '@pbkware/ui-action';
import {
    ExchangeListSelectItemUiAction,
    MarketsService,
    MasterSettings,
    SourceTzOffsetDateTimeTimezoneMode,
    StringId,
    Strings,
    SymbolField,
    SymbolFieldId,
    SymbolsService,
    assert
} from '@plxtra/motif-core';
import { MarketsNgService, SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import {
    CaptionLabelNgComponent,
    CaptionedCheckboxNgComponent,
    CheckboxInputNgComponent,
    EnumArrayInputNgComponent,
    ExchangeSelectItemNgComponent,
    IntegerCaptionedRadioNgComponent,
    IntegerEnumInputNgComponent,
    IntegerTextInputNgComponent,
    TextInputNgComponent
} from 'controls-ng-api';
import { SettingsComponentBaseNgDirective } from '../../ng/settings-component-base-ng.directive';

@Component({
    selector: 'app-general-settings',
    templateUrl: './general-settings-ng.component.html',
    styleUrls: ['./general-settings-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class GeneralSettingsNgComponent extends SettingsComponentBaseNgDirective implements OnInit, OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    public readonly dateTimeTimezoneModeRadioName: string;
    public readonly generalFieldsetLegend = Strings[StringId.General];
    public readonly symbolsFieldsetLegend = 'Symbols'; //Strings[StringId.Symbols];
    public readonly profileFieldsetLegend = 'Profile'; //Strings[StringId.Profile];
    public readonly requiresRestartText = '(Requires restart)'; //Strings[StringId.RequiresRestart];
    public restartRequired = false;

    private readonly _fontFamilyLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('fontFamilyLabel');
    private readonly _fontFamilyControlComponentSignal = viewChild.required<TextInputNgComponent>('fontFamilyControl');
    private readonly _fontSizeLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('fontSizeLabel');
    private readonly _fontSizeControlComponentSignal = viewChild.required<TextInputNgComponent>('fontSizeControl');
    private readonly _defaultExchangeLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('defaultExchangeLabel');
    private readonly _defaultExchangeControlComponentSignal = viewChild.required<ExchangeSelectItemNgComponent>('defaultExchangeControl');
    private readonly _dropDownEditableSearchTermLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('dropDownEditableSearchTermLabel');
    private readonly _dropDownEditableSearchTermControlComponentSignal = viewChild.required<CheckboxInputNgComponent>('dropDownEditableSearchTermControl');
    private readonly _numberGroupingActiveLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('numberGroupingActiveLabel');
    private readonly _numberGroupingActiveControlComponentSignal = viewChild.required<CheckboxInputNgComponent>('numberGroupingActiveControl');
    private readonly _minimumPriceFractionDigitsCountLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('minimumPriceFractionDigitsCountLabel');
    private readonly _minimumPriceFractionDigitsCountControlComponentSignal = viewChild.required<IntegerTextInputNgComponent>('minimumPriceFractionDigitsCountControl');
    private readonly _24HourLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('24HourLabel');
    private readonly _24HourControlComponentSignal = viewChild.required<CheckboxInputNgComponent>('24HourControl');
    private readonly _dateTimeTimezoneModeLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('dateTimeTimezoneModeLabel');
    private readonly _sourceDateTimeTimezoneModeControlComponentSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('sourceDateTimeTimezoneModeControl');
    private readonly _localDateTimeTimezoneModeControlComponentSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('localDateTimeTimezoneModeControl');
    private readonly _utcDateTimeTimezoneModeControlComponentSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('utcDateTimeTimezoneModeControl');
    private readonly _testSettingsLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('testSettingsLabel');
    private readonly _testSettingsControlComponentSignal = viewChild.required<CheckboxInputNgComponent>('testSettingsControl');
    private readonly _operatorDefaultExchangeEnvironmentSpecificSettingsLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('operatorDefaultExchangeEnvironmentSpecificSettingsLabel');
    private readonly _operatorDefaultExchangeEnvironmentSpecificSettingsControlComponentSignal = viewChild.required<CheckboxInputNgComponent>('operatorDefaultExchangeEnvironmentSpecificSettingsControl');

    private readonly _exchangeHideModeLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('exchangeHideModeLabel');
    private readonly _exchangeHideModeControlComponentSignal = viewChild.required<IntegerEnumInputNgComponent>('exchangeHideModeControl');
    private readonly _defaultMarketHiddenLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('defaultMarketHiddenLabel');
    private readonly _defaultMarketHiddenControlComponentSignal = viewChild.required<CheckboxInputNgComponent>('defaultMarketHiddenControl');
    private readonly _marketCodeAsLocalWheneverPossibleLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('marketCodeAsLocalWheneverPossibleLabel');
    private readonly _marketCodeAsLocalWheneverPossibleControlComponentSignal = viewChild.required<CheckboxInputNgComponent>('marketCodeAsLocalWheneverPossibleControl');
    private readonly _zenithSymbologySupportLevelLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('zenithSymbologySupportLevelLabel');
    private readonly _zenithSymbologySupportLevelControlComponentSignal = viewChild.required<IntegerEnumInputNgComponent>('zenithSymbologySupportLevelControl');

    private readonly _symbol_ExplicitSearchFieldsLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('symbol_ExplicitSearchFieldsLabel');
    private readonly _symbol_ExplicitSearchFieldsEnabledControlComponentSignal = viewChild.required<CaptionedCheckboxNgComponent>('symbol_ExplicitSearchFieldsEnabledControl');
    private readonly _symbol_ExplicitSearchFieldsControlComponentSignal = viewChild.required<EnumArrayInputNgComponent>('symbol_ExplicitSearchFieldsControl');

    private readonly _masterSettings: MasterSettings;
    private readonly _marketsService: MarketsService;
    private readonly _symbolsService: SymbolsService;

    private readonly _fontFamilyUiAction: StringUiAction;
    private readonly _fontSizeUiAction: StringUiAction;
    private readonly _defaultExchangeUiAction: ExchangeListSelectItemUiAction;
    private readonly _exchangeHideModeUiAction: IntegerListSelectItemUiAction;
    private readonly _defaultMarketHiddenUiAction: BooleanUiAction;
    private readonly _marketCodeAsLocalWheneverPossibleUiAction: BooleanUiAction;
    private readonly _zenithSymbologySupportLevelUiAction: IntegerListSelectItemUiAction;
    private readonly _dropDownEditableSearchTermUiAction: BooleanUiAction;
    private readonly _numberGroupingActiveUiAction: BooleanUiAction;
    private readonly _minimumPriceFractionDigitsCountUiAction: IntegerUiAction;
    private readonly _24HourUiAction: BooleanUiAction;
    private readonly _dateTimeTimezoneModeUiAction: IntegerListSelectItemUiAction;
    private readonly _explicitSymbolSearchFieldsEnabledUiAction: BooleanUiAction;
    private readonly _explicitSymbolSearchFieldsUiAction: IntegerListSelectItemsUiAction;
    private readonly _operatorDefaultExchangeEnvironmentSpecificSettingsUiAction: BooleanUiAction;
    private readonly _testSettingsUiAction: BooleanUiAction;

    private _fontFamilyLabelComponent: CaptionLabelNgComponent;
    private _fontFamilyControlComponent: TextInputNgComponent;
    private _fontSizeLabelComponent: CaptionLabelNgComponent;
    private _fontSizeControlComponent: TextInputNgComponent;
    private _defaultExchangeLabelComponent: CaptionLabelNgComponent;
    private _defaultExchangeControlComponent: ExchangeSelectItemNgComponent;
    private _dropDownEditableSearchTermLabelComponent: CaptionLabelNgComponent;
    private _dropDownEditableSearchTermControlComponent: CheckboxInputNgComponent;
    private _numberGroupingActiveLabelComponent: CaptionLabelNgComponent;
    private _numberGroupingActiveControlComponent: CheckboxInputNgComponent;
    private _minimumPriceFractionDigitsCountLabelComponent: CaptionLabelNgComponent;
    private _minimumPriceFractionDigitsCountControlComponent: IntegerTextInputNgComponent;
    private _24HourLabelComponent: CaptionLabelNgComponent;
    private _24HourControlComponent: CheckboxInputNgComponent;
    private _dateTimeTimezoneModeLabelComponent: CaptionLabelNgComponent;
    private _sourceDateTimeTimezoneModeControlComponent: IntegerCaptionedRadioNgComponent;
    private _localDateTimeTimezoneModeControlComponent: IntegerCaptionedRadioNgComponent;
    private _utcDateTimeTimezoneModeControlComponent: IntegerCaptionedRadioNgComponent;
    private _testSettingsLabelComponent: CaptionLabelNgComponent;
    private _testSettingsControlComponent: CheckboxInputNgComponent;
    private _operatorDefaultExchangeEnvironmentSpecificSettingsLabelComponent: CaptionLabelNgComponent;
    private _operatorDefaultExchangeEnvironmentSpecificSettingsControlComponent: CheckboxInputNgComponent;

    private _exchangeHideModeLabelComponent: CaptionLabelNgComponent;
    private _exchangeHideModeControlComponent: IntegerEnumInputNgComponent;
    private _defaultMarketHiddenLabelComponent: CaptionLabelNgComponent;
    private _defaultMarketHiddenControlComponent: CheckboxInputNgComponent;
    private _marketCodeAsLocalWheneverPossibleLabelComponent: CaptionLabelNgComponent;
    private _marketCodeAsLocalWheneverPossibleControlComponent: CheckboxInputNgComponent;
    private _zenithSymbologySupportLevelLabelComponent: CaptionLabelNgComponent;
    private _zenithSymbologySupportLevelControlComponent: IntegerEnumInputNgComponent;

    private _symbol_ExplicitSearchFieldsLabelComponent: CaptionLabelNgComponent;
    private _symbol_ExplicitSearchFieldsEnabledControlComponent: CaptionedCheckboxNgComponent;
    private _symbol_ExplicitSearchFieldsControlComponent: EnumArrayInputNgComponent;

    private _marketSettingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        marketsNgService: MarketsNgService,
        symbolsNgService: SymbolsNgService,
    ) {
        super(elRef, ++GeneralSettingsNgComponent.typeInstanceCreateCount, cdr, settingsNgService.service);
        this._masterSettings = settingsNgService.service.master;
        this._marketsService = marketsNgService.service;
        this._symbolsService = symbolsNgService.service;

        this.dateTimeTimezoneModeRadioName = this.generateInstancedRadioName('dateTimeTimezoneMode');

        this._fontFamilyUiAction = this.createFontFamilyUiAction();
        this._fontSizeUiAction = this.createFontSizeUiAction();
        this._defaultExchangeUiAction = this.createDefaultExchangeUiAction();
        this._exchangeHideModeUiAction = this.createExchangeHideModeUiAction();
        this._defaultMarketHiddenUiAction = this.createDefaultMarketHiddenUiAction();
        this._marketCodeAsLocalWheneverPossibleUiAction = this.createMarketCodeAsLocalWheneverPossibleUiAction();
        this._zenithSymbologySupportLevelUiAction = this.createZenithSymbologySupportLevelUiAction();
        this._dropDownEditableSearchTermUiAction = this.createDropDownEditableSearchTermUiAction();
        this._numberGroupingActiveUiAction = this.createNumberGroupingActiveUiAction();
        this._minimumPriceFractionDigitsCountUiAction = this.createMinimumPriceFractionDigitsCountUiAction();
        this._24HourUiAction = this.create24HourUiAction();
        this._dateTimeTimezoneModeUiAction = this.createDateTimeTimezoneModeUiAction();
        this._explicitSymbolSearchFieldsEnabledUiAction = this.createExplicitSymbolSearchFieldsEnabledUiAction();
        this._explicitSymbolSearchFieldsUiAction = this.createExplicitSymbolSearchFieldsUiAction();
        this._operatorDefaultExchangeEnvironmentSpecificSettingsUiAction = this.createOperatorDefaultExchangeEnvironmentSpecificSettingsUiAction();
        this._testSettingsUiAction = this.createTestSettingsUiAction();

        this._marketSettingsChangedSubscriptionId = this.settingsService.subscribeMasterSettingsChangedEvent(() => {
            if (this.settingsService.restartRequired) {
                this.restartRequired = true;
            }
        })

        this.processSettingsChanged();
    }

    ngOnInit() {
        this.pushValues();
    }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._fontFamilyLabelComponent = this._fontFamilyLabelComponentSignal();
        this._fontFamilyControlComponent = this._fontFamilyControlComponentSignal();
        this._fontSizeLabelComponent = this._fontSizeLabelComponentSignal();
        this._fontSizeControlComponent = this._fontSizeControlComponentSignal();
        this._defaultExchangeLabelComponent = this._defaultExchangeLabelComponentSignal();
        this._defaultExchangeControlComponent = this._defaultExchangeControlComponentSignal();
        this._dropDownEditableSearchTermLabelComponent = this._dropDownEditableSearchTermLabelComponentSignal();
        this._dropDownEditableSearchTermControlComponent = this._dropDownEditableSearchTermControlComponentSignal();
        this._numberGroupingActiveLabelComponent = this._numberGroupingActiveLabelComponentSignal();
        this._numberGroupingActiveControlComponent = this._numberGroupingActiveControlComponentSignal();
        this._minimumPriceFractionDigitsCountLabelComponent = this._minimumPriceFractionDigitsCountLabelComponentSignal();
        this._minimumPriceFractionDigitsCountControlComponent = this._minimumPriceFractionDigitsCountControlComponentSignal();
        this._24HourLabelComponent = this._24HourLabelComponentSignal();
        this._24HourControlComponent = this._24HourControlComponentSignal();
        this._dateTimeTimezoneModeLabelComponent = this._dateTimeTimezoneModeLabelComponentSignal();
        this._sourceDateTimeTimezoneModeControlComponent = this._sourceDateTimeTimezoneModeControlComponentSignal();
        this._localDateTimeTimezoneModeControlComponent = this._localDateTimeTimezoneModeControlComponentSignal();
        this._utcDateTimeTimezoneModeControlComponent = this._utcDateTimeTimezoneModeControlComponentSignal();
        this._testSettingsLabelComponent = this._testSettingsLabelComponentSignal();
        this._testSettingsControlComponent = this._testSettingsControlComponentSignal();
        this._operatorDefaultExchangeEnvironmentSpecificSettingsLabelComponent = this._operatorDefaultExchangeEnvironmentSpecificSettingsLabelComponentSignal();
        this._operatorDefaultExchangeEnvironmentSpecificSettingsControlComponent = this._operatorDefaultExchangeEnvironmentSpecificSettingsControlComponentSignal();
        this._exchangeHideModeLabelComponent = this._exchangeHideModeLabelComponentSignal();
        this._exchangeHideModeControlComponent = this._exchangeHideModeControlComponentSignal();
        this._defaultMarketHiddenLabelComponent = this._defaultMarketHiddenLabelComponentSignal();
        this._defaultMarketHiddenControlComponent = this._defaultMarketHiddenControlComponentSignal();
        this._marketCodeAsLocalWheneverPossibleLabelComponent = this._marketCodeAsLocalWheneverPossibleLabelComponentSignal();
        this._marketCodeAsLocalWheneverPossibleControlComponent = this._marketCodeAsLocalWheneverPossibleControlComponentSignal();
        this._zenithSymbologySupportLevelLabelComponent = this._zenithSymbologySupportLevelLabelComponentSignal();
        this._zenithSymbologySupportLevelControlComponent = this._zenithSymbologySupportLevelControlComponentSignal();
        this._symbol_ExplicitSearchFieldsLabelComponent = this._symbol_ExplicitSearchFieldsLabelComponentSignal();
        this._symbol_ExplicitSearchFieldsEnabledControlComponent = this._symbol_ExplicitSearchFieldsEnabledControlComponentSignal();
        this._symbol_ExplicitSearchFieldsControlComponent = this._symbol_ExplicitSearchFieldsControlComponentSignal();

        delay1Tick(() => {
            this.initialiseComponents();
            this.markForCheck();
        });
    }

    protected processSettingsChanged() {
        this.pushValues();
    }

    protected override finalise() {
        this.settingsService.unsubscribeMasterSettingsChangedEvent(this._marketSettingsChangedSubscriptionId);
        this._marketSettingsChangedSubscriptionId = undefined;

        this._fontFamilyUiAction.finalise();
        this._fontSizeUiAction.finalise();
        this._defaultExchangeUiAction.finalise();
        this._exchangeHideModeUiAction.finalise();
        this._defaultMarketHiddenUiAction.finalise();
        this._marketCodeAsLocalWheneverPossibleUiAction.finalise();
        this._zenithSymbologySupportLevelUiAction.finalise();
        this._dropDownEditableSearchTermUiAction.finalise();
        this._numberGroupingActiveUiAction.finalise();
        this._minimumPriceFractionDigitsCountUiAction.finalise();
        this._24HourUiAction.finalise();
        this._dateTimeTimezoneModeUiAction.finalise();
        this._explicitSymbolSearchFieldsEnabledUiAction.finalise();
        this._explicitSymbolSearchFieldsUiAction.finalise();
        this._operatorDefaultExchangeEnvironmentSpecificSettingsUiAction.finalise();
        this._testSettingsUiAction.finalise();
        super.finalise();
    }

    private createFontFamilyUiAction() {
        const action = new StringUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_FontFamily]);
        action.pushTitle(Strings[StringId.SettingTitle_FontFamily]);
        action.commitEvent = () => {
            this.userSettings.fontFamily = this._fontFamilyUiAction.definedValue;
        };
        return action;
    }

    private createFontSizeUiAction() {
        const action = new StringUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_FontSize]);
        action.pushTitle(Strings[StringId.SettingTitle_FontSize]);
        action.commitEvent = () => {
            this.userSettings.fontSize = this._fontSizeUiAction.definedValue;
        };
        return action;
    }

    private createDefaultExchangeUiAction() {
        const action = new ExchangeListSelectItemUiAction(this._marketsService);
        action.pushCaption(Strings[StringId.SettingCaption_Symbol_DefaultExchange]);
        action.pushTitle(Strings[StringId.SettingTitle_Symbol_DefaultExchange]);
        action.commitEvent = () => {
            this._symbolsService.defaultExchange = this._defaultExchangeUiAction.definedValue;
        };
        return action;
    }

    private createExchangeHideModeUiAction() {
        const action = new IntegerListSelectItemUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Symbol_ExchangeHideMode]);
        action.pushTitle(Strings[StringId.SettingTitle_Symbol_ExchangeHideMode]);
        const modeIds = SymbolsService.ExchangeHideMode.getAll();
        const list = modeIds.map<IntegerListSelectItemUiAction.ItemProperties>(
            (modeId) => (
                {
                    item: modeId,
                    caption: SymbolsService.ExchangeHideMode.idToDisplay(modeId),
                    title: SymbolsService.ExchangeHideMode.idToDescription(modeId),
                }
            )
        );
        action.pushList(list, undefined);
        action.commitEvent = () => {
            this._symbolsService.pscExchangeHideModeId = this._exchangeHideModeUiAction.definedValue;
        };
        return action;
    }

    private createDefaultMarketHiddenUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Symbol_DefaultMarketHidden]);
        action.pushTitle(Strings[StringId.SettingTitle_Symbol_DefaultMarketHidden]);
        action.commitEvent = () => {
            this._symbolsService.pscDefaultMarketHidden = this._defaultMarketHiddenUiAction.definedValue;
        };
        return action;
    }

    private createMarketCodeAsLocalWheneverPossibleUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Symbol_MarketCodeAsLocalWheneverPossible]);
        action.pushTitle(Strings[StringId.SettingTitle_Symbol_MarketCodeAsLocalWheneverPossible]);
        action.commitEvent = () => {
            this._symbolsService.pscMarketCodeAsLocalWheneverPossible = this._marketCodeAsLocalWheneverPossibleUiAction.definedValue;
        };
        return action;
    }

    private createZenithSymbologySupportLevelUiAction() {
        const action = new IntegerListSelectItemUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Symbol_ZenithSymbologySupportLevel]);
        action.pushTitle(Strings[StringId.SettingTitle_Symbol_ZenithSymbologySupportLevel]);
        const levelIds = SymbolsService.ZenithSymbologySupportLevel.getAll();
        const list = levelIds.map<IntegerListSelectItemUiAction.ItemProperties>(
            (levelId) => (
                {
                    item: levelId,
                    caption: SymbolsService.ZenithSymbologySupportLevel.idToDisplay(levelId),
                    title: SymbolsService.ZenithSymbologySupportLevel.idToDescription(levelId),
                }
            )
        );
        action.pushList(list, undefined);
        action.commitEvent = () => {
            this._symbolsService.zenithSymbologySupportLevelId = this._zenithSymbologySupportLevelUiAction.definedValue;
        };
        return action;
    }

    private createDropDownEditableSearchTermUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Control_DropDownEditableSearchTerm]);
        action.pushTitle(Strings[StringId.SettingTitle_Control_DropDownEditableSearchTerm]);
        action.commitEvent = () => {
            this.userSettings.control_DropDownEditableSearchTerm = this._dropDownEditableSearchTermUiAction.definedValue;
        };
        return action;
    }

    private createNumberGroupingActiveUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Format_NumberGroupingActive]);
        action.pushTitle(Strings[StringId.SettingTitle_Format_NumberGroupingActive]);
        action.commitEvent = () => {
            this.userSettings.format_NumberGroupingActive = this._numberGroupingActiveUiAction.definedValue;
        };
        return action;
    }

    private createMinimumPriceFractionDigitsCountUiAction() {
        const action = new IntegerUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Format_MinimumPriceFractionDigitsCount]);
        action.pushTitle(Strings[StringId.SettingTitle_Format_MinimumPriceFractionDigitsCount]);
        action.commitEvent = () => {
            this.userSettings.format_MinimumPriceFractionDigitsCount = this._minimumPriceFractionDigitsCountUiAction.definedValue;
        };
        return action;
    }

    private create24HourUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Format_24Hour]);
        action.pushTitle(Strings[StringId.SettingTitle_Format_24Hour]);
        action.commitEvent = () => {
            this.userSettings.format_24Hour = this._24HourUiAction.definedValue;
        };
        return action;
    }

    private createDateTimeTimezoneModeUiAction() {
        const action = new IntegerListSelectItemUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Format_DateTimeTimezoneModeId]);
        action.pushTitle(Strings[StringId.SettingTitle_Format_DateTimeTimezoneModeId]);
        const modeIds = SourceTzOffsetDateTimeTimezoneMode.allIds;
        const list = modeIds.map<IntegerListSelectItemUiAction.ItemProperties>(
            (modeId) => (
                {
                    item: modeId,
                    caption: SourceTzOffsetDateTimeTimezoneMode.idToDisplay(modeId),
                    title: SourceTzOffsetDateTimeTimezoneMode.idToDescription(modeId),
                }
            )
        );
        action.pushList(list, undefined);
        action.commitEvent = () => {
            this.userSettings.format_DateTimeTimezoneModeId = this._dateTimeTimezoneModeUiAction.definedValue;
        };
        return action;
    }

    private createExplicitSymbolSearchFieldsEnabledUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Symbol_ExplicitSearchFieldsEnabled]);
        action.pushTitle(Strings[StringId.SettingTitle_Symbol_ExplicitSearchFieldsEnabled]);
        action.commitEvent = () => {
            this._symbolsService.explicitSearchFieldsEnabled = this._explicitSymbolSearchFieldsEnabledUiAction.definedValue;
            this.updateExplicitSearchFieldsUiActionEnabled();
        };
        return action;
    }

    private createExplicitSymbolSearchFieldsUiAction() {
        const action = new IntegerListSelectItemsUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Symbol_ExplicitSearchFields]);
        action.pushTitle(Strings[StringId.SettingTitle_Symbol_ExplicitSearchFields]);

        const allowableSymbolSearchFieldIds = SymbolField.allIds;
        const entryCount = allowableSymbolSearchFieldIds.length;
        const list = new Array<SelectItemsUiAction.ItemProperties<SymbolFieldId>>(entryCount);
        for (let i = 0; i < entryCount; i++) {
            const id = allowableSymbolSearchFieldIds[i];
            list[i] = {
                item: id,
                caption: SymbolField.idToDisplay(id),
                title: SymbolField.idToDescription(id),
            };
        }

        action.pushList(list, undefined);
        action.commitEvent = () => {
            this._symbolsService.explicitSearchFieldIds = this._explicitSymbolSearchFieldsUiAction.definedValue as SymbolFieldId[];
        };
        return action;
    }

    private createTestSettingsUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Master_Test]);
        action.pushTitle(Strings[StringId.SettingTitle_Master_Test]);
        action.commitEvent = () => {
            this._masterSettings.test = this._testSettingsUiAction.definedValue;
        };
        return action;
    }

    private createOperatorDefaultExchangeEnvironmentSpecificSettingsUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Master_OperatorDefaultExchangeEnvironmentSpecific]);
        action.pushTitle(Strings[StringId.SettingTitle_Master_OperatorDefaultExchangeEnvironmentSpecific]);
        action.commitEvent = () => {
            this._masterSettings.operatorDefaultExchangeEnvironmentSpecific = this._operatorDefaultExchangeEnvironmentSpecificSettingsUiAction.definedValue;
        };
        return action;
    }

    private initialiseComponents() {
        this._fontFamilyLabelComponent.initialise(this._fontFamilyUiAction);
        this._fontFamilyControlComponent.initialise(this._fontFamilyUiAction);
        this._fontSizeLabelComponent.initialise(this._fontSizeUiAction);
        this._fontSizeControlComponent.initialise(this._fontSizeUiAction);
        this._defaultExchangeLabelComponent.initialise(this._defaultExchangeUiAction);
        this._defaultExchangeControlComponent.initialise(this._defaultExchangeUiAction);
        this._exchangeHideModeLabelComponent.initialise(this._exchangeHideModeUiAction);
        this._exchangeHideModeControlComponent.initialise(this._exchangeHideModeUiAction);
        this._defaultMarketHiddenLabelComponent.initialise(this._defaultMarketHiddenUiAction);
        this._defaultMarketHiddenControlComponent.initialise(this._defaultMarketHiddenUiAction);
        this._marketCodeAsLocalWheneverPossibleLabelComponent.initialise(this._marketCodeAsLocalWheneverPossibleUiAction);
        this._marketCodeAsLocalWheneverPossibleControlComponent.initialise(this._marketCodeAsLocalWheneverPossibleUiAction);
        this._zenithSymbologySupportLevelLabelComponent.initialise(this._zenithSymbologySupportLevelUiAction);
        this._zenithSymbologySupportLevelControlComponent.initialise(this._zenithSymbologySupportLevelUiAction);
        this._dropDownEditableSearchTermLabelComponent.initialise(this._dropDownEditableSearchTermUiAction);
        this._dropDownEditableSearchTermControlComponent.initialise(this._dropDownEditableSearchTermUiAction);
        this._numberGroupingActiveLabelComponent.initialise(this._numberGroupingActiveUiAction);
        this._numberGroupingActiveControlComponent.initialise(this._numberGroupingActiveUiAction);
        this._minimumPriceFractionDigitsCountLabelComponent.initialise(this._minimumPriceFractionDigitsCountUiAction);
        this._minimumPriceFractionDigitsCountControlComponent.initialise(this._minimumPriceFractionDigitsCountUiAction);
        this._24HourLabelComponent.initialise(this._24HourUiAction);
        this._24HourControlComponent.initialise(this._24HourUiAction);
        this._dateTimeTimezoneModeLabelComponent.initialise(this._dateTimeTimezoneModeUiAction);
        this._sourceDateTimeTimezoneModeControlComponent.initialiseEnum(this._dateTimeTimezoneModeUiAction,
            SourceTzOffsetDateTime.TimezoneModeId.Source);
        this._localDateTimeTimezoneModeControlComponent.initialiseEnum(this._dateTimeTimezoneModeUiAction,
            SourceTzOffsetDateTime.TimezoneModeId.Local);
        this._utcDateTimeTimezoneModeControlComponent.initialiseEnum(this._dateTimeTimezoneModeUiAction,
            SourceTzOffsetDateTime.TimezoneModeId.Utc);
        this._symbol_ExplicitSearchFieldsLabelComponent.initialise(this._explicitSymbolSearchFieldsUiAction);
        this._symbol_ExplicitSearchFieldsEnabledControlComponent.initialise(this._explicitSymbolSearchFieldsEnabledUiAction);
        this._symbol_ExplicitSearchFieldsControlComponent.initialise(this._explicitSymbolSearchFieldsUiAction);
        this._testSettingsLabelComponent.initialise(this._testSettingsUiAction);
        this._testSettingsControlComponent.initialise(this._testSettingsUiAction);
        this._operatorDefaultExchangeEnvironmentSpecificSettingsLabelComponent.initialise(this._operatorDefaultExchangeEnvironmentSpecificSettingsUiAction);
        this._operatorDefaultExchangeEnvironmentSpecificSettingsControlComponent.initialise(this._operatorDefaultExchangeEnvironmentSpecificSettingsUiAction);
    }

    private pushValues() {
        this._fontFamilyUiAction.pushValue(this.userSettings.fontFamily);
        this._fontSizeUiAction.pushValue(this.userSettings.fontSize);
        this._defaultExchangeUiAction.pushValue(this._symbolsService.defaultExchange);
        this._exchangeHideModeUiAction.pushValue(this._symbolsService.pscExchangeHideModeId);
        this._defaultMarketHiddenUiAction.pushValue(this._symbolsService.pscDefaultMarketHidden);
        this._marketCodeAsLocalWheneverPossibleUiAction.pushValue(this._symbolsService.pscMarketCodeAsLocalWheneverPossible);
        this._zenithSymbologySupportLevelUiAction.pushValue(this._symbolsService.zenithSymbologySupportLevelId);
        this._dropDownEditableSearchTermUiAction.pushValue(this.userSettings.control_DropDownEditableSearchTerm);
        this._numberGroupingActiveUiAction.pushValue(this.userSettings.format_NumberGroupingActive);
        this._minimumPriceFractionDigitsCountUiAction.pushValue(this.userSettings.format_MinimumPriceFractionDigitsCount);
        this._24HourUiAction.pushValue(this.userSettings.format_24Hour);
        this._dateTimeTimezoneModeUiAction.pushValue(this.userSettings.format_DateTimeTimezoneModeId);
        this._explicitSymbolSearchFieldsEnabledUiAction.pushValue(this._symbolsService.explicitSearchFieldsEnabled);
        this._explicitSymbolSearchFieldsUiAction.pushValue(this._symbolsService.explicitSearchFieldIds);
        this.updateExplicitSearchFieldsUiActionEnabled();
        this._testSettingsUiAction.pushValue(this._masterSettings.test);
        this._operatorDefaultExchangeEnvironmentSpecificSettingsUiAction.pushValue(this._masterSettings.operatorDefaultExchangeEnvironmentSpecific);

        if (this.settingsService.restartRequired !== this.restartRequired) {
            this.restartRequired = this.settingsService.restartRequired;
            this.markForCheck();
        }
    }

    private updateExplicitSearchFieldsUiActionEnabled() {
        const enabled = this._explicitSymbolSearchFieldsEnabledUiAction.definedValue;
        if (enabled) {
            this._explicitSymbolSearchFieldsUiAction.pushAccepted();
        } else {
            this._explicitSymbolSearchFieldsUiAction.pushDisabled();
        }
    }
}

export namespace GeneralSettingsNgComponent {

    export function create(container: ViewContainerRef) {
        container.clear();
        const componentRef = container.createComponent(GeneralSettingsNgComponent);
        assert(componentRef.instance instanceof GeneralSettingsNgComponent, 'ASCC2288532');
        return componentRef.instance;
    }
}
