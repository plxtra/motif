import { NumericScanFieldCondition, ScanFieldCondition } from '@plxtra/motif-core';
import { NegatableOperator } from '../negatableOperator';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';

export interface NumericValueScanFieldConditionOperandsEditorFrame extends ScanFieldConditionOperandsEditorFrame, NegatableOperator {
    readonly operandsTypeId: ScanFieldCondition.Operands.TypeId.NumericValue,

    readonly operatorId: NumericValueScanFieldConditionOperandsEditorFrame.OperatorId;
    readonly value: number | undefined;

    setValue(value: number | undefined, modifier: ScanFieldConditionOperandsEditorFrame.Modifier): boolean;
}

export namespace NumericValueScanFieldConditionOperandsEditorFrame {
    export type OperatorId = NumericScanFieldCondition.ValueOperands.OperatorId;
}
