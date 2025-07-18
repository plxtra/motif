import { Integer } from '@pbkware/js-utils';
import {
    OverlapsScanFieldCondition,
    ScanFieldCondition
} from '@plxtra/motif-core';
import { OverlapsScanFieldConditionOperandsEditorFrame } from './operands/internal-api';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export abstract class OverlapsScanFieldConditionEditorFrame extends ScanFieldConditionEditorFrame
    implements
        OverlapsScanFieldCondition,
        OverlapsScanFieldConditionOperandsEditorFrame {

    constructor(
        typeId: ScanFieldCondition.TypeId,
        operandsTypeId: ScanFieldCondition.Operands.TypeId,
        private _operatorId: OverlapsScanFieldConditionEditorFrame.OperatorId,
    ) {
        const affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(_operatorId);
        super(typeId, operandsTypeId, affirmativeOperatorDisplayLines);
    }

    override get operatorId() { return this._operatorId; }
    get not() { return ScanFieldCondition.Operator.overlapsIsNot(this._operatorId); }

    abstract get valueCount(): Integer;

    override calculateValid() {
        return this.valueCount > 0;
    }

    negateOperator(modifier: ScanFieldConditionEditorFrame.Modifier) {
        this._operatorId = ScanFieldCondition.Operator.negateOverlaps(this._operatorId);
        return this.processChanged(modifier);
    }
}

export namespace OverlapsScanFieldConditionEditorFrame {
    export type OperatorId = OverlapsScanFieldCondition.Operands.OperatorId;
    export const supportedOperatorIds = OverlapsScanFieldCondition.Operands.supportedOperatorIds;
}
