import { ChangeSubscribableComparableList, PickEnum } from '@pbkware/js-utils';
import {
    Exchange,
    RecordListTableRecordSourceDefinition,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactory,
    TableRecordSourceDefinition
} from '@plxtra/motif-core';
import { RevColumnLayoutDefinition, RevSourcedFieldCustomHeadings } from 'revgrid';
import { ExchangeTableFieldSourceDefinition } from './exchange-table-field-source-definition';

export class ExchangeListTableRecordSourceDefinition extends RecordListTableRecordSourceDefinition<Exchange> {
    declare list: ChangeSubscribableComparableList<Exchange>;

    constructor(
        customHeadingsService: RevSourcedFieldCustomHeadings | undefined,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        list: ChangeSubscribableComparableList<Exchange>,
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactory,
            TableRecordSourceDefinition.TypeId.ExchangeList,
            ExchangeListTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
            list,
        );
    }

    override createDefaultLayoutDefinition(): RevColumnLayoutDefinition {
        const exchangeFieldSourceDefinition = ExchangeTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactory);

        const fieldNames = new Array<string>();

        fieldNames.push(exchangeFieldSourceDefinition.getFieldNameById(Exchange.FieldId.AbbreviatedDisplay));
        fieldNames.push(exchangeFieldSourceDefinition.getFieldNameById(Exchange.FieldId.FullDisplay));
        fieldNames.push(exchangeFieldSourceDefinition.getFieldNameById(Exchange.FieldId.ZenithCode));
        fieldNames.push(exchangeFieldSourceDefinition.getFieldNameById(Exchange.FieldId.SymbologyCode));
        fieldNames.push(exchangeFieldSourceDefinition.getFieldNameById(Exchange.FieldId.IsDefaultDefault));
        fieldNames.push(exchangeFieldSourceDefinition.getFieldNameById(Exchange.FieldId.Unknown));
        fieldNames.push(exchangeFieldSourceDefinition.getFieldNameById(Exchange.FieldId.ExchangeEnvironment));
        fieldNames.push(exchangeFieldSourceDefinition.getFieldNameById(Exchange.FieldId.DataMarkets));
        fieldNames.push(exchangeFieldSourceDefinition.getFieldNameById(Exchange.FieldId.TradingMarkets));

        return RevColumnLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

/** @public */
export namespace ExchangeListTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.Exchange
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.Exchange
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.Exchange
    ];

    export type FieldId = ExchangeTableFieldSourceDefinition.FieldId;

    export namespace JsonName {
        export const list = 'list';
    }

    // export function tryCreateListFromElement(element: JsonElement): Result<BadnessComparableList<Exchange>> {
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
    // ): Result<ExchangeComparableListTableRecordSourceDefinition> {
    //     const listCreateResult = tryCreateListFromElement(element);
    //     if (listCreateResult.isErr()) {
    //         const errorCode = ErrorCode.DataIvemIdComparableListTableRecordSourceDefinition_JsonListIsInvalid;
    //         return listCreateResult.createOuter(errorCode);
    //     } else {
    //         const list = listCreateResult.value;
    //         const definition = new ExchangeComparableListTableRecordSourceDefinition(customHeadingsService, tableFieldSourceDefinitionCachingFactory, list);
    //         return new Ok(definition);
    //     }
    // }

    export function createLayoutDefinition(
        fieldSourceDefinitionRegistryService: TableFieldSourceDefinitionCachingFactory,
        fieldIds: FieldId[],
    ): RevColumnLayoutDefinition {
        return fieldSourceDefinitionRegistryService.createLayoutDefinition(fieldIds);
    }

    export function is(definition: TableRecordSourceDefinition): definition is ExchangeListTableRecordSourceDefinition {
        return definition.typeId === TableRecordSourceDefinition.TypeId.ExchangeList;
    }
}
