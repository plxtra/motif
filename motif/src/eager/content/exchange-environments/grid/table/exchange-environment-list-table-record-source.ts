import {
    ChangeSubscribableComparableList,
    Integer,
    UnreachableCaseError
} from '@pbkware/js-utils';
import {
    ExchangeEnvironment,
    RecordListTableRecordSource,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactory,
    TableRecord,
    TextFormatterService,
} from '@plxtra/motif-core';
import { RevSourcedFieldCustomHeadings } from 'revgrid';
import { ExchangeEnvironmentListTableRecordSourceDefinition } from './exchange-environment-list-table-record-source-definition';
import { ExchangeEnvironmentTableRecordDefinition } from './exchange-environment-table-record-definition';
import { ExchangeEnvironmentTableValueSource } from './exchange-environment-table-value-source';

export class ExchangeEnvironmentListTableRecordSource extends RecordListTableRecordSource<ExchangeEnvironment> {
    declare readonly definition: ExchangeEnvironmentListTableRecordSourceDefinition;
    declare readonly list: ChangeSubscribableComparableList<ExchangeEnvironment>;

    constructor(
        textFormatterService: TextFormatterService,
        customHeadingsService: RevSourcedFieldCustomHeadings,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        definition: ExchangeEnvironmentListTableRecordSourceDefinition,
    ) {
        super(
            textFormatterService,
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactory,
            definition,
            definition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    override get recordList() { return super.recordList as ChangeSubscribableComparableList<ExchangeEnvironment>; }

    override createDefinition(): ExchangeEnvironmentListTableRecordSourceDefinition {
        return new ExchangeEnvironmentListTableRecordSourceDefinition(
            this.customHeadings,
            this.tableFieldSourceDefinitionCachingFactory,
            this.list.clone()
        )
    }

    override createRecordDefinition(idx: Integer): ExchangeEnvironmentTableRecordDefinition {
        const exchangeEnvironment = this.list.getAt(idx);
        return {
            typeId: TableFieldSourceDefinition.TypeId.ExchangeEnvironment,
            mapKey: exchangeEnvironment.mapKey,
            record: exchangeEnvironment,
        };
    }

    override createTableRecord(recordIndex: Integer, eventHandlers: TableRecord.EventHandlers): TableRecord {
        const result = new TableRecord(recordIndex, eventHandlers);
        const exchangeEnvironment = this.list.getAt(recordIndex);

        const fieldSources = this.activeFieldSources;
        const sourceCount = fieldSources.length;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldSources[i];
            const fieldSourceDefinition = fieldSource.definition;
            const fieldSourceDefinitionTypeId = fieldSourceDefinition.typeId as ExchangeEnvironmentListTableRecordSourceDefinition.FieldSourceDefinitionTypeId;
            if (this.allowedFieldSourceDefinitionTypeIds.includes(fieldSourceDefinitionTypeId)) {
                switch (fieldSourceDefinitionTypeId) {
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    case TableFieldSourceDefinition.TypeId.ExchangeEnvironment: {
                        const valueSource = new ExchangeEnvironmentTableValueSource(result.fieldCount, exchangeEnvironment);
                        result.addSource(valueSource);
                        break;
                    }
                    default:
                        throw new UnreachableCaseError('EELTRSCTR33309', fieldSourceDefinitionTypeId);
                }
            }
        }

        return result;
    }

    protected override getDefaultFieldSourceDefinitionTypeIds() {
        return ExchangeEnvironmentListTableRecordSourceDefinition.defaultFieldSourceDefinitionTypeIds;
    }
}
