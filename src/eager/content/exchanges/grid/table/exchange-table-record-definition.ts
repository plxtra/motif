import { Exchange, PayloadTableRecordDefinition, TableFieldSourceDefinition, TableRecordDefinition } from '@plxtra/motif-core';

export interface ExchangeTableRecordDefinition extends PayloadTableRecordDefinition<Exchange> {
    readonly typeId: TableFieldSourceDefinition.TypeId.Exchange;
}

export namespace ExchangeTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is ExchangeTableRecordDefinition {
        return definition.typeId === TableFieldSourceDefinition.TypeId.Exchange;
    }
}
