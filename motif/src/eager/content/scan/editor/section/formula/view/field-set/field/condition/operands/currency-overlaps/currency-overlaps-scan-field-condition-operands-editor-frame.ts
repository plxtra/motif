import { CurrencyId, ScanFieldCondition } from '@plxtra/motif-core';
import { NegatableOperator } from '../negatableOperator';
import { OverlapsScanFieldConditionOperandsEditorFrame } from '../overlaps/internal-api';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';

export interface CurrencyOverlapsScanFieldConditionOperandsEditorFrame extends OverlapsScanFieldConditionOperandsEditorFrame, NegatableOperator {
    readonly operandsTypeId: ScanFieldCondition.Operands.TypeId.CurrencyEnum,

    readonly values: readonly CurrencyId[];

    setValues(value: readonly CurrencyId[], modifier: ScanFieldConditionOperandsEditorFrame.Modifier): boolean;
}
