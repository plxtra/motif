import { BaseTextScanFieldCondition, ScanFieldCondition } from '@plxtra/motif-core';
import { NegatableOperator } from '../negatableOperator';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';

export interface TextValueScanFieldConditionOperandsEditorFrame extends ScanFieldConditionOperandsEditorFrame, NegatableOperator {
    readonly operandsTypeId: ScanFieldCondition.Operands.TypeId.TextValue,

    readonly operatorId: TextValueScanFieldConditionOperandsEditorFrame.OperatorId;
    readonly value: string;

    setValue(value: string, modifier: ScanFieldConditionOperandsEditorFrame.Modifier): boolean;
}

export namespace TextValueScanFieldConditionOperandsEditorFrame {
    export type OperatorId = BaseTextScanFieldCondition.ValueOperands.OperatorId;
}
