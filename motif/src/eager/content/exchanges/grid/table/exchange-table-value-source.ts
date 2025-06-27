import {
    Integer,
    MultiEvent,
    UnreachableCaseError
} from '@pbkware/js-utils';
import {
    Exchange,
    ExchangeEnvironmentZenithCode,
    Market,
    NumberTableValue,
    StringTableValue,
    SymbolField,
    SymbolFieldIdTableValue,
    TableValue,
    TableValueSource,
    TextFormattableValue,
} from '@plxtra/motif-core';
import { RevRecordValueRecentChangeTypeId } from 'revgrid';
import { ExchangeTableFieldSourceDefinition } from './exchange-table-field-source-definition';

export class ExchangeTableValueSource extends TableValueSource {
    private _fieldsChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(firstFieldIndexOffset: Integer, private readonly _exchange: Exchange) {
        super(firstFieldIndexOffset);
    }

    override activate(): TableValue[] {
        this._fieldsChangedEventSubscriptionId = this._exchange.subscribeFieldValuesChangedEvent(
            (changedFieldIds) => { this.handleValuesChangedEvent(changedFieldIds); }
        );

        this.initialiseBeenIncubated(true);

        return this.getAllValues();
    }

    override deactivate() {
        if (this._fieldsChangedEventSubscriptionId !== undefined) {
            this._exchange.unsubscribeFieldValuesChangedEvent(this._fieldsChangedEventSubscriptionId);
            this._fieldsChangedEventSubscriptionId = undefined;
        }
    }

    getAllValues(): TableValue[] {
        const fieldCount = ExchangeTableFieldSourceDefinition.Field.count;
        const result = new Array<TableValue>(fieldCount);
        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableValue(fieldIdx);
            const fieldId = ExchangeTableFieldSourceDefinition.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getfieldCount(): Integer {
        return ExchangeTableFieldSourceDefinition.Field.count;
    }

    private handleValuesChangedEvent(changedFieldIds: readonly Exchange.FieldId[]) {
        const changeCount = changedFieldIds.length;
        const valueChanges = new Array<TableValueSource.ValueChange>(changeCount);
        let foundCount = 0;
        for (let i = 0; i < changeCount; i++) {
            const fieldId = changedFieldIds[i];
            const fieldIndex = ExchangeTableFieldSourceDefinition.Field.indexOfId(fieldId);
            if (fieldIndex >= 0) {
                const newValue = this.createTableValue(fieldIndex);
                this.loadValue(fieldId, newValue);
                valueChanges[foundCount++] = { fieldIndex, newValue, recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update };
            }
        }

        this.notifyValueChangesEvent(valueChanges);
    }

    private createTableValue(fieldIdx: Integer) {
        const valueConstructor = ExchangeTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: Exchange.FieldId, value: TableValue) {
        switch (id) {
            case Exchange.FieldId.ZenithCode: {
                (value as StringTableValue).data = this._exchange.zenithCode;
                break;
            }
            case Exchange.FieldId.UnenvironmentedZenithCode: {
                (value as StringTableValue).data = this._exchange.unenvironmentedZenithCode;
                break;
            }
            case Exchange.FieldId.AbbreviatedDisplay: {
                (value as StringTableValue).data = this._exchange.abbreviatedDisplay;
                break;
            }
            case Exchange.FieldId.FullDisplay: {
                (value as StringTableValue).data = this._exchange.fullDisplay;
                break;
            }
            case Exchange.FieldId.DisplayPriority: {
                (value as NumberTableValue).data = this._exchange.displayPriority;
                break;
            }
            case Exchange.FieldId.Unknown: {
                value.addOrRemoveRenderAttribute(TextFormattableValue.centeredLargeDotAttribute, this._exchange.unknown);
                break;
            }
            case Exchange.FieldId.IsDefaultDefault: {
                value.addOrRemoveRenderAttribute(TextFormattableValue.centeredLargeDotAttribute, this._exchange.isDefaultDefault);
                break;
            }
            case Exchange.FieldId.ExchangeEnvironment: {
                (value as StringTableValue).data = ExchangeEnvironmentZenithCode.createDisplay(this._exchange.exchangeEnvironment.zenithCode);
                break;
            }
            case Exchange.FieldId.ExchangeEnvironmentIsDefault: {
                value.addOrRemoveRenderAttribute(TextFormattableValue.centeredLargeDotAttribute, this._exchange.exchangeEnvironmentIsDefault);
                break;
            }
            case Exchange.FieldId.SymbologyCode: {
                (value as StringTableValue).data = this._exchange.symbologyCode;
                break;
            }
            case Exchange.FieldId.DefaultLitMarket: {
                const defaultLitMarket = this._exchange.defaultLitMarket;
                (value as StringTableValue).data = defaultLitMarket === undefined ? undefined : defaultLitMarket.zenithCode;
                break;
            }
            case Exchange.FieldId.DefaultTradingMarket: {
                const defaultTradingMarket = this._exchange.defaultTradingMarket;
                (value as StringTableValue).data = defaultTradingMarket === undefined ? undefined : defaultTradingMarket.zenithCode;
                break;
            }
            case Exchange.FieldId.AllowedSymbolNameFieldIds: {
                (value as StringTableValue).data = SymbolField.idArrayToDisplay(this._exchange.allowedSymbolNameFieldIds);
                break;
            }
            case Exchange.FieldId.DefaultSymbolNameFieldId: {
                (value as SymbolFieldIdTableValue).data = this._exchange.defaultSymbolNameFieldId;
                break;
            }
            case Exchange.FieldId.AllowedSymbolSearchFieldIds: {
                (value as StringTableValue).data = SymbolField.idArrayToDisplay(this._exchange.allowedSymbolSearchFieldIds);
                break;
            }
            case Exchange.FieldId.DefaultSymbolSearchFieldIds: {
                (value as StringTableValue).data = SymbolField.idArrayToDisplay(this._exchange.defaultSymbolSearchFieldIds);
                break;
            }
            case Exchange.FieldId.DataMarkets: {
                (value as StringTableValue).data = Market.arrayToZenithCodesCommaText(this._exchange.dataMarkets);
                break;
            }
            case Exchange.FieldId.TradingMarkets: {
                (value as StringTableValue).data = Market.arrayToZenithCodesCommaText(this._exchange.tradingMarkets);
                break;
            }
            default:
                throw new UnreachableCaseError('EETVSLV49110', id);
        }
    }
}
