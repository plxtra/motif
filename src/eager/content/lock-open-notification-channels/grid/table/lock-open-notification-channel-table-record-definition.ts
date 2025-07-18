import { LockOpenNotificationChannel, PayloadTableRecordDefinition, TableFieldSourceDefinition, TableRecordDefinition } from '@plxtra/motif-core';

export interface LockOpenNotificationChannelTableRecordDefinition extends PayloadTableRecordDefinition<LockOpenNotificationChannel> {
    readonly typeId: TableFieldSourceDefinition.TypeId.LockOpenNotificationChannel;
}

export namespace LockerScanAttachedNotificationChannelTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is LockOpenNotificationChannelTableRecordDefinition {
        return definition.typeId === TableFieldSourceDefinition.TypeId.LockOpenNotificationChannel;
    }
}
