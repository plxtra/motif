import { PayloadTableRecordDefinition, TableFieldSourceDefinition, TableRecordDefinition, TradingMarket } from '@plxtra/motif-core';

export interface TradingMarketTableRecordDefinition extends PayloadTableRecordDefinition<TradingMarket> {
    readonly typeId: TableFieldSourceDefinition.TypeId.TradingMarket;
}

export namespace TradingMarketTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is TradingMarketTableRecordDefinition {
        return definition.typeId === TableFieldSourceDefinition.TypeId.TradingMarket;
    }
}
