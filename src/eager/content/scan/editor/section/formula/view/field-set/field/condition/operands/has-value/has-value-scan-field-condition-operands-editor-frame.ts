import { ScanFieldCondition } from '@plxtra/motif-core';
import { NegatableOperator } from '../negatableOperator';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';

export interface HasValueScanFieldConditionOperandsEditorFrame extends ScanFieldConditionOperandsEditorFrame, NegatableOperator {
    readonly operandsTypeId: ScanFieldCondition.Operands.TypeId.HasValue,

    readonly operatorId: HasValueScanFieldConditionOperandsEditorFrame.OperatorId;
}

export namespace HasValueScanFieldConditionOperandsEditorFrame {
    export type OperatorId = ScanFieldCondition.OperatorId.HasValue | ScanFieldCondition.OperatorId.NotHasValue;
}
