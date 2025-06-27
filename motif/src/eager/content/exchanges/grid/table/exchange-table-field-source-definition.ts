import {
    AssertInternalError,
    CommaText,
    Integer,
} from '@pbkware/js-utils';
import {
    BooleanTableField,
    EnumTableField,
    Exchange,
    FieldDataType,
    FieldDataTypeId,
    NumberTableField,
    NumberTableValue,
    RenderBooleanTableValue,
    StringTableField,
    StringTableValue,
    SymbolFieldIdTableValue,
    TableField,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactory,
    TableValue
} from '@plxtra/motif-core';
import { RevHorizontalAlignId } from 'revgrid';

export class ExchangeTableFieldSourceDefinition extends TableFieldSourceDefinition {
    declare readonly typeId: ExchangeTableFieldSourceDefinition.TypeId;

    override readonly fieldDefinitions: TableField.Definition[];

    constructor() {
        super(ExchangeTableFieldSourceDefinition.typeId);

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    isFieldSupported(id: Exchange.FieldId) {
        return ExchangeTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: Exchange.FieldId) {
        const sourcelessFieldName = Exchange.Field.idToName(id);
        return CommaText.from2Values(this.name, sourcelessFieldName);
    }

    getSupportedFieldNameById(id: Exchange.FieldId) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('EETFSDGSFNBI50112', Exchange.Field.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }

    private createFieldDefinitions() {
        const count = ExchangeTableFieldSourceDefinition.Field.count;
        const result = new Array<TableField.Definition>(count);

        for (let fieldIdx = 0; fieldIdx < count; fieldIdx++) {
            const sourcelessFieldName = ExchangeTableFieldSourceDefinition.Field.getName(fieldIdx);
            const heading = ExchangeTableFieldSourceDefinition.Field.getHeading(fieldIdx);
            const dataTypeId = ExchangeTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlignId = FieldDataType.idIsNumber(dataTypeId) ? RevHorizontalAlignId.Right : RevHorizontalAlignId.Left;
            const [fieldConstructor, valueConstructor] =
                ExchangeTableFieldSourceDefinition.Field.getTableFieldValueConstructors(fieldIdx);

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

export namespace ExchangeTableFieldSourceDefinition {
    export const typeId = TableFieldSourceDefinition.TypeId.Exchange;
    export type TypeId = typeof typeId;

    export namespace Field {
        const unsupportedIds: Exchange.FieldId[] = [];
        export const count = Exchange.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: Exchange.FieldId;
            readonly tableFieldValueConstructors: TableFieldSourceDefinition.TableFieldValueConstructors;
        }

        const infos: Info[] = [
            {
                id: Exchange.FieldId.ZenithCode,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: Exchange.FieldId.UnenvironmentedZenithCode,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: Exchange.FieldId.AbbreviatedDisplay,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: Exchange.FieldId.FullDisplay,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: Exchange.FieldId.DisplayPriority,
                tableFieldValueConstructors: [NumberTableField, NumberTableValue],
            },
            {
                id: Exchange.FieldId.Unknown,
                tableFieldValueConstructors: [BooleanTableField, RenderBooleanTableValue],
            },
            {
                id: Exchange.FieldId.IsDefaultDefault,
                tableFieldValueConstructors: [BooleanTableField, RenderBooleanTableValue],
            },
            {
                id: Exchange.FieldId.ExchangeEnvironment,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: Exchange.FieldId.ExchangeEnvironmentIsDefault,
                tableFieldValueConstructors: [BooleanTableField, RenderBooleanTableValue],
            },
            {
                id: Exchange.FieldId.SymbologyCode,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: Exchange.FieldId.DefaultLitMarket,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: Exchange.FieldId.DefaultTradingMarket,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: Exchange.FieldId.AllowedSymbolNameFieldIds,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: Exchange.FieldId.DefaultSymbolNameFieldId,
                tableFieldValueConstructors: [EnumTableField, SymbolFieldIdTableValue],
            },
            {
                id: Exchange.FieldId.AllowedSymbolSearchFieldIds,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: Exchange.FieldId.DefaultSymbolSearchFieldIds,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: Exchange.FieldId.DataMarkets,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: Exchange.FieldId.TradingMarkets,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
        ];

        let idFieldIndices: readonly Integer[];

        export function initialise() {
            const indices = new Array<Integer>(Exchange.Field.idCount);
            for (let id = 0; id < Exchange.Field.idCount; id++) {
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

        export function isIdSupported(id: Exchange.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function indexOfId(id: Exchange.FieldId) {
            return idFieldIndices[id];
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return Exchange.Field.idToName(infos[fieldIdx].id);
        }

        export function getHeading(fieldIdx: Integer) {
            return Exchange.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return Exchange.Field.idToFieldDataTypeId(infos[fieldIdx].id);
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
        sourceTypeId: ExchangeTableFieldSourceDefinition.TypeId;
        id: Exchange.FieldId;
    }

    export function get(cachingFactoryService: TableFieldSourceDefinitionCachingFactory): ExchangeTableFieldSourceDefinition {
        return cachingFactoryService.get(typeId) as ExchangeTableFieldSourceDefinition;
    }
}

export namespace ExchangeTableFieldSourceDefinitionModule {
    export function initialiseStatic() {
        ExchangeTableFieldSourceDefinition.Field.initialise();
    }
}
