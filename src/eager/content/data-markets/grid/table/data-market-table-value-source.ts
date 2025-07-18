import { Integer, MultiEvent, UnreachableCaseError } from '@pbkware/js-utils';
import {
    Correctness,
    CorrectnessTableValue,
    DataMarket,
    ExchangeEnvironmentZenithCode,
    FeedStatusIdCorrectnessTableValue,
    Market,
    NumberCorrectnessTableValue,
    SourceTzOffsetDateCorrectnessTableValue,
    SourceTzOffsetDateTimeCorrectnessTableValue,
    StringCorrectnessTableValue,
    TableValue,
    TableValueSource,
    TextFormattableValue,
    TradingStateAllowIdArrayCorrectnessTableValue,
    TradingStateReasonIdCorrectnessTableValue
} from '@plxtra/motif-core';
import { RevRecordValueRecentChangeTypeId } from 'revgrid';
import { DataMarketTableFieldSourceDefinition } from './data-market-table-field-source-definition';

export class DataMarketTableValueSource extends TableValueSource {
    private _fieldValuesChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _correctnessChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(firstFieldIndexOffset: Integer, private readonly _dataMarket: DataMarket) {
        super(firstFieldIndexOffset);
    }

    override activate(): TableValue[] {
        this._fieldValuesChangedSubscriptionId = this._dataMarket.subscribeFieldValuesChangedEvent(
            (changedFieldIds) => { this.handleFieldValuesChangedEvent(changedFieldIds); }
        );

        this._correctnessChangedSubscriptionId = this._dataMarket.subscribeCorrectnessChangedEvent(
            () => { this.handleCorrectnessChangedEvent(); }
        );

        this.initialiseBeenIncubated(true);

        return this.getAllValues();
    }

    override deactivate() {
        if (this._fieldValuesChangedSubscriptionId !== undefined) {
            this._dataMarket.unsubscribeFieldValuesChangedEvent(this._fieldValuesChangedSubscriptionId);
            this._fieldValuesChangedSubscriptionId = undefined;
        }
        if (this._correctnessChangedSubscriptionId !== undefined) {
            this._dataMarket.unsubscribeCorrectnessChangedEvent(this._correctnessChangedSubscriptionId);
            this._correctnessChangedSubscriptionId = undefined;
        }
    }

    getAllValues(): TableValue[] {
        const fieldCount = DataMarketTableFieldSourceDefinition.Field.count;
        const result = new Array<TableValue>(fieldCount);
        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableValue(fieldIdx);
            const fieldId = DataMarketTableFieldSourceDefinition.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getfieldCount(): Integer {
        return DataMarketTableFieldSourceDefinition.Field.count;
    }

    private handleFieldValuesChangedEvent(changedFieldIds: readonly DataMarket.FieldId[]) {
        const changeCount = changedFieldIds.length;
        const valueChanges = new Array<TableValueSource.ValueChange>(changeCount);
        let foundCount = 0;
        for (let i = 0; i < changeCount; i++) {
            const fieldId = changedFieldIds[i];
            const fieldIndex = DataMarketTableFieldSourceDefinition.Field.indexOfId(fieldId);
            if (fieldIndex >= 0) {
                const newValue = this.createTableValue(fieldIndex);
                this.loadValue(fieldId, newValue);
                valueChanges[foundCount++] = { fieldIndex, newValue, recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update };
            }
        }

        this.notifyValueChangesEvent(valueChanges);
    }

    private handleCorrectnessChangedEvent() {
        const allValues = this.getAllValues();
        this.processDataCorrectnessChanged(allValues, Correctness.idIsIncubated(this._dataMarket.correctnessId));
    }

    private createTableValue(fieldIdx: Integer) {
        const valueConstructor = DataMarketTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: DataMarket.FieldId, value: CorrectnessTableValue) {
        value.dataCorrectnessId = this._dataMarket.correctnessId;

        switch (id) {
            case DataMarket.FieldId.ZenithCode: {
                (value as StringCorrectnessTableValue).data = this._dataMarket.zenithCode;
                break;
            }
            case DataMarket.FieldId.Name: {
                (value as StringCorrectnessTableValue).data = this._dataMarket.name;
                break;
            }
            case DataMarket.FieldId.Display: {
                (value as StringCorrectnessTableValue).data = this._dataMarket.display;
                break;
            }
            case DataMarket.FieldId.Lit: {
                value.addOrRemoveRenderAttribute(TextFormattableValue.centeredLargeDotAttribute, this._dataMarket.lit);
                break;
            }
            case DataMarket.FieldId.DisplayPriority: {
                (value as NumberCorrectnessTableValue).data = this._dataMarket.displayPriority;
                break;
            }
            case DataMarket.FieldId.Unknown: {
                value.addOrRemoveRenderAttribute(TextFormattableValue.centeredLargeDotAttribute, this._dataMarket.unknown);
                break;
            }
            case DataMarket.FieldId.ExchangeEnvironment: {
                (value as StringCorrectnessTableValue).data = ExchangeEnvironmentZenithCode.createDisplay(this._dataMarket.exchangeEnvironment.zenithCode);
                break;
            }
            case DataMarket.FieldId.ExchangeEnvironmentIsDefault: {
                value.addOrRemoveRenderAttribute(TextFormattableValue.centeredLargeDotAttribute, this._dataMarket.exchangeEnvironmentIsDefault);
                break;
            }
            case DataMarket.FieldId.Exchange: {
                (value as StringCorrectnessTableValue).data = this._dataMarket.exchange.zenithCode;
                break;
            }
            case DataMarket.FieldId.SymbologyCode: {
                (value as StringCorrectnessTableValue).data = this._dataMarket.symbologyCode;
                break;
            }
            case DataMarket.FieldId.SymbologyExchangeSuffixCode: {
                (value as StringCorrectnessTableValue).data = this._dataMarket.symbologyExchangeSuffixCode;
                break;
            }
            case DataMarket.FieldId.BestTradingMarket: {
                const bestTradingMarket = this._dataMarket.bestTradingMarket;
                (value as StringCorrectnessTableValue).data = bestTradingMarket === undefined ? undefined : bestTradingMarket.zenithCode;
                break;
            }
            case DataMarket.FieldId.BestLitForTradingMarkets: {
                const bestCorrespondingTradingMarket = this._dataMarket.bestLitForTradingMarkets;
                (value as StringCorrectnessTableValue).data = Market.arrayToZenithCodesCommaText(bestCorrespondingTradingMarket);
                break;
            }
            case DataMarket.FieldId.MarketBoards: {
                (value as StringCorrectnessTableValue).data = this._dataMarket.marketBoards.getZenithCodesAsCommaText();
                break;
            }
            case DataMarket.FieldId.FeedStatusId: {
                (value as FeedStatusIdCorrectnessTableValue).data = this._dataMarket.feedStatusId;
                break;
            }
            case DataMarket.FieldId.TradingDate: {
                (value as SourceTzOffsetDateCorrectnessTableValue).data = this._dataMarket.tradingDate;
                break;
            }
            case DataMarket.FieldId.MarketTime: {
                (value as SourceTzOffsetDateTimeCorrectnessTableValue).data = this._dataMarket.marketTime;
                break;
            }
            case DataMarket.FieldId.Status: {
                (value as StringCorrectnessTableValue).data = this._dataMarket.status;
                break;
            }
            case DataMarket.FieldId.AllowIds: {
                (value as TradingStateAllowIdArrayCorrectnessTableValue).data = this._dataMarket.allowIds;
                break;
            }
            case DataMarket.FieldId.ReasonId: {
                (value as TradingStateReasonIdCorrectnessTableValue).data = this._dataMarket.reasonId;
                break;
            }
            default:
                throw new UnreachableCaseError('EETVSLV49110', id);
        }
    }
}
