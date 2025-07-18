import { DataMarket, PayloadTableRecordDefinition, TableFieldSourceDefinition, TableRecordDefinition } from '@plxtra/motif-core';

export interface DataMarketTableRecordDefinition extends PayloadTableRecordDefinition<DataMarket> {
    readonly typeId: TableFieldSourceDefinition.TypeId.DataMarket;
}

export namespace DataMarketTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is DataMarketTableRecordDefinition {
        return definition.typeId === TableFieldSourceDefinition.TypeId.DataMarket;
    }
}
