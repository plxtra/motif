import { isArrayEqual } from '@pbkware/js-utils';
import {
    Exchange,
    ExchangeOverlapsScanFieldCondition,
    ScanFieldCondition
} from '@plxtra/motif-core';
import {
    ExchangeOverlapsScanFieldConditionOperandsEditorFrame
} from './operands/internal-api';
import { OverlapsScanFieldConditionEditorFrame } from './overlaps-scan-field-condition-editor-frame';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export class ExchangeOverlapsScanFieldConditionEditorFrame extends OverlapsScanFieldConditionEditorFrame
    implements
        ExchangeOverlapsScanFieldCondition,
        ExchangeOverlapsScanFieldConditionOperandsEditorFrame {

    declare readonly typeId: ExchangeOverlapsScanFieldConditionEditorFrame.TypeId;
    declare readonly operandsTypeId: ExchangeOverlapsScanFieldConditionEditorFrame.OperandsTypeId;

    constructor(
        operatorId: OverlapsScanFieldConditionEditorFrame.OperatorId,
        private _values: readonly Exchange[],
    ) {
        super(
            ExchangeOverlapsScanFieldConditionEditorFrame.typeId,
            ExchangeOverlapsScanFieldConditionEditorFrame.operandsTypeId,
            operatorId,
        );
        this.updateValid();
    }

    get operands() {
        const operands: ExchangeOverlapsScanFieldCondition.Operands = {
            typeId: ExchangeOverlapsScanFieldConditionEditorFrame.operandsTypeId,
            values: this._values.slice(),
        }
        return operands;
    }

    override get valueCount() { return this._values.length; }

    get values() { return this._values; }
    setValues(value: readonly Exchange[], modifier: ScanFieldConditionEditorFrame.Modifier) {
        if (isArrayEqual(value, this._values)) {
            return false;
        } else {
            this._values = value.slice();
            return this.processChanged(modifier);
        }
    }
}

export namespace ExchangeOverlapsScanFieldConditionEditorFrame {
    export const typeId = ScanFieldCondition.TypeId.ExchangeOverlaps;
    export type TypeId = typeof typeId;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.Exchange;
    export type OperandsTypeId = typeof operandsTypeId;
}
