import { DateScanFieldCondition, ScanFieldCondition } from '@plxtra/motif-core';
import { DateScanFieldConditionEditorFrame } from './date-scan-field-condition-editor-frame';
import {
    HasValueScanFieldConditionOperandsEditorFrame
} from './operands/internal-api';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export class HasValueDateScanFieldConditionEditorFrame extends DateScanFieldConditionEditorFrame implements HasValueScanFieldConditionOperandsEditorFrame {
    declare readonly operandsTypeId: HasValueDateScanFieldConditionEditorFrame.OperandsTypeId;

    constructor(
        private _operatorId: HasValueDateScanFieldConditionEditorFrame.OperatorId,
    ) {
        const affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(_operatorId);
        super(HasValueDateScanFieldConditionEditorFrame.operandsTypeId, affirmativeOperatorDisplayLines);
        this.updateValid();
    }

    override get operands() {
        const operands: DateScanFieldCondition.HasValueOperands = {
            typeId: HasValueDateScanFieldConditionEditorFrame.operandsTypeId,
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

export namespace HasValueDateScanFieldConditionEditorFrame {
    export type OperatorId = HasValueScanFieldConditionOperandsEditorFrame.OperatorId;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.HasValue;
    export type OperandsTypeId = typeof operandsTypeId;
}
