import { PickEnum } from '@pbkware/js-utils';
import {
    BadnessComparableList,
    BadnessListTableRecordSourceDefinition,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactory,
    TableRecordSourceDefinition
} from '@plxtra/motif-core';
import { RevColumnLayoutDefinition, RevSourcedFieldCustomHeadings } from 'revgrid';
import { ScanFieldEditorFrame } from '../../field/internal-api';
import { ScanFieldEditorFrameTableFieldSourceDefinition } from './scan-field-editor-frame-table-field-source-definition';

export class ScanFieldEditorFrameComparableListTableRecordSourceDefinition extends BadnessListTableRecordSourceDefinition<ScanFieldEditorFrame> {
    declare list: BadnessComparableList<ScanFieldEditorFrame>;

    constructor(
        customHeadingsService: RevSourcedFieldCustomHeadings | undefined,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        list: BadnessComparableList<ScanFieldEditorFrame>,
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactory,
            TableRecordSourceDefinition.TypeId.ScanFieldEditorFrame,
            ScanFieldEditorFrameComparableListTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
            list,
        );
    }

    override createDefaultLayoutDefinition(): RevColumnLayoutDefinition {
        const scanFieldEditorFrameFieldSourceDefinition = ScanFieldEditorFrameTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactory);

        const fieldNames = new Array<string>();

        fieldNames.push(scanFieldEditorFrameFieldSourceDefinition.getFieldNameById(ScanFieldEditorFrame.FieldId.Name));

        return RevColumnLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

/** @public */
export namespace ScanFieldEditorFrameComparableListTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.ScanFieldEditorFrame
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.ScanFieldEditorFrame
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.ScanFieldEditorFrame
    ];

    export type FieldId = ScanFieldEditorFrameTableFieldSourceDefinition.FieldId;

    export namespace JsonName {
        export const list = 'list';
    }

    // export function tryCreateListFromElement(element: JsonElement): Result<BadnessComparableList<ScanFieldEditorFrame>> {
    //     const elementArrayResult = element.tryGetElementArray(JsonName.list);
    //     if (elementArrayResult.isErr()) {
    //         const error = elementArrayResult.error;
    //         if (error === JsonElement.arrayErrorCode_NotSpecified) {
    //             return new Err(ErrorCode.DataIvemIdComparableListTableRecordSourceDefinition_JsonDataIvemIdsNotSpecified);
    //         } else {
    //             return new Err(ErrorCode.DataIvemIdComparableListTableRecordSourceDefinition_JsonDataIvemIdsIsInvalid);
    //         }
    //     } else {
    //         const dataIvemIdsResult = DataIvemId.tryCreateArrayFromJsonElementArray(elementArrayResult.value);
    //         if (dataIvemIdsResult.isErr()) {
    //             return dataIvemIdsResult.createOuter(ErrorCode.DataIvemIdComparableListTableRecordSourceDefinition_JsonDataIvemIdArrayIsInvalid);
    //         } else {
    //             const dataIvemIds = dataIvemIdsResult.value;
    //             const list = new UiBadnessComparableList<DataIvemId>();
    //             list.addRange(dataIvemIds);
    //             return new Ok(list);
    //         }
    //     }
    // }

    // export function tryCreateDefinition(
    //     customHeadingsService: RevSourcedFieldCustomHeadingsService,
    //     tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
    //     element: JsonElement,
    // ): Result<ScanFieldEditorFrameComparableListTableRecordSourceDefinition> {
    //     const listCreateResult = tryCreateListFromElement(element);
    //     if (listCreateResult.isErr()) {
    //         const errorCode = ErrorCode.DataIvemIdComparableListTableRecordSourceDefinition_JsonListIsInvalid;
    //         return listCreateResult.createOuter(errorCode);
    //     } else {
    //         const list = listCreateResult.value;
    //         const definition = new ScanFieldEditorFrameComparableListTableRecordSourceDefinition(customHeadingsService, tableFieldSourceDefinitionCachingFactory, list);
    //         return new Ok(definition);
    //     }
    // }

    export function createLayoutDefinition(
        fieldSourceDefinitionRegistryService: TableFieldSourceDefinitionCachingFactory,
        fieldIds: FieldId[],
    ): RevColumnLayoutDefinition {
        return fieldSourceDefinitionRegistryService.createLayoutDefinition(fieldIds);
    }

    export function is(definition: TableRecordSourceDefinition): definition is ScanFieldEditorFrameComparableListTableRecordSourceDefinition {
        return definition.typeId === TableRecordSourceDefinition.TypeId.ScanFieldEditorFrame;
    }
}
