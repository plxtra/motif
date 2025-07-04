import { UnreachableCaseError } from '@pbkware/js-utils';
import { ScanField, ScanFieldCondition, ScanFormula, StringOverlapsScanField } from '@plxtra/motif-core';
import { OverlapsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame, StringOverlapsScanFieldConditionEditorFrame } from './condition/internal-api';
import { NotSubbedScanFieldEditorFrame } from './not-subbed-scan-field-editor-frame';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class StringOverlapsScanFieldEditorFrame extends NotSubbedScanFieldEditorFrame implements StringOverlapsScanField {
    declare readonly typeId: StringOverlapsScanFieldEditorFrame.ScanFieldTypeId;
    declare readonly fieldId: StringOverlapsScanFieldEditorFrame.ScanFormulaFieldId;
    declare readonly conditions: StringOverlapsScanFieldEditorFrame.Conditions;
    declare readonly conditionTypeId: StringOverlapsScanFieldEditorFrame.ConditionTypeId;

    constructor(
        fieldId: StringOverlapsScanFieldEditorFrame.ScanFormulaFieldId,
        name: string,
    ) {
        super(
            StringOverlapsScanFieldEditorFrame.typeId,
            fieldId,
            name,
            new StringOverlapsScanFieldEditorFrame.conditions(),
            StringOverlapsScanFieldEditorFrame.conditionTypeId,
        );
    }

    override get supportedOperatorIds() { return OverlapsScanFieldConditionEditorFrame.supportedOperatorIds; }

    override addCondition(operatorId: StringOverlapsScanFieldEditorFrame.OperatorId, modifier: ScanFieldEditorFrame.Modifier) {
        const conditionEditorFrame = this.createCondition(operatorId);
        this.conditions.add(conditionEditorFrame, modifier);
    }

    private createCondition(operatorId: StringOverlapsScanFieldEditorFrame.OperatorId): StringOverlapsScanFieldConditionEditorFrame {
        switch (operatorId) {
            case ScanFieldCondition.OperatorId.Overlaps:
            case ScanFieldCondition.OperatorId.NotOverlaps:
                return new StringOverlapsScanFieldConditionEditorFrame(operatorId, []);
            default:
                throw new UnreachableCaseError('SOSFEFCC22298', operatorId);
        }
    }
}

export namespace StringOverlapsScanFieldEditorFrame {
    export const typeId = ScanField.TypeId.StringOverlaps;
    export type ScanFieldTypeId = typeof typeId;
    export type ScanFormulaFieldId = ScanFormula.StringOverlapsFieldId;
    export type Conditions = ScanFieldConditionEditorFrame.List<StringOverlapsScanFieldConditionEditorFrame>;
    export const conditions = ScanFieldConditionEditorFrame.List<StringOverlapsScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.StringOverlaps;
    export const conditionTypeId = ScanFieldCondition.TypeId.StringOverlaps;
    export type OperatorId = OverlapsScanFieldConditionEditorFrame.OperatorId;
}
