import {
    AssertInternalError,
    CommaText,
    Integer,
} from '@pbkware/js-utils';
import {
    BooleanCorrectnessTableField,
    CorrectnessTableValue,
    DataMarket,
    EnumCorrectnessTableField,
    FeedStatusIdCorrectnessTableValue,
    FieldDataType,
    FieldDataTypeId,
    IntegerArrayCorrectnessTableField,
    NumberCorrectnessTableField,
    NumberCorrectnessTableValue,
    RenderBooleanCorrectnessTableValue,
    SourceTzOffsetDateCorrectnessTableField,
    SourceTzOffsetDateCorrectnessTableValue,
    SourceTzOffsetDateTimeCorrectnessTableField,
    SourceTzOffsetDateTimeCorrectnessTableValue,
    StringCorrectnessTableField,
    StringCorrectnessTableValue,
    TableField,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactory,
    TradingStateAllowIdArrayCorrectnessTableValue,
    TradingStateReasonIdCorrectnessTableValue
} from '@plxtra/motif-core';
import { RevHorizontalAlignId } from 'revgrid';

export class DataMarketTableFieldSourceDefinition extends TableFieldSourceDefinition {
    declare readonly typeId: DataMarketTableFieldSourceDefinition.TypeId;

    override readonly fieldDefinitions: TableField.Definition[];

    constructor() {
        super(DataMarketTableFieldSourceDefinition.typeId);

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    isFieldSupported(id: DataMarket.FieldId) {
        return DataMarketTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: DataMarket.FieldId) {
        const sourcelessFieldName = DataMarket.Field.idToName(id);
        return CommaText.from2Values(this.name, sourcelessFieldName);
    }

    getSupportedFieldNameById(id: DataMarket.FieldId) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('EETFSDGSFNBI50112', DataMarket.Field.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }

    private createFieldDefinitions() {
        const count = DataMarketTableFieldSourceDefinition.Field.count;
        const result = new Array<TableField.Definition>(count);

        for (let fieldIdx = 0; fieldIdx < count; fieldIdx++) {
            const sourcelessFieldName = DataMarketTableFieldSourceDefinition.Field.getName(fieldIdx);
            const heading = DataMarketTableFieldSourceDefinition.Field.getHeading(fieldIdx);
            const dataTypeId = DataMarketTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlignId = FieldDataType.idIsNumber(dataTypeId) ? RevHorizontalAlignId.Right : RevHorizontalAlignId.Left;
            const [fieldConstructor, valueConstructor] =
                DataMarketTableFieldSourceDefinition.Field.getTableFieldValueConstructors(fieldIdx);

            result[fieldIdx] = new TableField.Definition(
                this,
                sourcelessFieldName,
                heading,
                textAlignId,
                fieldConstructor,
                valueConstructor,
            );
        }

        return result;
    }
}

export namespace DataMarketTableFieldSourceDefinition {
    export const typeId = TableFieldSourceDefinition.TypeId.DataMarket;
    export type TypeId = typeof typeId;

    export namespace Field {
        const unsupportedIds: DataMarket.FieldId[] = [];
        export const count = DataMarket.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: DataMarket.FieldId;
            readonly tableFieldValueConstructors: TableFieldSourceDefinition.CorrectnessTableGridConstructors;
        }

        const infos: Info[] = [
            {
                id: DataMarket.FieldId.ZenithCode,
                tableFieldValueConstructors: [StringCorrectnessTableField, StringCorrectnessTableValue],
            },
            {
                id: DataMarket.FieldId.Name,
                tableFieldValueConstructors: [StringCorrectnessTableField, StringCorrectnessTableValue],
            },
            {
                id: DataMarket.FieldId.Display,
                tableFieldValueConstructors: [StringCorrectnessTableField, StringCorrectnessTableValue],
            },
            {
                id: DataMarket.FieldId.Lit,
                tableFieldValueConstructors: [BooleanCorrectnessTableField, RenderBooleanCorrectnessTableValue],
            },
            {
                id: DataMarket.FieldId.DisplayPriority,
                tableFieldValueConstructors: [NumberCorrectnessTableField, NumberCorrectnessTableValue],
            },
            {
                id: DataMarket.FieldId.Unknown,
                tableFieldValueConstructors: [BooleanCorrectnessTableField, RenderBooleanCorrectnessTableValue],
            },
            {
                id: DataMarket.FieldId.ExchangeEnvironment,
                tableFieldValueConstructors: [StringCorrectnessTableField, StringCorrectnessTableValue],
            },
            {
                id: DataMarket.FieldId.ExchangeEnvironmentIsDefault,
                tableFieldValueConstructors: [BooleanCorrectnessTableField, RenderBooleanCorrectnessTableValue],
            },
            {
                id: DataMarket.FieldId.Exchange,
                tableFieldValueConstructors: [StringCorrectnessTableField, StringCorrectnessTableValue],
            },
            {
                id: DataMarket.FieldId.SymbologyCode,
                tableFieldValueConstructors: [StringCorrectnessTableField, StringCorrectnessTableValue],
            },
            {
                id: DataMarket.FieldId.SymbologyExchangeSuffixCode,
                tableFieldValueConstructors: [StringCorrectnessTableField, StringCorrectnessTableValue],
            },
            {
                id: DataMarket.FieldId.BestTradingMarket,
                tableFieldValueConstructors: [StringCorrectnessTableField, StringCorrectnessTableValue],
            },
            {
                id: DataMarket.FieldId.BestLitForTradingMarkets,
                tableFieldValueConstructors: [StringCorrectnessTableField, StringCorrectnessTableValue],
            },
            {
                id: DataMarket.FieldId.MarketBoards,
                tableFieldValueConstructors: [StringCorrectnessTableField, StringCorrectnessTableValue],
            },
            {
                id: DataMarket.FieldId.FeedStatusId,
                tableFieldValueConstructors: [EnumCorrectnessTableField, FeedStatusIdCorrectnessTableValue],
            },
            {
                id: DataMarket.FieldId.TradingDate,
                tableFieldValueConstructors: [SourceTzOffsetDateCorrectnessTableField, SourceTzOffsetDateCorrectnessTableValue],
            },
            {
                id: DataMarket.FieldId.MarketTime,
                tableFieldValueConstructors: [SourceTzOffsetDateTimeCorrectnessTableField, SourceTzOffsetDateTimeCorrectnessTableValue],
            },
            {
                id: DataMarket.FieldId.Status,
                tableFieldValueConstructors: [StringCorrectnessTableField, StringCorrectnessTableValue],
            },
            {
                id: DataMarket.FieldId.AllowIds,
                tableFieldValueConstructors: [IntegerArrayCorrectnessTableField, TradingStateAllowIdArrayCorrectnessTableValue],
            },
            {
                id: DataMarket.FieldId.ReasonId,
                tableFieldValueConstructors: [EnumCorrectnessTableField, TradingStateReasonIdCorrectnessTableValue],
            },
        ];

        let idFieldIndices: readonly Integer[];

        export function initialise() {
            const indices = new Array<Integer>(DataMarket.Field.idCount);
            for (let id = 0; id < DataMarket.Field.idCount; id++) {
                indices[id] = -1;
            }

            for (let fieldIndex = 0; fieldIndex < count; fieldIndex++) {
                const id = infos[fieldIndex].id;
                if (unsupportedIds.includes(id)) {
                    throw new AssertInternalError('EETFSDFIIU42422', fieldIndex.toString());
                } else {
                    if (indices[id] !== -1) {
                        throw new AssertInternalError('EETFSDFIID42422', fieldIndex.toString()); // duplicate
                    } else {
                        indices[id] = fieldIndex;
                    }
                }
            }

            idFieldIndices = indices;
        }

        export function isIdSupported(id: DataMarket.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function indexOfId(id: DataMarket.FieldId) {
            return idFieldIndices[id];
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return DataMarket.Field.idToName(infos[fieldIdx].id);
        }

        export function getHeading(fieldIdx: Integer) {
            return DataMarket.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return DataMarket.Field.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableFieldValueConstructors(fieldIndex: Integer) {
            return infos[fieldIndex].tableFieldValueConstructors;
        }

        export function getTableValueConstructor(fieldIndex: Integer): CorrectnessTableValue.Constructor {
            const constructors = getTableFieldValueConstructors(fieldIndex);
            return constructors[1];
        }
    }

    export interface FieldId extends TableFieldSourceDefinition.FieldId {
        sourceTypeId: DataMarketTableFieldSourceDefinition.TypeId;
        id: DataMarket.FieldId;
    }

    export function get(cachingFactoryService: TableFieldSourceDefinitionCachingFactory): DataMarketTableFieldSourceDefinition {
        return cachingFactoryService.get(typeId) as DataMarketTableFieldSourceDefinition;
    }
}

DataMarketTableFieldSourceDefinition.Field.initialise();
