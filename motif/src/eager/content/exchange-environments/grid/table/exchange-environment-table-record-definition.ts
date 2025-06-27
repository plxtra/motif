import { ExchangeEnvironment, PayloadTableRecordDefinition, TableFieldSourceDefinition, TableRecordDefinition } from '@plxtra/motif-core';

export interface ExchangeEnvironmentTableRecordDefinition extends PayloadTableRecordDefinition<ExchangeEnvironment> {
    readonly typeId: TableFieldSourceDefinition.TypeId.ExchangeEnvironment;
}

export namespace ExchangeEnvironmentTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is ExchangeEnvironmentTableRecordDefinition {
        return definition.typeId === TableFieldSourceDefinition.TypeId.ExchangeEnvironment;
    }
}
