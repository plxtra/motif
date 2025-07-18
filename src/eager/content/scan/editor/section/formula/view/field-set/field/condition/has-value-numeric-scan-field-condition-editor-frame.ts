import { BaseNumericScanFieldCondition, ScanFieldCondition } from '@plxtra/motif-core';
import { NumericScanFieldConditionEditorFrame } from './numeric-scan-field-condition-editor-frame';
import {
    HasValueScanFieldConditionOperandsEditorFrame
} from './operands/internal-api';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export class HasValueNumericScanFieldConditionEditorFrame extends NumericScanFieldConditionEditorFrame
    implements
        HasValueScanFieldConditionOperandsEditorFrame {

    declare readonly operandsTypeId: HasValueNumericScanFieldConditionEditorFrame.OperandsTypeId;

    constructor(
        private _operatorId: HasValueNumericScanFieldConditionEditorFrame.OperatorId,
    ) {
        const affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(_operatorId);
        super(HasValueNumericScanFieldConditionEditorFrame.operandsTypeId, affirmativeOperatorDisplayLines);
        this.updateValid();
    }

    override get operands() {
        const operands: BaseNumericScanFieldCondition.HasValueOperands = {
            typeId: HasValueNumericScanFieldConditionEditorFrame.operandsTypeId,
        }
        return operands;
    }

    override get operatorId() { return this._operatorId; }
    get not() { return ScanFieldCondition.Operator.hasValueIsNot(this._operatorId); }

    override calculateValid() {
        return true;
    }

    negateOperator(modifier: ScanFieldConditionEditorFrame.Modifier) {
        this._operatorId = ScanFieldCondition.Operator.negateHasValue(this._operatorId);
        return this.processChanged(modifier);
    }
}

export namespace HasValueNumericScanFieldConditionEditorFrame {
    export type OperatorId = HasValueScanFieldConditionOperandsEditorFrame.OperatorId;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.HasValue;
    export type OperandsTypeId = typeof operandsTypeId;
}
