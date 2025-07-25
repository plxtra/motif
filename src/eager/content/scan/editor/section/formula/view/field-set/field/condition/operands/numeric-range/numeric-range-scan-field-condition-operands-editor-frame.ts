import { BaseNumericScanFieldCondition, ScanFieldCondition } from '@plxtra/motif-core';
import { NegatableOperator } from '../negatableOperator';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';

export interface NumericRangeScanFieldConditionOperandsEditorFrame extends ScanFieldConditionOperandsEditorFrame, NegatableOperator {
    readonly operandsTypeId: ScanFieldCondition.Operands.TypeId.NumericRange,

    readonly operatorId: NumericRangeScanFieldConditionOperandsEditorFrame.OperatorId;
    readonly min: number | undefined;
    readonly max: number | undefined;

    setMin(value: number | undefined, modifier: ScanFieldConditionOperandsEditorFrame.Modifier): boolean;
    setMax(value: number | undefined, modifier: ScanFieldConditionOperandsEditorFrame.Modifier): boolean;
}

export namespace NumericRangeScanFieldConditionOperandsEditorFrame {
    export type OperatorId = BaseNumericScanFieldCondition.RangeOperands.OperatorId;
}
