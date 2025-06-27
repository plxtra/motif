import { AssertInternalError, CommaText, Integer } from '@pbkware/js-utils';
import {
    BooleanTableField,
    EnumTableField,
    FieldDataType,
    FieldDataTypeId,
    NumberTableField,
    NumberTableValue,
    OrderTypeIdTableValue,
    RenderBooleanTableValue,
    StringTableField,
    StringTableValue,
    TableField,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactory,
    TableValue,
    TimeInForceIdTableValue,
    TradingMarket
} from '@plxtra/motif-core';
import { RevHorizontalAlignId } from 'revgrid';

export class TradingMarketTableFieldSourceDefinition extends TableFieldSourceDefinition {
    declare readonly typeId: TradingMarketTableFieldSourceDefinition.TypeId;

    override readonly fieldDefinitions: TableField.Definition[];

    constructor() {
        super(TradingMarketTableFieldSourceDefinition.typeId);

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    isFieldSupported(id: TradingMarket.FieldId) {
        return TradingMarketTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: TradingMarket.FieldId) {
        const sourcelessFieldName = TradingMarket.Field.idToName(id);
        return CommaText.from2Values(this.name, sourcelessFieldName);
    }

    getSupportedFieldNameById(id: TradingMarket.FieldId) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('EETFSDGSFNBI50112', TradingMarket.Field.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }

    private createFieldDefinitions() {
        const count = TradingMarketTableFieldSourceDefinition.Field.count;
        const result = new Array<TableField.Definition>(count);

        for (let fieldIdx = 0; fieldIdx < count; fieldIdx++) {
            const sourcelessFieldName = TradingMarketTableFieldSourceDefinition.Field.getName(fieldIdx);
            const heading = TradingMarketTableFieldSourceDefinition.Field.getHeading(fieldIdx);
            const dataTypeId = TradingMarketTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlignId = FieldDataType.idIsNumber(dataTypeId) ? RevHorizontalAlignId.Right : RevHorizontalAlignId.Left;
            const [fieldConstructor, valueConstructor] =
                TradingMarketTableFieldSourceDefinition.Field.getTableFieldValueConstructors(fieldIdx);

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

export namespace TradingMarketTableFieldSourceDefinition {
    export const typeId = TableFieldSourceDefinition.TypeId.TradingMarket;
    export type TypeId = typeof typeId;

    export namespace Field {
        const unsupportedIds: TradingMarket.FieldId[] = [];
        export const count = TradingMarket.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: TradingMarket.FieldId;
            readonly tableFieldValueConstructors: TableFieldSourceDefinition.TableFieldValueConstructors;
        }

        const infos: Info[] = [
            {
                id: TradingMarket.FieldId.ZenithCode,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: TradingMarket.FieldId.Name,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: TradingMarket.FieldId.Display,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: TradingMarket.FieldId.Lit,
                tableFieldValueConstructors: [BooleanTableField, RenderBooleanTableValue],
            },
            {
                id: TradingMarket.FieldId.DisplayPriority,
                tableFieldValueConstructors: [NumberTableField, NumberTableValue],
            },
            {
                id: TradingMarket.FieldId.Unknown,
                tableFieldValueConstructors: [BooleanTableField, RenderBooleanTableValue],
            },
            {
                id: TradingMarket.FieldId.ExchangeEnvironment,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: TradingMarket.FieldId.ExchangeEnvironmentIsDefault,
                tableFieldValueConstructors: [BooleanTableField, RenderBooleanTableValue],
            },
            {
                id: TradingMarket.FieldId.Exchange,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: TradingMarket.FieldId.SymbologyCode,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: TradingMarket.FieldId.SymbologyExchangeSuffixCode,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: TradingMarket.FieldId.HasSymbologicalCorrespondingDataMarket,
                tableFieldValueConstructors: [BooleanTableField, RenderBooleanTableValue],
            },
            {
                id: TradingMarket.FieldId.Feed,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: TradingMarket.FieldId.Attributes,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: TradingMarket.FieldId.BestLitDataMarket,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: TradingMarket.FieldId.AllowedOrderTypeIds,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: TradingMarket.FieldId.DefaultOrderTypeId,
                tableFieldValueConstructors: [EnumTableField, OrderTypeIdTableValue],
            },
            {
                id: TradingMarket.FieldId.AllowedOrderTimeInForceIds,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: TradingMarket.FieldId.DefaultOrderTimeInForceId,
                tableFieldValueConstructors: [EnumTableField, TimeInForceIdTableValue],
            },
            {
                id: TradingMarket.FieldId.MarketOrderTypeAllowedTimeInForceIds,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: TradingMarket.FieldId.AllowedOrderTriggerTypeIds,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: TradingMarket.FieldId.AllowedOrderTradeTypeIds,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },

        ];

        let idFieldIndices: readonly Integer[];

        export function initialise() {
            const indices = new Array<Integer>(TradingMarket.Field.idCount);
            for (let id = 0; id < TradingMarket.Field.idCount; id++) {
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

        export function isIdSupported(id: TradingMarket.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function indexOfId(id: TradingMarket.FieldId) {
            return idFieldIndices[id];
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return TradingMarket.Field.idToName(infos[fieldIdx].id);
        }

        export function getHeading(fieldIdx: Integer) {
            return TradingMarket.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return TradingMarket.Field.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableFieldValueConstructors(fieldIndex: Integer) {
            return infos[fieldIndex].tableFieldValueConstructors;
        }

        export function getTableValueConstructor(fieldIndex: Integer): TableValue.Constructor {
            const constructors = getTableFieldValueConstructors(fieldIndex);
            return constructors[1];
        }
    }

    export interface FieldId extends TableFieldSourceDefinition.FieldId {
        sourceTypeId: TradingMarketTableFieldSourceDefinition.TypeId;
        id: TradingMarket.FieldId;
    }

    export function get(cachingFactoryService: TableFieldSourceDefinitionCachingFactory): TradingMarketTableFieldSourceDefinition {
        return cachingFactoryService.get(typeId) as TradingMarketTableFieldSourceDefinition;
    }
}

export namespace TradingMarketTableFieldSourceDefinitionModule {
    export function initialiseStatic() {
        TradingMarketTableFieldSourceDefinition.Field.initialise();
    }
}
