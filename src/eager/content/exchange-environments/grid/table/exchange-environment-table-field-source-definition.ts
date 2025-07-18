import {
    AssertInternalError,
    CommaText,
    Integer,
} from '@pbkware/js-utils';
import {
    BooleanTableField,
    ExchangeEnvironment,
    FieldDataType,
    FieldDataTypeId,
    RenderBooleanTableValue,
    StringTableField,
    StringTableValue,
    TableField,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactory,
    TableValue
} from '@plxtra/motif-core';
import { RevHorizontalAlignId } from 'revgrid';

export class ExchangeEnvironmentTableFieldSourceDefinition extends TableFieldSourceDefinition {
    declare readonly typeId: ExchangeEnvironmentTableFieldSourceDefinition.TypeId;

    override readonly fieldDefinitions: TableField.Definition[];

    constructor() {
        super(ExchangeEnvironmentTableFieldSourceDefinition.typeId);

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    isFieldSupported(id: ExchangeEnvironment.FieldId) {
        return ExchangeEnvironmentTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: ExchangeEnvironment.FieldId) {
        const sourcelessFieldName = ExchangeEnvironment.Field.idToName(id);
        return CommaText.from2Values(this.name, sourcelessFieldName);
    }

    getSupportedFieldNameById(id: ExchangeEnvironment.FieldId) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('EETFSDGSFNBI50112', ExchangeEnvironment.Field.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }

    private createFieldDefinitions() {
        const count = ExchangeEnvironmentTableFieldSourceDefinition.Field.count;
        const result = new Array<TableField.Definition>(count);

        for (let fieldIdx = 0; fieldIdx < count; fieldIdx++) {
            const sourcelessFieldName = ExchangeEnvironmentTableFieldSourceDefinition.Field.getName(fieldIdx);
            const heading = ExchangeEnvironmentTableFieldSourceDefinition.Field.getHeading(fieldIdx);
            const dataTypeId = ExchangeEnvironmentTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlignId = FieldDataType.idIsNumber(dataTypeId) ? RevHorizontalAlignId.Right : RevHorizontalAlignId.Left;
            const [fieldConstructor, valueConstructor] =
                ExchangeEnvironmentTableFieldSourceDefinition.Field.getTableFieldValueConstructors(fieldIdx);

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

export namespace ExchangeEnvironmentTableFieldSourceDefinition {
    export const typeId = TableFieldSourceDefinition.TypeId.ExchangeEnvironment;
    export type TypeId = typeof typeId;

    export namespace Field {
        const unsupportedIds: ExchangeEnvironment.FieldId[] = [];
        export const count = ExchangeEnvironment.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: ExchangeEnvironment.FieldId;
            readonly tableFieldValueConstructors: TableFieldSourceDefinition.TableFieldValueConstructors;
        }

        const infos: Info[] = [
            {
                id: ExchangeEnvironment.FieldId.ZenithCode,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: ExchangeEnvironment.FieldId.Display,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: ExchangeEnvironment.FieldId.Production,
                tableFieldValueConstructors: [BooleanTableField, RenderBooleanTableValue],
            },
            {
                id: ExchangeEnvironment.FieldId.Unknown,
                tableFieldValueConstructors: [BooleanTableField, RenderBooleanTableValue],
            },
            {
                id: ExchangeEnvironment.FieldId.Exchanges,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: ExchangeEnvironment.FieldId.DataMarkets,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: ExchangeEnvironment.FieldId.TradingMarkets,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
        ];

        let idFieldIndices: readonly Integer[];

        export function initialise() {
            const indices = new Array<Integer>(ExchangeEnvironment.Field.idCount);
            for (let id = 0; id < ExchangeEnvironment.Field.idCount; id++) {
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

        export function isIdSupported(id: ExchangeEnvironment.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function indexOfId(id: ExchangeEnvironment.FieldId) {
            return idFieldIndices[id];
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return ExchangeEnvironment.Field.idToName(infos[fieldIdx].id);
        }

        export function getHeading(fieldIdx: Integer) {
            return ExchangeEnvironment.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return ExchangeEnvironment.Field.idToFieldDataTypeId(infos[fieldIdx].id);
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
        sourceTypeId: ExchangeEnvironmentTableFieldSourceDefinition.TypeId;
        id: ExchangeEnvironment.FieldId;
    }

    export function get(cachingFactoryService: TableFieldSourceDefinitionCachingFactory): ExchangeEnvironmentTableFieldSourceDefinition {
        return cachingFactoryService.get(typeId) as ExchangeEnvironmentTableFieldSourceDefinition;
    }
}

export namespace ExchangeEnvironmentTableFieldSourceDefinitionModule {
    export function initialiseStatic() {
        ExchangeEnvironmentTableFieldSourceDefinition.Field.initialise();
    }
}
