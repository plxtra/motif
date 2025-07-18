import { ChangeSubscribableComparableList, PickEnum } from '@pbkware/js-utils';
import {
    ExchangeEnvironment,
    RecordListTableRecordSourceDefinition,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactory,
    TableRecordSourceDefinition
} from '@plxtra/motif-core';
import { RevColumnLayoutDefinition, RevSourcedFieldCustomHeadings } from 'revgrid';
import { ExchangeEnvironmentTableFieldSourceDefinition } from './exchange-environment-table-field-source-definition';

export class ExchangeEnvironmentListTableRecordSourceDefinition extends RecordListTableRecordSourceDefinition<ExchangeEnvironment> {
    declare list: ChangeSubscribableComparableList<ExchangeEnvironment>;

    constructor(
        customHeadingsService: RevSourcedFieldCustomHeadings | undefined,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        list: ChangeSubscribableComparableList<ExchangeEnvironment>,
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactory,
            TableRecordSourceDefinition.TypeId.ExchangeEnvironmentList,
            ExchangeEnvironmentListTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
            list,
        );
    }

    override createDefaultLayoutDefinition(): RevColumnLayoutDefinition {
        const exchangeEnvironmentFieldSourceDefinition = ExchangeEnvironmentTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactory);

        const fieldNames = new Array<string>();

        fieldNames.push(exchangeEnvironmentFieldSourceDefinition.getFieldNameById(ExchangeEnvironment.FieldId.Display));
        fieldNames.push(exchangeEnvironmentFieldSourceDefinition.getFieldNameById(ExchangeEnvironment.FieldId.ZenithCode));
        fieldNames.push(exchangeEnvironmentFieldSourceDefinition.getFieldNameById(ExchangeEnvironment.FieldId.Production));
        fieldNames.push(exchangeEnvironmentFieldSourceDefinition.getFieldNameById(ExchangeEnvironment.FieldId.Unknown));
        fieldNames.push(exchangeEnvironmentFieldSourceDefinition.getFieldNameById(ExchangeEnvironment.FieldId.Exchanges));
        fieldNames.push(exchangeEnvironmentFieldSourceDefinition.getFieldNameById(ExchangeEnvironment.FieldId.DataMarkets));
        fieldNames.push(exchangeEnvironmentFieldSourceDefinition.getFieldNameById(ExchangeEnvironment.FieldId.TradingMarkets));

        return RevColumnLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

/** @public */
export namespace ExchangeEnvironmentListTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.ExchangeEnvironment
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.ExchangeEnvironment
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.ExchangeEnvironment
    ];

    export type FieldId = ExchangeEnvironmentTableFieldSourceDefinition.FieldId;

    export namespace JsonName {
        export const list = 'list';
    }

    // export function tryCreateListFromElement(element: JsonElement): Result<BadnessComparableList<ExchangeEnvironment>> {
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
    // ): Result<ExchangeEnvironmentComparableListTableRecordSourceDefinition> {
    //     const listCreateResult = tryCreateListFromElement(element);
    //     if (listCreateResult.isErr()) {
    //         const errorCode = ErrorCode.DataIvemIdComparableListTableRecordSourceDefinition_JsonListIsInvalid;
    //         return listCreateResult.createOuter(errorCode);
    //     } else {
    //         const list = listCreateResult.value;
    //         const definition = new ExchangeEnvironmentComparableListTableRecordSourceDefinition(customHeadingsService, tableFieldSourceDefinitionCachingFactory, list);
    //         return new Ok(definition);
    //     }
    // }

    export function createLayoutDefinition(
        fieldSourceDefinitionRegistryService: TableFieldSourceDefinitionCachingFactory,
        fieldIds: FieldId[],
    ): RevColumnLayoutDefinition {
        return fieldSourceDefinitionRegistryService.createLayoutDefinition(fieldIds);
    }

    export function is(definition: TableRecordSourceDefinition): definition is ExchangeEnvironmentListTableRecordSourceDefinition {
        return definition.typeId === TableRecordSourceDefinition.TypeId.ExchangeEnvironmentList;
    }
}
