import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, Inject, OnDestroy } from '@angular/core';
import { AssertInternalError, MultiEvent } from '@pbkware/js-utils';
import {
    ColorScheme,
    OrderPad,
    OrderRequestDataDefinition,
    OrderTradeTypeId,
    SettingsService, StringId,
    Strings
} from '@plxtra/motif-core';
import { SettingsNgService, SymbolsNgService, TextFormatterNgService } from 'component-services-ng-api';
import { ReviewOrderRequestComponentNgDirective } from '../../ng/review-order-request-component-ng.directive';

@Component({
    selector: 'app-review-cancel-order-request',
    templateUrl: './review-cancel-order-request-ng.component.html',
    styleUrls: ['./review-cancel-order-request-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ReviewCancelOrderRequestNgComponent extends ReviewOrderRequestComponentNgDirective implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    @HostBinding('style.--color-grid-base-bkgd') gridBkgdColor: string;
    @HostBinding('style.--color-grid-base-alt-bkgd') gridAltBkgdColor: string;
    @HostBinding('style.--color-grid-order-side') gridOrderSideColor: string;

    public readonly requestType = Strings[StringId.OrderRequestTypeDisplay_Cancel];
    public readonly accountCaption: string;
    public readonly accountIdDisplay: string;
    public readonly accountName: string;
    public readonly sideCaption: string;
    public readonly side: string;
    public readonly symbolCaption: string;
    public readonly symbolCode: string;
    public readonly symbolName: string;
    public readonly orderTypeCaption: string;
    public readonly orderType: string;
    public readonly timeInForceCaption: string;
    public readonly timeInForce: string;
    public readonly expiryDate: string;
    public readonly quantityCaption: string;
    public readonly quantity: string;
    public readonly priceCaption: string;
    public readonly price: string;
    public readonly orderIdCaption: string;
    public readonly orderId: string;

    private _settingsService: SettingsService;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    private readonly _sideId: OrderTradeTypeId;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        symbolsNgService: SymbolsNgService,
        textFormatterNgService: TextFormatterNgService,
        @Inject(ReviewOrderRequestComponentNgDirective.orderPadInjectionToken) orderPad: OrderPad,
        @Inject(ReviewOrderRequestComponentNgDirective.definitionInjectionToken) definition: OrderRequestDataDefinition
    ) {
        super(elRef, ++ReviewCancelOrderRequestNgComponent.typeInstanceCreateCount, cdr, orderPad, definition);

        this._settingsService = settingsNgService.service;
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.applySettings());

        const symbolsService = symbolsNgService.service;
        const textFormatterService = textFormatterNgService.service;

        this.accountCaption = Strings[StringId.OrderPadAccountCaption];
        const account = orderPad.getAccountIfOk();
        if (account === undefined) {
            throw new AssertInternalError('RMIRCCAI9888332312');
        } else {
            this.accountIdDisplay = account.id.display;

            if (orderPad.account === undefined) {
                throw new AssertInternalError('RMIRCCAN9888332312');
            } else {
                this.accountName = orderPad.account.name;
            }
        }

        this.sideCaption = Strings[StringId.OrderPadSideCaption];

        const sideId = orderPad.getSideIdIfOk();
        if (sideId === undefined) {
            throw new AssertInternalError('RMIRCCSI9888332312');
        } else {
            this._sideId = sideId;
            this.side = textFormatterService.formatOrderTradeTypeId(sideId);
        }

        this.symbolCaption = Strings[StringId.OrderPadSymbolCaption];

        if (orderPad.tradingIvemId === undefined) {
            throw new AssertInternalError('RMIRCCRI9888332312');
        } else {
            this.symbolCode = symbolsService.tradingIvemIdToNothingHiddenDisplay(orderPad.tradingIvemId);

            const detail = orderPad.getSymbolDetailIfOk();
            if (detail === undefined) {
                throw new AssertInternalError('RMIRCCSD9888332312');
            } else {
                this.symbolName = symbolsService.calculateSymbolName(
                    detail.exchange,
                    detail.name,
                    detail.dataIvemId.code,
                    detail.alternateCodes
                );
            }
        }

        this.orderTypeCaption = Strings[StringId.OrderPadOrderTypeCaption];

        const orderTypeId = orderPad.getOrderTypeIdIfOk();
        if (orderTypeId === undefined) {
            throw new AssertInternalError('RMIRCCOT9888332312');
        } else {
            this.orderType = textFormatterService.formatOrderTypeId(orderTypeId);
        }

        this.timeInForceCaption = Strings[StringId.OrderPadTimeInForceCaption];

        const timeInForceId = orderPad.getTimeInForceIdIfOk();
        if (timeInForceId === undefined) {
            throw new AssertInternalError('RMIRCCTF9888332312');
        } else {
            this.timeInForce = textFormatterService.formatTimeInForceId(timeInForceId);

            if (!orderPad.isFieldValid(OrderPad.FieldId.ExpiryDate)) {
                throw new AssertInternalError('RMIRCCED9888332312');
            } else {
                const expiryDate = orderPad.expiryDate;
                if (expiryDate === undefined) {
                    this.expiryDate = '';
                } else {
                    this.expiryDate = textFormatterService.formatDate(expiryDate);
                }
            }
        }

        this.quantityCaption = Strings[StringId.OrderPadTotalQuantityCaption];

        const totalQuantity = orderPad.getTotalQuantityIdIfOk();
        if (totalQuantity === undefined) {
            throw new AssertInternalError('RMIRCCTC9888332312');
        } else {
            this.quantity = textFormatterService.formatQuantity(totalQuantity);
        }

        this.priceCaption = Strings[StringId.OrderPadLimitValueCaption];

        if (!orderPad.isFieldValid(OrderPad.FieldId.LimitValue)) {
            throw new AssertInternalError('RMIRCCLV9888332312');
        } else {
            const price = orderPad.limitValue;
            if (price === undefined) {
                this.price = '';
            } else {
                this.price = textFormatterService.formatPrice(price);
            }
        }

        this.orderIdCaption = Strings[StringId.OrderPadExistingOrderIdCaption];
        const orderId = orderPad.existingOrderId;
        if (orderId === undefined) {
            throw new AssertInternalError('RMIRCCOI9888332312');
        } else {
            this.orderId = orderId;
        }

        this.applySettings();
    }

    ngOnDestroy() {
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
    }

    private applySettings() {
        this.gridBkgdColor = this._settingsService.color.getBkgd(ColorScheme.ItemId.Grid_Base);
        this.gridAltBkgdColor = this._settingsService.color.getBkgd(ColorScheme.ItemId.Grid_BaseAlt);
        switch (this._sideId) {
            case OrderTradeTypeId.Buy:
                this.gridOrderSideColor = this._settingsService.color.getBkgd(ColorScheme.ItemId.Grid_PriceBuy);
                break;
            case OrderTradeTypeId.Sell:
                this.gridOrderSideColor = this._settingsService.color.getBkgd(ColorScheme.ItemId.Grid_PriceSell);
                break;
        }
        this.markForCheck();
    }
}
