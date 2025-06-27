import { NumericComparisonScanFieldCondition, ScanFieldCondition } from '@plxtra/motif-core';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';

export interface NumericComparisonValueScanFieldConditionOperandsEditorFrame extends ScanFieldConditionOperandsEditorFrame {
    readonly operandsTypeId: ScanFieldCondition.Operands.TypeId.NumericComparisonValue,

    readonly operatorId: NumericComparisonValueScanFieldConditionOperandsEditorFrame.OperatorId;
    readonly value: number | undefined;

    setOperatorId(value: NumericComparisonValueScanFieldConditionOperandsEditorFrame.OperatorId, modifier: ScanFieldConditionOperandsEditorFrame.Modifier): boolean;
    setValue(value: number | undefined, modifier: ScanFieldConditionOperandsEditorFrame.Modifier): boolean;
}

export namespace NumericComparisonValueScanFieldConditionOperandsEditorFrame {
    export type OperatorId = NumericComparisonScanFieldCondition.ValueOperands.OperatorId;
}
