import { Integer, UnreachableCaseError } from '@pbkware/js-utils';
import {
    ExchangeEnvironmentZenithCode,
    NumberTableValue,
    OrderTradeType,
    OrderTriggerType,
    OrderType,
    OrderTypeIdTableValue,
    StringTableValue,
    TableValue,
    TableValueSource,
    TextFormattableValue,
    TimeInForce,
    TimeInForceIdTableValue,
    TradingMarket
} from '@plxtra/motif-core';
import { RevRecordValueRecentChangeTypeId } from 'revgrid';
import { TradingMarketTableFieldSourceDefinition } from './trading-market-table-field-source-definition';

export class TradingMarketTableValueSource extends TableValueSource {
    constructor(firstFieldIndexOffset: Integer, private readonly _tradingMarket: TradingMarket) {
        super(firstFieldIndexOffset);
    }

    override activate(): TableValue[] {
        this.initialiseBeenIncubated(true);

        return this.getAllValues();
    }

    override deactivate() {
        // Nothing to do
    }

    getAllValues(): TableValue[] {
        const fieldCount = TradingMarketTableFieldSourceDefinition.Field.count;
        const result = new Array<TableValue>(fieldCount);
        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableValue(fieldIdx);
            const fieldId = TradingMarketTableFieldSourceDefinition.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getfieldCount(): Integer {
        return TradingMarketTableFieldSourceDefinition.Field.count;
    }

    private handleValuesChangedEvent(changedFieldIds: readonly TradingMarket.FieldId[]) {
        const changeCount = changedFieldIds.length;
        const valueChanges = new Array<TableValueSource.ValueChange>(changeCount);
        let foundCount = 0;
        for (let i = 0; i < changeCount; i++) {
            const fieldId = changedFieldIds[i];
            const fieldIndex = TradingMarketTableFieldSourceDefinition.Field.indexOfId(fieldId);
            if (fieldIndex >= 0) {
                const newValue = this.createTableValue(fieldIndex);
                this.loadValue(fieldId, newValue);
                valueChanges[foundCount++] = { fieldIndex, newValue, recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update };
            }
        }

        this.notifyValueChangesEvent(valueChanges);
    }

    private createTableValue(fieldIdx: Integer) {
        const valueConstructor = TradingMarketTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: TradingMarket.FieldId, value: TableValue) {
        switch (id) {
            case TradingMarket.FieldId.ZenithCode: {
                (value as StringTableValue).data = this._tradingMarket.zenithCode;
                break;
            }
            case TradingMarket.FieldId.Name: {
                (value as StringTableValue).data = this._tradingMarket.name;
                break;
            }
            case TradingMarket.FieldId.Display: {
                (value as StringTableValue).data = this._tradingMarket.display;
                break;
            }
            case TradingMarket.FieldId.Lit: {
                value.addOrRemoveRenderAttribute(TextFormattableValue.centeredLargeDotAttribute, this._tradingMarket.lit);
                break;
            }
            case TradingMarket.FieldId.DisplayPriority: {
                (value as NumberTableValue).data = this._tradingMarket.displayPriority;
                break;
            }
            case TradingMarket.FieldId.Unknown: {
                value.addOrRemoveRenderAttribute(TextFormattableValue.centeredLargeDotAttribute, this._tradingMarket.unknown);
                break;
            }
            case TradingMarket.FieldId.ExchangeEnvironment: {
                (value as StringTableValue).data = ExchangeEnvironmentZenithCode.createDisplay(this._tradingMarket.exchangeEnvironment.zenithCode);
                break;
            }
            case TradingMarket.FieldId.ExchangeEnvironmentIsDefault: {
                value.addOrRemoveRenderAttribute(TextFormattableValue.centeredLargeDotAttribute, this._tradingMarket.exchangeEnvironmentIsDefault);
                break;
            }
            case TradingMarket.FieldId.Exchange: {
                (value as StringTableValue).data = this._tradingMarket.exchange.zenithCode;
                break;
            }
            case TradingMarket.FieldId.SymbologyCode: {
                (value as StringTableValue).data = this._tradingMarket.symbologyCode;
                break;
            }
            case TradingMarket.FieldId.SymbologyExchangeSuffixCode: {
                (value as StringTableValue).data = this._tradingMarket.symbologyExchangeSuffixCode;
                break;
            }
            case TradingMarket.FieldId.HasSymbologicalCorrespondingDataMarket: {
                value.addOrRemoveRenderAttribute(
                    TextFormattableValue.centeredLargeDotAttribute,
                    this._tradingMarket.symbologicalCorrespondingDataMarket !== undefined
                );
                break;
            }
            case TradingMarket.FieldId.Feed: {
                (value as StringTableValue).data = this._tradingMarket.feed.zenithCode;
                break;
            }
            case TradingMarket.FieldId.Attributes: {
                const attributes = this._tradingMarket.attributes;
                (value as StringTableValue).data = attributes === undefined ? undefined : TradingMarket.attributesToCommaText(attributes);
                break;
            }
            case TradingMarket.FieldId.BestLitDataMarket: {
                const bestLitDataMarket = this._tradingMarket.bestLitDataMarket;
                (value as StringTableValue).data = bestLitDataMarket === undefined ? undefined : bestLitDataMarket.zenithCode;
                break;
            }
            case TradingMarket.FieldId.AllowedOrderTypeIds: {
                (value as StringTableValue).data = OrderType.idArrayToDisplay(this._tradingMarket.allowedOrderTypeIds);
                break;
            }
            case TradingMarket.FieldId.DefaultOrderTypeId: {
                (value as OrderTypeIdTableValue).data = this._tradingMarket.defaultOrderTypeId;
                break;
            }
            case TradingMarket.FieldId.AllowedOrderTimeInForceIds: {
                (value as StringTableValue).data = TimeInForce.idArrayToDisplay(this._tradingMarket.allowedOrderTimeInForceIds);
                break;
            }
            case TradingMarket.FieldId.DefaultOrderTimeInForceId: {
                (value as TimeInForceIdTableValue).data = this._tradingMarket.defaultOrderTimeInForceId;
                break;
            }
            case TradingMarket.FieldId.MarketOrderTypeAllowedTimeInForceIds: {
                (value as StringTableValue).data = TimeInForce.idArrayToDisplay(this._tradingMarket.marketOrderTypeAllowedTimeInForceIds);
                break;
            }
            case TradingMarket.FieldId.AllowedOrderTriggerTypeIds: {
                (value as StringTableValue).data = OrderTriggerType.idArrayToAbbreviation(this._tradingMarket.allowedOrderTriggerTypeIds);
                break;
            }
            case TradingMarket.FieldId.AllowedOrderTradeTypeIds: {
                (value as StringTableValue).data = OrderTradeType.idArrayToAbbreviation(this._tradingMarket.allowedOrderTradeTypeIds);
                break;
            }
            default:
                throw new UnreachableCaseError('EETVSLV49110', id);
        }
    }
}
