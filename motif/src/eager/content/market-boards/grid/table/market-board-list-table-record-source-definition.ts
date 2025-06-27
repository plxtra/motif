import { ChangeSubscribableComparableList, PickEnum } from '@pbkware/js-utils';
import {
    MarketBoard,
    RecordListTableRecordSourceDefinition,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactory,
    TableRecordSourceDefinition
} from '@plxtra/motif-core';
import { RevColumnLayoutDefinition, RevSourcedFieldCustomHeadings } from 'revgrid';
import { MarketBoardTableFieldSourceDefinition } from './market-board-table-field-source-definition';

export class MarketBoardListTableRecordSourceDefinition extends RecordListTableRecordSourceDefinition<MarketBoard> {
    declare list: ChangeSubscribableComparableList<MarketBoard>;

    constructor(
        customHeadingsService: RevSourcedFieldCustomHeadings | undefined,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        list: ChangeSubscribableComparableList<MarketBoard>,
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactory,
            TableRecordSourceDefinition.TypeId.MarketBoardList,
            MarketBoardListTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
            list,
        );
    }

    override createDefaultLayoutDefinition(): RevColumnLayoutDefinition {
        const marketBoardFieldSourceDefinition = MarketBoardTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactory);

        const fieldNames = new Array<string>();

        fieldNames.push(marketBoardFieldSourceDefinition.getFieldNameById(MarketBoard.FieldId.Display));
        fieldNames.push(marketBoardFieldSourceDefinition.getFieldNameById(MarketBoard.FieldId.ZenithCode));
        fieldNames.push(marketBoardFieldSourceDefinition.getFieldNameById(MarketBoard.FieldId.Market));
        fieldNames.push(marketBoardFieldSourceDefinition.getFieldNameById(MarketBoard.FieldId.FeedInitialising));
        fieldNames.push(marketBoardFieldSourceDefinition.getFieldNameById(MarketBoard.FieldId.Status));
        fieldNames.push(marketBoardFieldSourceDefinition.getFieldNameById(MarketBoard.FieldId.AllowIds));
        fieldNames.push(marketBoardFieldSourceDefinition.getFieldNameById(MarketBoard.FieldId.ReasonId));
        fieldNames.push(marketBoardFieldSourceDefinition.getFieldNameById(MarketBoard.FieldId.Unknown));

        return RevColumnLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

/** @public */
export namespace MarketBoardListTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.MarketBoard
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.MarketBoard
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.MarketBoard
    ];

    export type FieldId = MarketBoardTableFieldSourceDefinition.FieldId;

    export namespace JsonName {
        export const list = 'list';
    }

    // export function tryCreateListFromElement(element: JsonElement): Result<BadnessComparableList<MarketBoard>> {
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
    // ): Result<MarketBoardComparableListTableRecordSourceDefinition> {
    //     const listCreateResult = tryCreateListFromElement(element);
    //     if (listCreateResult.isErr()) {
    //         const errorCode = ErrorCode.DataIvemIdComparableListTableRecordSourceDefinition_JsonListIsInvalid;
    //         return listCreateResult.createOuter(errorCode);
    //     } else {
    //         const list = listCreateResult.value;
    //         const definition = new MarketBoardComparableListTableRecordSourceDefinition(customHeadingsService, tableFieldSourceDefinitionCachingFactory, list);
    //         return new Ok(definition);
    //     }
    // }

    export function createLayoutDefinition(
        fieldSourceDefinitionRegistryService: TableFieldSourceDefinitionCachingFactory,
        fieldIds: FieldId[],
    ): RevColumnLayoutDefinition {
        return fieldSourceDefinitionRegistryService.createLayoutDefinition(fieldIds);
    }

    export function is(definition: TableRecordSourceDefinition): definition is MarketBoardListTableRecordSourceDefinition {
        return definition.typeId === TableRecordSourceDefinition.TypeId.MarketBoardList;
    }
}
