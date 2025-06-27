import { IsScanFieldCondition, ScanFieldCondition, ScanFormula } from '@plxtra/motif-core';
import { NegatableOperator } from '../negatableOperator';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';

export interface CategoryValueScanFieldConditionOperandsEditorFrame extends ScanFieldConditionOperandsEditorFrame, NegatableOperator {
    readonly operandsTypeId: ScanFieldCondition.Operands.TypeId.CategoryValue,

    readonly operatorId: CategoryValueScanFieldConditionOperandsEditorFrame.OperatorId;
    readonly categoryId: ScanFormula.IsNode.CategoryId | undefined;

    setCategoryId(value: ScanFormula.IsNode.CategoryId | undefined, modifier: ScanFieldConditionOperandsEditorFrame.Modifier): boolean;
}

export namespace CategoryValueScanFieldConditionOperandsEditorFrame {
    export type OperatorId = IsScanFieldCondition.Operands.OperatorId;
}
