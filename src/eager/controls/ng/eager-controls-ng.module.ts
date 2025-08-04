import { CommonModule } from '@angular/common';
import { NgModule, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectConfig, NgSelectModule } from '@ng-select/ng-select';
import { AngularSvgIconModule, SvgIconRegistryService } from 'angular-svg-icon';
import { SettingsNgService } from 'component-services-ng-api';
import {
    ButtonInputNgComponent,
    CaptionedCheckboxNgComponent,
    CheckboxInputNgComponent,
    SvgButtonNgComponent
} from '../boolean/ng-api';
import { BrokerageAccountGroupInputNgComponent, BrokerageAccountGroupNameLabelNgComponent } from '../brokerage-account-group/ng-api';
import { CommandBarNgComponent, CommandSelectNgComponent } from '../command/ng-api';
import { DataMarketInputNgComponent } from '../data-market/ng-api';
import { DateInputNgComponent } from '../date/ng-api';
import { DecimalInputNgComponent } from '../decimal/ng-api';
import {
    DataMarketCaptionedItemsCheckboxNgComponent,
    DataMarketSelectItemsNgComponent,
    EnumArrayCheckboxNgComponent,
    EnumArrayElementCaptionNgComponent,
    EnumArrayInputNgComponent,
    IntegerCaptionedItemsCheckboxNgComponent,
} from '../enum-array/ng-api';
import {
    EnumElementCaptionNgComponent,
    ExchangeCaptionedRadioNgComponent,
    ExchangeSelectItemNgComponent,
    IntegerCaptionedRadioNgComponent,
    IntegerEnumCaptionNgComponent,
    IntegerEnumInputNgComponent,
    RadioInputNgComponent
} from '../enum/ng-api';
import { IvemIdInputNgComponent } from '../ivem-id/ng-api';
import { CaptionLabelNgComponent } from '../label/ng-api';
import {
    DataIvemIdInputNgComponent,
    DataIvemIdNameLabelNgComponent,
    DataIvemIdSelectNgComponent,
    TradingIvemIdInputNgComponent,
    TradingIvemIdNameLabelNgComponent,
    TradingIvemIdSelectNgComponent,
} from '../market-ivem-id/ng-api';
import {
    MenuBarOverlayChildItemNgComponent,
    MenuBarOverlayCommandItemNgComponent,
    MenuBarOverlayDividerItemNgComponent,
    MenuBarOverlayMenuNgComponent,
    MenuBarOverlayNgComponent,
    MenuBarRootChildItemNgComponent,
    MenuBarRootCommandItemNgComponent,
    MenuBarRootDividerItemNgComponent,
    MenuBarRootMenuNgComponent
} from '../menu-bar/ng-api';
import { NgSelectUtilsModule } from '../ng-select-utils';
import { IntegerLabelNgComponent, IntegerTextInputNgComponent, NumberInputNgComponent } from '../number/ng-api';
import { StaticInitialise } from '../static-initialise';
import {
    StringArrayInputNgComponent
} from '../string-array/ng-api';
import { TextInputNgComponent } from '../string/ng-api';
import { TabListNgComponent } from '../tab-list/ng-api';
import { TradingMarketInputNgComponent } from '../trading-market/ng-api';

@NgModule({
    declarations: [
        BrokerageAccountGroupInputNgComponent,
        BrokerageAccountGroupNameLabelNgComponent,
        ButtonInputNgComponent,
        CaptionedCheckboxNgComponent,
        IntegerCaptionedItemsCheckboxNgComponent,
        ExchangeCaptionedRadioNgComponent,
        IntegerCaptionedRadioNgComponent,
        CaptionLabelNgComponent,
        CheckboxInputNgComponent,
        CommandBarNgComponent,
        CommandSelectNgComponent,
        DataMarketInputNgComponent,
        DateInputNgComponent,
        DecimalInputNgComponent,
        EnumArrayCheckboxNgComponent,
        EnumArrayElementCaptionNgComponent,
        EnumArrayInputNgComponent,
        EnumElementCaptionNgComponent,
        ExchangeSelectItemNgComponent,
        IntegerEnumCaptionNgComponent,
        IntegerEnumInputNgComponent,
        IntegerLabelNgComponent,
        IntegerTextInputNgComponent,
        IvemIdInputNgComponent,
        DataIvemIdInputNgComponent,
        DataIvemIdNameLabelNgComponent,
        DataIvemIdSelectNgComponent,
        DataMarketCaptionedItemsCheckboxNgComponent,
        DataMarketSelectItemsNgComponent,
        MenuBarOverlayChildItemNgComponent,
        MenuBarOverlayCommandItemNgComponent,
        MenuBarOverlayDividerItemNgComponent,
        MenuBarOverlayMenuNgComponent,
        MenuBarOverlayNgComponent,
        MenuBarRootChildItemNgComponent,
        MenuBarRootCommandItemNgComponent,
        MenuBarRootDividerItemNgComponent,
        MenuBarRootMenuNgComponent,
        NumberInputNgComponent,
        TradingMarketInputNgComponent,
        RadioInputNgComponent,
        StringArrayInputNgComponent,
        SvgButtonNgComponent,
        TabListNgComponent,
        TextInputNgComponent,
        TradingIvemIdInputNgComponent,
        TradingIvemIdNameLabelNgComponent,
        TradingIvemIdSelectNgComponent,
    ],
    imports: [
        AngularSvgIconModule,
        CommonModule,
        FormsModule,
        NgSelectModule,
    ],
    exports: [
        BrokerageAccountGroupInputNgComponent,
        BrokerageAccountGroupNameLabelNgComponent,
        ButtonInputNgComponent,
        CaptionedCheckboxNgComponent,
        CaptionLabelNgComponent,
        CheckboxInputNgComponent,
        CommandBarNgComponent,
        CommandSelectNgComponent,
        DataMarketInputNgComponent,
        DateInputNgComponent,
        DecimalInputNgComponent,
        EnumArrayCheckboxNgComponent,
        EnumArrayElementCaptionNgComponent,
        EnumArrayInputNgComponent,
        EnumElementCaptionNgComponent,
        ExchangeCaptionedRadioNgComponent,
        ExchangeSelectItemNgComponent,
        IntegerCaptionedItemsCheckboxNgComponent,
        IntegerCaptionedRadioNgComponent,
        IntegerEnumCaptionNgComponent,
        IntegerEnumInputNgComponent,
        IntegerLabelNgComponent,
        IntegerTextInputNgComponent,
        IvemIdInputNgComponent,
        DataIvemIdInputNgComponent,
        DataIvemIdNameLabelNgComponent,
        DataIvemIdSelectNgComponent,
        DataMarketCaptionedItemsCheckboxNgComponent,
        DataMarketSelectItemsNgComponent,
        MenuBarOverlayNgComponent,
        MenuBarRootMenuNgComponent,
        NumberInputNgComponent,
        TradingMarketInputNgComponent,
        RadioInputNgComponent,
        StringArrayInputNgComponent,
        SvgButtonNgComponent,
        TabListNgComponent,
        TextInputNgComponent,
        TradingIvemIdInputNgComponent,
        TradingIvemIdNameLabelNgComponent,
        TradingIvemIdSelectNgComponent,
    ]
})

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class EagerControlsNgModule {
    constructor() {
        const ngSelectConfig = inject(NgSelectConfig);
        const settingsNgService = inject(SettingsNgService);
        const svgIconRegistryService = inject(SvgIconRegistryService);

        ngSelectConfig.appendTo = '.paritechMotifNgSelectOverlay';
        NgSelectUtilsModule.setColorSettings(settingsNgService.service.color);

        StaticInitialise.initialise(svgIconRegistryService);
    }
}
