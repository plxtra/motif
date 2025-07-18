import { PayloadTableRecordDefinition, TableFieldSourceDefinition, TableRecordDefinition } from '@plxtra/motif-core';
import { ScanFieldEditorFrame } from '../../field/internal-api';

export interface ScanFieldEditorFrameTableRecordDefinition extends PayloadTableRecordDefinition<ScanFieldEditorFrame> {
    readonly typeId: TableFieldSourceDefinition.TypeId.ScanFieldEditorFrame;
}

export namespace ScanFieldEditorFrameTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is ScanFieldEditorFrameTableRecordDefinition {
        return definition.typeId === TableFieldSourceDefinition.TypeId.ScanFieldEditorFrame;
    }
}
