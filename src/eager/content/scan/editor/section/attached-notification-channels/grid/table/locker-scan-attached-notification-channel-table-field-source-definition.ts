import { AssertInternalError, CommaText, Integer } from '@pbkware/js-utils';
import {
    BooleanTableField,
    EnumTableField,
    FieldDataType,
    FieldDataTypeId,
    LockerScanAttachedNotificationChannel,
    NotificationChannelSourceSettingsUrgencyIdTableValue,
    NumberTableField,
    NumberTableValue,
    StringTableField,
    StringTableValue,
    TableField,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactory,
    TableValue,
    ValidTableValue
} from '@plxtra/motif-core';
import { RevHorizontalAlignId } from 'revgrid';

export class LockerScanAttachedNotificationChannelTableFieldSourceDefinition extends TableFieldSourceDefinition {
    declare readonly typeId: LockerScanAttachedNotificationChannelTableFieldSourceDefinition.TypeId;

    override readonly fieldDefinitions: TableField.Definition[];

    constructor() {
        super(LockerScanAttachedNotificationChannelTableFieldSourceDefinition.typeId);

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    isFieldSupported(id: LockerScanAttachedNotificationChannel.FieldId) {
        return LockerScanAttachedNotificationChannelTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: LockerScanAttachedNotificationChannel.FieldId) {
        const sourcelessFieldName = LockerScanAttachedNotificationChannel.Field.idToName(id);
        return CommaText.from2Values(this.name, sourcelessFieldName);
    }

    getSupportedFieldNameById(id: LockerScanAttachedNotificationChannel.FieldId) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('STFSDGSFNBI30398', LockerScanAttachedNotificationChannel.Field.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }

    private createFieldDefinitions() {
        const count = LockerScanAttachedNotificationChannelTableFieldSourceDefinition.Field.count;
        const result = new Array<TableField.Definition>(count);

        for (let fieldIdx = 0; fieldIdx < count; fieldIdx++) {
            const sourcelessFieldName = LockerScanAttachedNotificationChannelTableFieldSourceDefinition.Field.getName(fieldIdx);
            const heading = LockerScanAttachedNotificationChannelTableFieldSourceDefinition.Field.getHeading(fieldIdx);
            const dataTypeId = LockerScanAttachedNotificationChannelTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlignId = FieldDataType.idIsNumber(dataTypeId) ? RevHorizontalAlignId.Right : RevHorizontalAlignId.Left;
            const [fieldConstructor, valueConstructor] =
                LockerScanAttachedNotificationChannelTableFieldSourceDefinition.Field.getTableFieldValueConstructors(fieldIdx);

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

export namespace LockerScanAttachedNotificationChannelTableFieldSourceDefinition {
    export const typeId = TableFieldSourceDefinition.TypeId.LockerScanAttachedNotificationChannel;
    export type TypeId = typeof typeId;

    export namespace Field {
        const unsupportedIds: LockerScanAttachedNotificationChannel.FieldId[] = [
            LockerScanAttachedNotificationChannel.FieldId.Topic,
        ];
        export const count = LockerScanAttachedNotificationChannel.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: LockerScanAttachedNotificationChannel.FieldId;
            readonly tableFieldValueConstructors: TableFieldSourceDefinition.TableFieldValueConstructors;
        }

        const infos: Info[] = [
            {
                id: LockerScanAttachedNotificationChannel.FieldId.ChannelId,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: LockerScanAttachedNotificationChannel.FieldId.Valid,
                tableFieldValueConstructors: [BooleanTableField, ValidTableValue],
            },
            {
                id: LockerScanAttachedNotificationChannel.FieldId.Name,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: LockerScanAttachedNotificationChannel.FieldId.CultureCode,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: LockerScanAttachedNotificationChannel.FieldId.MinimumStable,
                tableFieldValueConstructors: [NumberTableField, NumberTableValue],
            },
            {
                id: LockerScanAttachedNotificationChannel.FieldId.MinimumElapsed,
                tableFieldValueConstructors: [NumberTableField, NumberTableValue],
            },
            {
                id: LockerScanAttachedNotificationChannel.FieldId.Ttl,
                tableFieldValueConstructors: [NumberTableField, NumberTableValue],
            },
            {
                id: LockerScanAttachedNotificationChannel.FieldId.Urgency,
                tableFieldValueConstructors: [EnumTableField, NotificationChannelSourceSettingsUrgencyIdTableValue],
            },
        ];

        let idFieldIndices: readonly Integer[];

        export function initialise() {
            const indices = new Array<Integer>(LockerScanAttachedNotificationChannel.Field.idCount);
            for (let id = 0; id < LockerScanAttachedNotificationChannel.Field.idCount; id++) {
                indices[id] = -1;
            }

            for (let fieldIndex = 0; fieldIndex < count; fieldIndex++) {
                const id = infos[fieldIndex].id;
                if (unsupportedIds.includes(id)) {
                    throw new AssertInternalError('STFSDFII42422', fieldIndex.toString());
                } else {
                    if (indices[id] !== -1) {
                        throw new AssertInternalError('STFSDFID42422', fieldIndex.toString()); // duplicate
                    } else {
                        indices[id] = fieldIndex;
                    }
                }
            }

            idFieldIndices = indices;
        }

        export function isIdSupported(id: LockerScanAttachedNotificationChannel.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function indexOfId(id: LockerScanAttachedNotificationChannel.FieldId) {
            return idFieldIndices[id];
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return LockerScanAttachedNotificationChannel.Field.idToName(infos[fieldIdx].id);
        }

        export function getHeading(fieldIdx: Integer) {
            return LockerScanAttachedNotificationChannel.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return LockerScanAttachedNotificationChannel.Field.idToFieldDataTypeId(infos[fieldIdx].id);
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
        sourceTypeId: LockerScanAttachedNotificationChannelTableFieldSourceDefinition.TypeId;
        id: LockerScanAttachedNotificationChannel.FieldId;
    }

    export function get(cachingFactoryService: TableFieldSourceDefinitionCachingFactory): LockerScanAttachedNotificationChannelTableFieldSourceDefinition {
        return cachingFactoryService.get(typeId) as LockerScanAttachedNotificationChannelTableFieldSourceDefinition;
    }
}

LockerScanAttachedNotificationChannelTableFieldSourceDefinition.Field.initialise();
