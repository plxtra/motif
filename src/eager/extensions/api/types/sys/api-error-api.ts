/** @public */
export interface ApiError extends Error {
    readonly code: ApiError.Code;
}

/** @public */
export namespace ApiError {
    export const enum CodeEnum {
        ZeroLengthMenuName = 'ZeroLengthMenuName',
        CommandNotRegistered = 'CommandNotRegistered',
        DestroyCommandMenuItemNotExist = 'DestroyCommandMenuItemNotExist',
        DestroyChildMenuItemNotExist = 'DestroyChildMenuItemNotExist',
        InvalidCorrectness = 'InvalidCorrectness',
        InvalidBadness = 'InvalidBadness',
        InvalidJsonELementErrorCode = 'InvalidJsonELementErrorCode',
        InvalidCommaTextErrorCode = 'InvalidCommaTextErrorCode',
        InvalidFeedClass = 'InvalidFeedClass',
        InvalidFeedStatus = 'InvalidFeedStatus',
        InvalidMarketType = 'InvalidMarketType',
        InvalidSymbolField = 'InvalidSymbolField',
        InvalidTradingStateAllow = 'InvalidTradingStateAllow',
        InvalidTradingStateReason = 'InvalidTradingStateReason',
        InvalidOrderTimeInForce = 'InvalidOrderTimeInForce',
        InvalidOrderType = 'InvalidOrderType',
        InvalidOrderTradeType = 'InvalidOrderTradeType',
        InvalidOrderTriggerType = 'InvalidOrderTriggerType',
        InvalidOrderRouteAlgorithm = 'InvalidOrderRouteAlgorithm',
        InvalidSymbolSvcExchangeHideMode = 'InvalidSymbolSvcExchangeHideMode',
        InvalidSymbolSvcZenithSymbologySupportLevel = 'InvalidSymbolSvcZenithSymbologySupportLevel',
        InvalidUiActionState = 'InvalidUiActionState',
        InvalidUiActionCommitType = 'InvalidUiActionCommitType',
        InvalidUiActionAutoAcceptanceType = 'InvalidUiActionAutoAcceptanceType',
        InvalidBuiltinIconButtonUiActionIconId = 'InvalidBuiltinIconButtonUiActionIconId',
        InvalidBrokerageAccountGroupType = 'InvalidBrokerageAccountGroupType',
        InvalidDesktopPreferredLocation = 'InvalidDesktopPreferredLocation',
        InvalidPublisherType = 'InvalidPublisherType',
        InvalidSourceTzOffsetDateTimeApiTimezoneMode = 'InvalidSourceTzOffsetDateTimeApiTimezoneMode',
        InvalidDataIvemIdPriceVolumeSequenceHistorySeriesTypeId = 'InvalidDataIvemIdPriceVolumeSequenceHistorySeriesTypeId',
        InvalidHistorySequencerUnit = 'InvalidHistorySequencerUnit',
        InvalidSequencerHistory = 'InvalidSequencerHistory',
        EventSubscriptionNotFound = 'EventSubscriptionNotFound',
        RoutedIvemIdCreateError_InvalidParameterTypes = 'RoutedIvemIdCreateError_InvalidParameterTypes',
        GetFrameEventerIsUndefined = 'GetFrameEventerIsUndefined',
        UnknownControl = 'UnknownControl',
        UnknownContentComponent = 'UnknownContentComponent',
    }

    export type Code = keyof typeof CodeEnum;
}
