import { MarketBoard, ScanFieldCondition } from '@plxtra/motif-core';
import { NegatableOperator } from '../negatableOperator';
import { OverlapsScanFieldConditionOperandsEditorFrame } from '../overlaps/internal-api';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';

export interface MarketBoardOverlapsScanFieldConditionOperandsEditorFrame extends OverlapsScanFieldConditionOperandsEditorFrame, NegatableOperator {
    readonly operandsTypeId: ScanFieldCondition.Operands.TypeId.MarketBoard,

    readonly values: readonly MarketBoard[];

    setValues(value: readonly MarketBoard[], modifier: ScanFieldConditionOperandsEditorFrame.Modifier): boolean;
}
