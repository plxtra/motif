import { AssertInternalError, CommaText, Integer } from '@pbkware/js-utils';
import {
    BooleanTableField,
    EnumTableField,
    FieldDataType,
    FieldDataTypeId,
    IntegerArrayTableField,
    MarketBoard,
    RenderBooleanTableValue,
    StringTableField,
    StringTableValue,
    TableField,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactory,
    TableValue,
    TradingStateAllowIdArrayTableValue,
    TradingStateReasonIdTableValue
} from '@plxtra/motif-core';
import { RevHorizontalAlignId } from 'revgrid';

export class MarketBoardTableFieldSourceDefinition extends TableFieldSourceDefinition {
    declare readonly typeId: MarketBoardTableFieldSourceDefinition.TypeId;

    override readonly fieldDefinitions: TableField.Definition[];

    constructor() {
        super(MarketBoardTableFieldSourceDefinition.typeId);

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    isFieldSupported(id: MarketBoard.FieldId) {
        return MarketBoardTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: MarketBoard.FieldId) {
        const sourcelessFieldName = MarketBoard.Field.idToName(id);
        return CommaText.from2Values(this.name, sourcelessFieldName);
    }

    getSupportedFieldNameById(id: MarketBoard.FieldId) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('EETFSDGSFNBI50112', MarketBoard.Field.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }

    private createFieldDefinitions() {
        const count = MarketBoardTableFieldSourceDefinition.Field.count;
        const result = new Array<TableField.Definition>(count);

        for (let fieldIdx = 0; fieldIdx < count; fieldIdx++) {
            const sourcelessFieldName = MarketBoardTableFieldSourceDefinition.Field.getName(fieldIdx);
            const heading = MarketBoardTableFieldSourceDefinition.Field.getHeading(fieldIdx);
            const dataTypeId = MarketBoardTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlignId = FieldDataType.idIsNumber(dataTypeId) ? RevHorizontalAlignId.Right : RevHorizontalAlignId.Left;
            const [fieldConstructor, valueConstructor] =
                MarketBoardTableFieldSourceDefinition.Field.getTableFieldValueConstructors(fieldIdx);

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

export namespace MarketBoardTableFieldSourceDefinition {
    export const typeId = TableFieldSourceDefinition.TypeId.MarketBoard;
    export type TypeId = typeof typeId;

    export namespace Field {
        const unsupportedIds: MarketBoard.FieldId[] = [];
        export const count = MarketBoard.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: MarketBoard.FieldId;
            readonly tableFieldValueConstructors: TableFieldSourceDefinition.TableFieldValueConstructors;
        }

        const infos: Info[] = [
            {
                id: MarketBoard.FieldId.ZenithCode,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: MarketBoard.FieldId.Name,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: MarketBoard.FieldId.Display,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: MarketBoard.FieldId.Unknown,
                tableFieldValueConstructors: [BooleanTableField, RenderBooleanTableValue],
            },
            {
                id: MarketBoard.FieldId.Market,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: MarketBoard.FieldId.FeedInitialising,
                tableFieldValueConstructors: [BooleanTableField, RenderBooleanTableValue],
            },
            {
                id: MarketBoard.FieldId.Status,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: MarketBoard.FieldId.AllowIds,
                tableFieldValueConstructors: [IntegerArrayTableField, TradingStateAllowIdArrayTableValue],
            },
            {
                id: MarketBoard.FieldId.ReasonId,
                tableFieldValueConstructors: [EnumTableField, TradingStateReasonIdTableValue],
            },
        ];

        let idFieldIndices: readonly Integer[];

        export function initialise() {
            const indices = new Array<Integer>(MarketBoard.Field.idCount);
            for (let id = 0; id < MarketBoard.Field.idCount; id++) {
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

        export function isIdSupported(id: MarketBoard.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function indexOfId(id: MarketBoard.FieldId) {
            return idFieldIndices[id];
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return MarketBoard.Field.idToName(infos[fieldIdx].id);
        }

        export function getHeading(fieldIdx: Integer) {
            return MarketBoard.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return MarketBoard.Field.idToFieldDataTypeId(infos[fieldIdx].id);
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
        sourceTypeId: MarketBoardTableFieldSourceDefinition.TypeId;
        id: MarketBoard.FieldId;
    }

    export function get(cachingFactoryService: TableFieldSourceDefinitionCachingFactory): MarketBoardTableFieldSourceDefinition {
        return cachingFactoryService.get(typeId) as MarketBoardTableFieldSourceDefinition;
    }
}

export namespace MarketBoardTableFieldSourceDefinitionModule {
    export function initialiseStatic() {
        MarketBoardTableFieldSourceDefinition.Field.initialise();
    }
}
