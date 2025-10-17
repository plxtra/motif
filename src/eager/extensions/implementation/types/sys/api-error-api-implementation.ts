import { EnumInfoOutOfOrderError } from '@pbkware/js-utils';
import { ApiError as ApiErrorApi } from '../../../api';

export class ApiErrorImplementation extends Error implements ApiErrorApi {
    constructor(private _code: ApiErrorApi.Code, message?: string) {
        super(ApiErrorImplementation.generateMessage(_code, message));
    }

    get code() { return this._code; }
}

export class UnreachableCaseApiErrorImplementation extends ApiErrorImplementation {
    constructor(code: ApiErrorApi.Code, value: never) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        super(code, `"${value}"`);
    }
}

export namespace ApiErrorImplementation {
    export function generateMessage(code: ApiErrorApi.Code, message: string | undefined) {
        if (message === undefined || message === '') {
            return code;
        } else {
            return `${code}: ${message}`;
        }
    }

    export namespace Code {
        interface Info {
            readonly id: ApiErrorApi.Code;
            readonly code: ApiErrorApi.Code;
        }

        // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
        type InfosObject = { [id in ApiErrorApi.Code]: Info };

        const infosObject: InfosObject = {
            ZeroLengthMenuName: {
                id: ApiErrorApi.CodeEnum.ZeroLengthMenuName,
                code: 'ZeroLengthMenuName',
            },
            CommandNotRegistered: {
                id: ApiErrorApi.CodeEnum.CommandNotRegistered,
                code: 'CommandNotRegistered',
            },
            DestroyCommandMenuItemNotExist: {
                id: ApiErrorApi.CodeEnum.DestroyCommandMenuItemNotExist,
                code: 'DestroyCommandMenuItemNotExist',
            },
            DestroyChildMenuItemNotExist: {
                id: ApiErrorApi.CodeEnum.DestroyChildMenuItemNotExist,
                code: 'DestroyChildMenuItemNotExist',
            },
            InvalidCorrectness: {
                id: ApiErrorApi.CodeEnum.InvalidCorrectness,
                code: 'InvalidCorrectness',
            },
            InvalidBadness: {
                id: ApiErrorApi.CodeEnum.InvalidBadness,
                code: 'InvalidBadness',
            },
            InvalidJsonELementErrorCode: {
                id: ApiErrorApi.CodeEnum.InvalidJsonELementErrorCode,
                code: 'InvalidJsonELementErrorCode',
            },
            InvalidCommaTextErrorCode: {
                id: ApiErrorApi.CodeEnum.InvalidCommaTextErrorCode,
                code: 'InvalidCommaTextErrorCode',
            },
            InvalidFeedClass: {
                id: ApiErrorApi.CodeEnum.InvalidFeedClass,
                code: 'InvalidFeedClass',
            },
            InvalidFeedStatus: {
                id: ApiErrorApi.CodeEnum.InvalidFeedStatus,
                code: 'InvalidFeedStatus',
            },
            InvalidMarketType: {
                id: ApiErrorApi.CodeEnum.InvalidMarketType,
                code: 'InvalidMarketType',
            },
            InvalidSymbolField: {
                id: ApiErrorApi.CodeEnum.InvalidSymbolField,
                code: 'InvalidSymbolField',
            },
            InvalidTradingStateAllow: {
                id: ApiErrorApi.CodeEnum.InvalidTradingStateAllow,
                code: 'InvalidTradingStateAllow',
            },
            InvalidTradingStateReason: {
                id: ApiErrorApi.CodeEnum.InvalidTradingStateReason,
                code: 'InvalidTradingStateReason',
            },
            InvalidOrderTimeInForce: {
                id: ApiErrorApi.CodeEnum.InvalidOrderTimeInForce,
                code: 'InvalidOrderTimeInForce',
            },
            InvalidOrderType: {
                id: ApiErrorApi.CodeEnum.InvalidOrderType,
                code: 'InvalidOrderType',
            },
            InvalidOrderTradeType: {
                id: ApiErrorApi.CodeEnum.InvalidOrderTradeType,
                code: 'InvalidOrderTradeType',
            },
            InvalidOrderTriggerType: {
                id: ApiErrorApi.CodeEnum.InvalidOrderTriggerType,
                code: 'InvalidOrderTriggerType',
            },
            InvalidOrderRouteAlgorithm: {
                id: ApiErrorApi.CodeEnum.InvalidOrderRouteAlgorithm,
                code: 'InvalidOrderRouteAlgorithm',
            },
            InvalidSymbolSvcExchangeHideMode: {
                id: ApiErrorApi.CodeEnum.InvalidSymbolSvcExchangeHideMode,
                code: 'InvalidSymbolSvcExchangeHideMode',
            },
            InvalidSymbolSvcZenithSymbologySupportLevel: {
                id: ApiErrorApi.CodeEnum.InvalidSymbolSvcZenithSymbologySupportLevel,
                code: 'InvalidSymbolSvcZenithSymbologySupportLevel',
            },
            InvalidUiActionState: {
                id: ApiErrorApi.CodeEnum.InvalidUiActionState,
                code: 'InvalidUiActionState',
            },
            InvalidUiActionCommitType: {
                id: ApiErrorApi.CodeEnum.InvalidUiActionCommitType,
                code: 'InvalidUiActionCommitType',
            },
            InvalidUiActionAutoAcceptanceType: {
                id: ApiErrorApi.CodeEnum.InvalidUiActionAutoAcceptanceType,
                code: 'InvalidUiActionAutoAcceptanceType',
            },
            InvalidBuiltinIconButtonUiActionIconId: {
                id: ApiErrorApi.CodeEnum.InvalidBuiltinIconButtonUiActionIconId,
                code: 'InvalidBuiltinIconButtonUiActionIconId',
            },
            InvalidBrokerageAccountGroupType: {
                id: ApiErrorApi.CodeEnum.InvalidBrokerageAccountGroupType,
                code: 'InvalidBrokerageAccountGroupType',
            },
            InvalidDesktopPreferredLocation: {
                id: ApiErrorApi.CodeEnum.InvalidDesktopPreferredLocation,
                code: 'InvalidDesktopPreferredLocation',
            },
            InvalidPublisherType: {
                id: ApiErrorApi.CodeEnum.InvalidPublisherType,
                code: 'InvalidPublisherType',
            },
            InvalidSourceTzOffsetDateTimeApiTimezoneMode: {
                id: ApiErrorApi.CodeEnum.InvalidSourceTzOffsetDateTimeApiTimezoneMode,
                code: 'InvalidSourceTzOffsetDateTimeApiTimezoneMode',
            },
            InvalidDataIvemIdPriceVolumeSequenceHistorySeriesTypeId: {
                id: ApiErrorApi.CodeEnum.InvalidDataIvemIdPriceVolumeSequenceHistorySeriesTypeId,
                code: 'InvalidDataIvemIdPriceVolumeSequenceHistorySeriesTypeId',
            },
            InvalidHistorySequencerUnit: {
                id: ApiErrorApi.CodeEnum.InvalidHistorySequencerUnit,
                code: 'InvalidHistorySequencerUnit',
            },
            InvalidSequencerHistory: {
                id: ApiErrorApi.CodeEnum.InvalidSequencerHistory,
                code: 'InvalidSequencerHistory',
            },
            EventSubscriptionNotFound: {
                id: ApiErrorApi.CodeEnum.EventSubscriptionNotFound,
                code: 'EventSubscriptionNotFound',
            },
            RoutedIvemIdCreateError_InvalidParameterTypes: {
                id: ApiErrorApi.CodeEnum.RoutedIvemIdCreateError_InvalidParameterTypes,
                code: 'RoutedIvemIdCreateError_InvalidParameterTypes',
            },
            GetFrameEventerIsUndefined: {
                id: ApiErrorApi.CodeEnum.GetFrameEventerIsUndefined,
                code: 'GetFrameEventerIsUndefined',
            },
            UnknownControl: {
                id: ApiErrorApi.CodeEnum.UnknownControl,
                code: 'UnknownControl',
            },
            UnknownContentComponent: {
                id: ApiErrorApi.CodeEnum.UnknownContentComponent,
                code: 'UnknownContentComponent',
            },
        };

        const infos = Object.values(infosObject);
        const idCount = infos.length;

        export function initialise() {
            for (let i = 0; i < idCount; i++) {
                const info = infos[i];
                if (info.id !== info.code) {
                    throw new EnumInfoOutOfOrderError('ApiErrorApiImplementationCode', i, info.code);
                }
            }
        }
    }
}

ApiErrorImplementation.Code.initialise();
