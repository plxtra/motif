import { AfterViewInit, ChangeDetectionStrategy, Component, inject, input, OnDestroy, viewChild } from '@angular/core';
import { delay1Tick, MultiEvent } from '@pbkware/js-utils';
import { IntegerListSelectItemsUiAction, IntegerListSelectItemUiAction } from '@pbkware/ui-action';
import {
    Exchange,
    ExchangeSettings,
    SettingsService, StringId, Strings, SymbolField, SymbolFieldId
} from '@plxtra/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { CaptionLabelNgComponent, EnumArrayInputNgComponent, IntegerEnumInputNgComponent } from 'controls-ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-exchange-settings',
    templateUrl: './exchange-settings-ng.component.html',
    styleUrls: ['./exchange-settings-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ExchangeSettingsNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    readonly settings = input.required<ExchangeSettings>();

    public abbreviatedExchangeDisplay: string;
    public fullExchangeDisplay: string;

    private readonly _symbolNameFieldLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('symbolNameFieldLabel');
    private readonly _symbolNameFieldControlComponentSignal = viewChild.required<IntegerEnumInputNgComponent>('symbolNameFieldControl');
    private readonly _symbolSearchFieldsLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('symbolSearchFieldsLabel');
    private readonly _symbolSearchFieldsControlComponentSignal = viewChild.required<EnumArrayInputNgComponent>('symbolSearchFieldsControl');

    private _symbolNameFieldLabelComponent: CaptionLabelNgComponent;
    private _symbolNameFieldControlComponent: IntegerEnumInputNgComponent;
    private _symbolSearchFieldsLabelComponent: CaptionLabelNgComponent;
    private _symbolSearchFieldsControlComponent: EnumArrayInputNgComponent;

    private readonly _settingsService: SettingsService;
    private readonly _settingsChangedSubsciptionId: MultiEvent.SubscriptionId;

    private _symbolNameFieldUiAction: IntegerListSelectItemUiAction;
    private _symbolSearchFieldsUiAction: IntegerListSelectItemsUiAction;

    private _exchange: Exchange;
    private _exchangeSettings: ExchangeSettings;

    constructor() {
        const settingsNgService = inject(SettingsNgService);

        super(++ExchangeSettingsNgComponent.typeInstanceCreateCount);

        this._settingsService = settingsNgService.service;
        this._settingsChangedSubsciptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.handleSettingsChangedEvent());
    }

    ngOnDestroy() {
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubsciptionId);
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._symbolNameFieldLabelComponent = this._symbolNameFieldLabelComponentSignal();
        this._symbolNameFieldControlComponent = this._symbolNameFieldControlComponentSignal();
        this._symbolSearchFieldsLabelComponent = this._symbolSearchFieldsLabelComponentSignal();
        this._symbolSearchFieldsControlComponent = this._symbolSearchFieldsControlComponentSignal();
        this._exchangeSettings = this.settings();

        delay1Tick(() => {
            this._exchange = this._exchangeSettings.exchange;

            this.abbreviatedExchangeDisplay = this._exchange.abbreviatedDisplay;
            this.fullExchangeDisplay = this._exchange.fullDisplay;

            this._symbolNameFieldUiAction = this.createSymbolNameFieldUiAction();
            this._symbolSearchFieldsUiAction = this.createSymbolSearchFieldsUiAction();

            this.pushValues();

            this.initialise();
        });
    }

    private handleSettingsChangedEvent() {
        this.pushValues();
    }

    private createSymbolNameFieldUiAction() {
        const action = new IntegerListSelectItemUiAction();
        action.autoEchoCommit = false;
        action.pushCaption(Strings[StringId.SettingCaption_Exchange_SymbolNameField]);
        action.pushTitle(Strings[StringId.SettingTitle_Exchange_SymbolNameField]);
        const settings = this._exchangeSettings;
        const fieldIds = settings.symbolSearchFieldIds;
        const list = fieldIds.map<IntegerListSelectItemUiAction.ItemProperties>(
            (fieldId) => (
                {
                    item: fieldId,
                    caption: SymbolField.idToDisplay(fieldId),
                    title: SymbolField.idToDescription(fieldId),
                }
            )
        );
        action.pushList(list, undefined);
        action.commitEvent = () => {
            settings.symbolNameFieldId = this._symbolNameFieldUiAction.definedValue;
        };
        return action;
    }

    private createSymbolSearchFieldsUiAction() {
        const action = new IntegerListSelectItemsUiAction();
        action.autoEchoCommit = false;
        action.pushTitle(Strings[StringId.SettingTitle_Exchange_SymbolSearchFields]);
        action.pushCaption(Strings[StringId.SettingCaption_Exchange_SymbolSearchFields]);
        const settings = this._exchangeSettings;
        const symbolSearchFieldIds = settings.symbolSearchFieldIds;
        const entryCount = symbolSearchFieldIds.length;
        const list = new Array<IntegerListSelectItemsUiAction.ItemProperties>(entryCount);
        for (let i = 0; i < entryCount; i++) {
            const id = symbolSearchFieldIds[i];
            list[i] = {
                item: id,
                caption: SymbolField.idToDisplay(id),
                title: SymbolField.idToDescription(id),
            };
        }

        action.pushList(list, undefined);
        action.commitEvent = () => {
            settings.symbolSearchFieldIds = this._symbolSearchFieldsUiAction.definedValue as SymbolFieldId[];
        };
        return action;
    }

    private initialise() {
        this._symbolNameFieldLabelComponent.initialise(this._symbolNameFieldUiAction);
        this._symbolNameFieldControlComponent.initialise(this._symbolNameFieldUiAction);
        this._symbolSearchFieldsLabelComponent.initialise(this._symbolSearchFieldsUiAction);
        this._symbolSearchFieldsControlComponent.initialise(this._symbolSearchFieldsUiAction);
    }

    private finalise() {
        this._symbolNameFieldUiAction.finalise();
        this._symbolSearchFieldsUiAction.finalise();
    }

    private pushValues() {
        const settings = this._exchangeSettings;
        this._symbolNameFieldUiAction.pushValue(settings.symbolNameFieldId);
        this._symbolSearchFieldsUiAction.pushValue(settings.symbolSearchFieldIds);
    }
}
