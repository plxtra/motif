import { ChangeDetectorRef, Directive, InjectionToken, inject } from '@angular/core';
import { UnexpectedCaseError } from '@pbkware/js-utils';
import {
    AmendOrderMessageConvert,
    AmendOrderRequestDataDefinition,
    CancelOrderMessageConvert,
    CancelOrderRequestDataDefinition,
    DataChannel,
    DataChannelId,
    MoveOrderMessageConvert,
    MoveOrderRequestDataDefinition,
    OrderPad,
    OrderRequestDataDefinition,
    PlaceOrderMessageConvert,
    PlaceOrderRequestDataDefinition,
    StringId,
    Strings,
} from '@plxtra/motif-core';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';

@Directive()
export abstract class ReviewOrderRequestComponentNgDirective extends ContentComponentBaseNgDirective {
    public zenithMessageTitle = '';

    private readonly _cdr = inject(ChangeDetectorRef);
    private readonly _orderPad = inject(OrderPad);
    private readonly _dataDefinition = inject(OrderRequestDataDefinition);

    private _zenithMessageActive = false;
    private _zenithMessageText: string | undefined;

    public get zenithMessageActive() { return this._zenithMessageActive; }
    public get zenithMessageText() {
        if (this._zenithMessageText === undefined) {
            this._zenithMessageText = this.generateZenithMessageText();
        }
        return this._zenithMessageText;
    }

    get orderPad() { return this._orderPad; }
    get dataDefinition() { return this._dataDefinition; }

    setZenithMessageActive(value: boolean) {
        if (value !== this._zenithMessageActive) {
            this._zenithMessageActive = value;
            this.markForCheck();
        }
    }

    protected markForCheck() {
        this._cdr.markForCheck();
    }

    private generateZenithMessageText() {
        switch (this._dataDefinition.channelId) {
            case DataChannelId.PlaceOrderRequest: {
                const definition = this._dataDefinition as PlaceOrderRequestDataDefinition;
                const messageResult = PlaceOrderMessageConvert.createPublishMessage(undefined, definition);
                if (messageResult.isErr()) {
                    return Strings[StringId.ReviewOrderRequest_InvalidPlaceOrderZenithMessage];
                } else {
                    return JSON.stringify(messageResult.value, undefined, 2);
                }
            }
            case DataChannelId.AmendOrderRequest: {
                const definition = this._dataDefinition as AmendOrderRequestDataDefinition;
                const messageResult = AmendOrderMessageConvert.createPublishMessage(undefined, definition);
                if (messageResult.isErr()) {
                    return Strings[StringId.ReviewOrderRequest_InvalidAmendOrderZenithMessage];
                } else {
                    return JSON.stringify(messageResult.value, undefined, 2);
                }
            }
            case DataChannelId.MoveOrderRequest: {
                const definition = this._dataDefinition as MoveOrderRequestDataDefinition;
                const messageResult = MoveOrderMessageConvert.createPublishMessage(undefined, definition);
                if (messageResult.isErr()) {
                    return Strings[StringId.ReviewOrderRequest_InvalidMoveOrderZenithMessage];
                } else {
                    return JSON.stringify(messageResult.value, undefined, 2);
                }
            }
            case DataChannelId.CancelOrderRequest: {
                const definition = this._dataDefinition as CancelOrderRequestDataDefinition;
                const messageResult = CancelOrderMessageConvert.createPublishMessage(undefined, definition);
                if (messageResult.isErr()) {
                    return Strings[StringId.ReviewOrderRequest_InvalidCancelOrderZenithMessage];
                } else {
                    return JSON.stringify(messageResult.value, undefined, 2);
                }
            }
            default:
                throw new UnexpectedCaseError('RORCDGZMT099999273', DataChannel.idToName(this._dataDefinition.channelId));
        }
    }
}

export namespace ReviewOrderRequestComponentNgDirective {
    const orderPadTokenName = 'orderPad';
    export const orderPadInjectionToken = new InjectionToken<OrderPad>(orderPadTokenName);
    const definitionTokenName = 'definition';
    export const definitionInjectionToken = new InjectionToken<OrderRequestDataDefinition>(definitionTokenName);
}
