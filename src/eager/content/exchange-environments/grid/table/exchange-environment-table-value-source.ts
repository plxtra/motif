import { Integer, MultiEvent, UnreachableCaseError } from '@pbkware/js-utils';
import {
    Exchange,
    ExchangeEnvironment,
    ExchangeEnvironmentZenithCode,
    Market,
    StringTableValue,
    TableValue,
    TableValueSource,
    TextFormattableValue
} from '@plxtra/motif-core';
import { RevRecordValueRecentChangeTypeId } from 'revgrid';
import { ExchangeEnvironmentTableFieldSourceDefinition } from './exchange-environment-table-field-source-definition';

export class ExchangeEnvironmentTableValueSource extends TableValueSource {
    private _fieldsChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(firstFieldIndexOffset: Integer, private readonly _exchangeEnvironment: ExchangeEnvironment) {
        super(firstFieldIndexOffset);
    }

    override activate(): TableValue[] {
        this._fieldsChangedEventSubscriptionId = this._exchangeEnvironment.subscribeFieldValuesChangedEvent(
            (changedFieldIds) => { this.handleValuesChangedEvent(changedFieldIds); }
        );

        this.initialiseBeenIncubated(true);

        return this.getAllValues();
    }

    override deactivate() {
        if (this._fieldsChangedEventSubscriptionId !== undefined) {
            this._exchangeEnvironment.unsubscribeFieldValuesChangedEvent(this._fieldsChangedEventSubscriptionId);
            this._fieldsChangedEventSubscriptionId = undefined;
        }
    }

    getAllValues(): TableValue[] {
        const fieldCount = ExchangeEnvironmentTableFieldSourceDefinition.Field.count;
        const result = new Array<TableValue>(fieldCount);
        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableValue(fieldIdx);
            const fieldId = ExchangeEnvironmentTableFieldSourceDefinition.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getfieldCount(): Integer {
        return ExchangeEnvironmentTableFieldSourceDefinition.Field.count;
    }

    private handleValuesChangedEvent(changedFieldIds: readonly ExchangeEnvironment.FieldId[]) {
        const changeCount = changedFieldIds.length;
        const valueChanges = new Array<TableValueSource.ValueChange>(changeCount);
        let foundCount = 0;
        for (let i = 0; i < changeCount; i++) {
            const fieldId = changedFieldIds[i];
            const fieldIndex = ExchangeEnvironmentTableFieldSourceDefinition.Field.indexOfId(fieldId);
            if (fieldIndex >= 0) {
                const newValue = this.createTableValue(fieldIndex);
                this.loadValue(fieldId, newValue);
                valueChanges[foundCount++] = { fieldIndex, newValue, recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update };
            }
        }

        this.notifyValueChangesEvent(valueChanges);
    }

    private createTableValue(fieldIdx: Integer) {
        const valueConstructor = ExchangeEnvironmentTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: ExchangeEnvironment.FieldId, value: TableValue) {
        switch (id) {
            case ExchangeEnvironment.FieldId.ZenithCode: {
                (value as StringTableValue).data = ExchangeEnvironmentZenithCode.createDisplay(this._exchangeEnvironment.zenithCode);
                break;
            }
            case ExchangeEnvironment.FieldId.Display: {
                (value as StringTableValue).data = this._exchangeEnvironment.display;
                break;
            }
            case ExchangeEnvironment.FieldId.Production: {
                value.addOrRemoveRenderAttribute(TextFormattableValue.centeredLargeDotAttribute, this._exchangeEnvironment.production);
                break;
            }
            case ExchangeEnvironment.FieldId.Unknown: {
                value.addOrRemoveRenderAttribute(TextFormattableValue.centeredLargeDotAttribute, this._exchangeEnvironment.unknown);
                break;
            }
            case ExchangeEnvironment.FieldId.Exchanges: {
                (value as StringTableValue).data = Exchange.arrayToAbbreviatedDisplaysCommaText(this._exchangeEnvironment.exchanges);
                break;
            }
            case ExchangeEnvironment.FieldId.DataMarkets: {
                (value as StringTableValue).data = Market.arrayToZenithCodesCommaText(this._exchangeEnvironment.dataMarkets);
                break;
            }
            case ExchangeEnvironment.FieldId.TradingMarkets: {
                (value as StringTableValue).data = Market.arrayToZenithCodesCommaText(this._exchangeEnvironment.tradingMarkets);
                break;
            }
            default:
                throw new UnreachableCaseError('EETVSLV49110', id);
        }
    }
}
