import {
    BaseTextScanFieldCondition,
    ScanFieldCondition
} from '@plxtra/motif-core';
import {
    HasValueScanFieldConditionOperandsEditorFrame
} from './operands/internal-api';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';
import { TextHasValueEqualsScanFieldConditionEditorFrame } from './text-has-value-equals-scan-field-condition-editor-frame';

export class HasValueTextHasValueEqualsScanFieldConditionEditorFrame extends TextHasValueEqualsScanFieldConditionEditorFrame
    implements
        HasValueScanFieldConditionOperandsEditorFrame {

    declare readonly operandsTypeId: HasValueTextHasValueEqualsScanFieldConditionEditorFrame.OperandsTypeId;

    constructor(
        private _operatorId: HasValueTextHasValueEqualsScanFieldConditionEditorFrame.OperatorId,
    ) {
        const affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(_operatorId);
        super(HasValueTextHasValueEqualsScanFieldConditionEditorFrame.operandsTypeId, affirmativeOperatorDisplayLines);
        this.updateValid();
    }

    override get operands() {
        const operands: BaseTextScanFieldCondition.HasValueOperands = {
            typeId: HasValueTextHasValueEqualsScanFieldConditionEditorFrame.operandsTypeId,
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

export namespace HasValueTextHasValueEqualsScanFieldConditionEditorFrame {
    export type OperatorId = HasValueScanFieldConditionOperandsEditorFrame.OperatorId;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.HasValue;
    export type OperandsTypeId = typeof operandsTypeId;
}
