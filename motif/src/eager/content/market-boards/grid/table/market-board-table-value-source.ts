import { Integer, MultiEvent, UnreachableCaseError } from '@pbkware/js-utils';
import {
    MarketBoard,
    StringTableValue,
    TableValue,
    TableValueSource,
    TextFormattableValue,
    TradingStateAllowIdArrayTableValue,
    TradingStateReasonIdTableValue
} from '@plxtra/motif-core';
import { RevRecordValueRecentChangeTypeId } from 'revgrid';
import { MarketBoardTableFieldSourceDefinition } from './market-board-table-field-source-definition';

export class MarketBoardTableValueSource extends TableValueSource {
    private _fieldsChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(firstFieldIndexOffset: Integer, private readonly _marketBoard: MarketBoard) {
        super(firstFieldIndexOffset);
    }

    override activate(): TableValue[] {
        this._fieldsChangedEventSubscriptionId = this._marketBoard.subscribeFieldValuesChangedEvent(
            (changedFieldIds) => { this.handleValuesChangedEvent(changedFieldIds); }
        );

        this.initialiseBeenIncubated(true);

        return this.getAllValues();
    }

    override deactivate() {
        if (this._fieldsChangedEventSubscriptionId !== undefined) {
            this._marketBoard.unsubscribeFieldValuesChangedEvent(this._fieldsChangedEventSubscriptionId);
            this._fieldsChangedEventSubscriptionId = undefined;
        }
    }

    getAllValues(): TableValue[] {
        const fieldCount = MarketBoardTableFieldSourceDefinition.Field.count;
        const result = new Array<TableValue>(fieldCount);
        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableValue(fieldIdx);
            const fieldId = MarketBoardTableFieldSourceDefinition.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getfieldCount(): Integer {
        return MarketBoardTableFieldSourceDefinition.Field.count;
    }

    private handleValuesChangedEvent(changedFieldIds: readonly MarketBoard.FieldId[]) {
        const changeCount = changedFieldIds.length;
        const valueChanges = new Array<TableValueSource.ValueChange>(changeCount);
        let foundCount = 0;
        for (let i = 0; i < changeCount; i++) {
            const fieldId = changedFieldIds[i];
            const fieldIndex = MarketBoardTableFieldSourceDefinition.Field.indexOfId(fieldId);
            if (fieldIndex >= 0) {
                const newValue = this.createTableValue(fieldIndex);
                this.loadValue(fieldId, newValue);
                valueChanges[foundCount++] = { fieldIndex, newValue, recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update };
            }
        }

        this.notifyValueChangesEvent(valueChanges);
    }

    private createTableValue(fieldIdx: Integer) {
        const valueConstructor = MarketBoardTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: MarketBoard.FieldId, value: TableValue) {
        switch (id) {
            case MarketBoard.FieldId.ZenithCode: {
                (value as StringTableValue).data = this._marketBoard.zenithCode;
                break;
            }
            case MarketBoard.FieldId.Name: {
                (value as StringTableValue).data = this._marketBoard.name;
                break;
            }
            case MarketBoard.FieldId.Display: {
                (value as StringTableValue).data = this._marketBoard.display;
                break;
            }
            case MarketBoard.FieldId.Unknown: {
                value.addOrRemoveRenderAttribute(TextFormattableValue.centeredLargeDotAttribute, this._marketBoard.unknown);
                break;
            }
            case MarketBoard.FieldId.Market: {
                (value as StringTableValue).data = this._marketBoard.market.zenithCode;
                break;
            }
            case MarketBoard.FieldId.FeedInitialising: {
                value.addOrRemoveRenderAttribute(TextFormattableValue.centeredLargeDotAttribute, this._marketBoard.feedInitialising);
                break;
            }
            case MarketBoard.FieldId.Status: {
                (value as StringTableValue).data = this._marketBoard.status;
                break;
            }
            case MarketBoard.FieldId.AllowIds: {
                (value as TradingStateAllowIdArrayTableValue).data = this._marketBoard.allowIds;
                break;
            }
            case MarketBoard.FieldId.ReasonId: {
                (value as TradingStateReasonIdTableValue).data = this._marketBoard.reasonId;
                break;
            }
            default:
                throw new UnreachableCaseError('EETVSLV49110', id);
        }
    }
}
