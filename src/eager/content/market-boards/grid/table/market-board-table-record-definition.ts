import { MarketBoard, PayloadTableRecordDefinition, TableFieldSourceDefinition, TableRecordDefinition } from '@plxtra/motif-core';

export interface MarketBoardTableRecordDefinition extends PayloadTableRecordDefinition<MarketBoard> {
    readonly typeId: TableFieldSourceDefinition.TypeId.MarketBoard;
}

export namespace MarketBoardTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is MarketBoardTableRecordDefinition {
        return definition.typeId === TableFieldSourceDefinition.TypeId.MarketBoard;
    }
}
