import { LockerScanAttachedNotificationChannel, PayloadTableRecordDefinition, TableFieldSourceDefinition, TableRecordDefinition } from '@plxtra/motif-core';

export interface LockerScanAttachedNotificationChannelTableRecordDefinition extends PayloadTableRecordDefinition<LockerScanAttachedNotificationChannel> {
    readonly typeId: TableFieldSourceDefinition.TypeId.LockerScanAttachedNotificationChannel;
}

export namespace LockerScanAttachedNotificationChannelTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is LockerScanAttachedNotificationChannelTableRecordDefinition {
        return definition.typeId === TableFieldSourceDefinition.TypeId.LockerScanAttachedNotificationChannel;
    }
}
