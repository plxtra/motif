import { BaseNumericScanFieldCondition, NumericScanFieldCondition, ScanFieldCondition } from '@plxtra/motif-core';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export abstract class NumericScanFieldConditionEditorFrame extends ScanFieldConditionEditorFrame implements NumericScanFieldCondition {
    declare readonly typeId: NumericScanFieldConditionEditorFrame.TypeId;

    constructor(
        operandsTypeId: ScanFieldCondition.Operands.TypeId,
        affirmativeOperatorDisplayLines: readonly string[],
    ) {
        super(NumericScanFieldConditionEditorFrame.typeId, operandsTypeId, affirmativeOperatorDisplayLines);
    }

    abstract get operands(): BaseNumericScanFieldCondition.Operands;
    abstract override get operatorId(): NumericScanFieldConditionEditorFrame.OperatorId;
}

export namespace NumericScanFieldConditionEditorFrame {
    export const typeId = ScanFieldCondition.TypeId.Numeric;
    export type TypeId = typeof typeId;
    export type OperatorId = NumericScanFieldCondition.OperatorId;
    export const supportedOperatorIds = NumericScanFieldCondition.Operands.supportedOperatorIds;
}
