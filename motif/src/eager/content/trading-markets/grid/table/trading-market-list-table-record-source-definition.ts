import { ChangeSubscribableComparableList, PickEnum } from '@pbkware/js-utils';
import {
    RecordListTableRecordSourceDefinition,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactory,
    TableRecordSourceDefinition,
    TradingMarket
} from '@plxtra/motif-core';
import { RevColumnLayoutDefinition, RevSourcedFieldCustomHeadings } from 'revgrid';
import { TradingMarketTableFieldSourceDefinition } from './trading-market-table-field-source-definition';

export class TradingMarketListTableRecordSourceDefinition extends RecordListTableRecordSourceDefinition<TradingMarket> {
    declare list: ChangeSubscribableComparableList<TradingMarket>;

    constructor(
        customHeadingsService: RevSourcedFieldCustomHeadings | undefined,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        list: ChangeSubscribableComparableList<TradingMarket>,
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactory,
            TableRecordSourceDefinition.TypeId.TradingMarketList,
            TradingMarketListTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
            list,
        );
    }

    override createDefaultLayoutDefinition(): RevColumnLayoutDefinition {
        const tradingMarketFieldSourceDefinition = TradingMarketTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactory);

        const fieldNames = new Array<string>();

        fieldNames.push(tradingMarketFieldSourceDefinition.getFieldNameById(TradingMarket.FieldId.Display));
        fieldNames.push(tradingMarketFieldSourceDefinition.getFieldNameById(TradingMarket.FieldId.ZenithCode));
        fieldNames.push(tradingMarketFieldSourceDefinition.getFieldNameById(TradingMarket.FieldId.Exchange));
        fieldNames.push(tradingMarketFieldSourceDefinition.getFieldNameById(TradingMarket.FieldId.SymbologyCode));
        fieldNames.push(tradingMarketFieldSourceDefinition.getFieldNameById(TradingMarket.FieldId.Unknown));
        fieldNames.push(tradingMarketFieldSourceDefinition.getFieldNameById(TradingMarket.FieldId.HasSymbologicalCorrespondingDataMarket));
        fieldNames.push(tradingMarketFieldSourceDefinition.getFieldNameById(TradingMarket.FieldId.Lit));
        fieldNames.push(tradingMarketFieldSourceDefinition.getFieldNameById(TradingMarket.FieldId.BestLitDataMarket));
        fieldNames.push(tradingMarketFieldSourceDefinition.getFieldNameById(TradingMarket.FieldId.AllowedOrderTradeTypeIds));
        fieldNames.push(tradingMarketFieldSourceDefinition.getFieldNameById(TradingMarket.FieldId.AllowedOrderTypeIds));
        fieldNames.push(tradingMarketFieldSourceDefinition.getFieldNameById(TradingMarket.FieldId.AllowedOrderTimeInForceIds));
        fieldNames.push(tradingMarketFieldSourceDefinition.getFieldNameById(TradingMarket.FieldId.AllowedOrderTriggerTypeIds));

        return RevColumnLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

/** @public */
export namespace TradingMarketListTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.TradingMarket
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.TradingMarket
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.TradingMarket
    ];

    export type FieldId = TradingMarketTableFieldSourceDefinition.FieldId;

    export namespace JsonName {
        export const list = 'list';
    }

    // export function tryCreateListFromElement(element: JsonElement): Result<BadnessComparableList<TradingMarket>> {
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
    // ): Result<TradingMarketComparableListTableRecordSourceDefinition> {
    //     const listCreateResult = tryCreateListFromElement(element);
    //     if (listCreateResult.isErr()) {
    //         const errorCode = ErrorCode.DataIvemIdComparableListTableRecordSourceDefinition_JsonListIsInvalid;
    //         return listCreateResult.createOuter(errorCode);
    //     } else {
    //         const list = listCreateResult.value;
    //         const definition = new TradingMarketComparableListTableRecordSourceDefinition(customHeadingsService, tableFieldSourceDefinitionCachingFactory, list);
    //         return new Ok(definition);
    //     }
    // }

    export function createLayoutDefinition(
        fieldSourceDefinitionRegistryService: TableFieldSourceDefinitionCachingFactory,
        fieldIds: FieldId[],
    ): RevColumnLayoutDefinition {
        return fieldSourceDefinitionRegistryService.createLayoutDefinition(fieldIds);
    }

    export function is(definition: TableRecordSourceDefinition): definition is TradingMarketListTableRecordSourceDefinition {
        return definition.typeId === TableRecordSourceDefinition.TypeId.TradingMarketList;
    }
}
