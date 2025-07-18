import { ChangeSubscribableComparableList, PickEnum } from '@pbkware/js-utils';
import {
    DataMarket,
    RecordListTableRecordSourceDefinition,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactory,
    TableRecordSourceDefinition
} from '@plxtra/motif-core';
import { RevColumnLayoutDefinition, RevSourcedFieldCustomHeadings } from 'revgrid';
import { DataMarketTableFieldSourceDefinition } from './data-market-table-field-source-definition';

export class DataMarketListTableRecordSourceDefinition extends RecordListTableRecordSourceDefinition<DataMarket> {
    declare list: ChangeSubscribableComparableList<DataMarket>;

    constructor(
        customHeadingsService: RevSourcedFieldCustomHeadings | undefined,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        list: ChangeSubscribableComparableList<DataMarket>,
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactory,
            TableRecordSourceDefinition.TypeId.DataMarketList,
            DataMarketListTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
            list,
        );
    }

    override createDefaultLayoutDefinition(): RevColumnLayoutDefinition {
        const dataMarketFieldSourceDefinition = DataMarketTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactory);

        const fieldNames = new Array<string>();

        fieldNames.push(dataMarketFieldSourceDefinition.getFieldNameById(DataMarket.FieldId.Display));
        fieldNames.push(dataMarketFieldSourceDefinition.getFieldNameById(DataMarket.FieldId.ZenithCode));
        fieldNames.push(dataMarketFieldSourceDefinition.getFieldNameById(DataMarket.FieldId.Exchange));
        fieldNames.push(dataMarketFieldSourceDefinition.getFieldNameById(DataMarket.FieldId.MarketTime));
        fieldNames.push(dataMarketFieldSourceDefinition.getFieldNameById(DataMarket.FieldId.TradingDate));
        fieldNames.push(dataMarketFieldSourceDefinition.getFieldNameById(DataMarket.FieldId.Status));
        fieldNames.push(dataMarketFieldSourceDefinition.getFieldNameById(DataMarket.FieldId.AllowIds));
        fieldNames.push(dataMarketFieldSourceDefinition.getFieldNameById(DataMarket.FieldId.ReasonId));
        fieldNames.push(dataMarketFieldSourceDefinition.getFieldNameById(DataMarket.FieldId.SymbologyCode));
        fieldNames.push(dataMarketFieldSourceDefinition.getFieldNameById(DataMarket.FieldId.Unknown));

        return RevColumnLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

/** @public */
export namespace DataMarketListTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.DataMarket
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.DataMarket
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.DataMarket
    ];

    export type FieldId = DataMarketTableFieldSourceDefinition.FieldId;

    export namespace JsonName {
        export const list = 'list';
    }

    // export function tryCreateListFromElement(element: JsonElement): Result<BadnessComparableList<DataMarket>> {
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
    // ): Result<DataMarketComparableListTableRecordSourceDefinition> {
    //     const listCreateResult = tryCreateListFromElement(element);
    //     if (listCreateResult.isErr()) {
    //         const errorCode = ErrorCode.DataIvemIdComparableListTableRecordSourceDefinition_JsonListIsInvalid;
    //         return listCreateResult.createOuter(errorCode);
    //     } else {
    //         const list = listCreateResult.value;
    //         const definition = new DataMarketComparableListTableRecordSourceDefinition(customHeadingsService, tableFieldSourceDefinitionCachingFactory, list);
    //         return new Ok(definition);
    //     }
    // }

    export function createLayoutDefinition(
        fieldSourceDefinitionRegistryService: TableFieldSourceDefinitionCachingFactory,
        fieldIds: FieldId[],
    ): RevColumnLayoutDefinition {
        return fieldSourceDefinitionRegistryService.createLayoutDefinition(fieldIds);
    }

    export function is(definition: TableRecordSourceDefinition): definition is DataMarketListTableRecordSourceDefinition {
        return definition.typeId === TableRecordSourceDefinition.TypeId.DataMarketList;
    }
}
