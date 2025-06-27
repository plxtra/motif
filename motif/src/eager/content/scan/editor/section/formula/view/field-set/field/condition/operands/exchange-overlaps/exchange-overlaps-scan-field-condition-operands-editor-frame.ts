import { Exchange, ScanFieldCondition } from '@plxtra/motif-core';
import { NegatableOperator } from '../negatableOperator';
import { OverlapsScanFieldConditionOperandsEditorFrame } from '../overlaps/internal-api';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';

export interface ExchangeOverlapsScanFieldConditionOperandsEditorFrame extends OverlapsScanFieldConditionOperandsEditorFrame, NegatableOperator {
    readonly operandsTypeId: ScanFieldCondition.Operands.TypeId.Exchange,

    readonly values: readonly Exchange[];

    setValues(value: readonly Exchange[], modifier: ScanFieldConditionOperandsEditorFrame.Modifier): boolean;
}
