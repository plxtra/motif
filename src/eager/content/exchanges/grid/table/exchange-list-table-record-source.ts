import {
    ChangeSubscribableComparableList,
    Integer,
    UnreachableCaseError
} from '@pbkware/js-utils';
import {
    Exchange,
    RecordListTableRecordSource,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactory,
    TableRecord,
    TextFormatterService,
} from '@plxtra/motif-core';
import { RevSourcedFieldCustomHeadings } from 'revgrid';
import { ExchangeListTableRecordSourceDefinition } from './exchange-list-table-record-source-definition';
import { ExchangeTableRecordDefinition } from './exchange-table-record-definition';
import { ExchangeTableValueSource } from './exchange-table-value-source';

export class ExchangeListTableRecordSource extends RecordListTableRecordSource<Exchange> {
    declare readonly definition: ExchangeListTableRecordSourceDefinition;
    declare readonly list: ChangeSubscribableComparableList<Exchange>;

    constructor(
        textFormatterService: TextFormatterService,
        customHeadingsService: RevSourcedFieldCustomHeadings,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        definition: ExchangeListTableRecordSourceDefinition,
    ) {
        super(
            textFormatterService,
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactory,
            definition,
            definition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    override get recordList() { return super.recordList as ChangeSubscribableComparableList<Exchange>; }

    override createDefinition(): ExchangeListTableRecordSourceDefinition {
        return new ExchangeListTableRecordSourceDefinition(
            this.customHeadings,
            this.tableFieldSourceDefinitionCachingFactory,
            this.list.clone()
        )
    }

    override createRecordDefinition(idx: Integer): ExchangeTableRecordDefinition {
        const exchange = this.list.getAt(idx);
        return {
            typeId: TableFieldSourceDefinition.TypeId.Exchange,
            mapKey: exchange.mapKey,
            record: exchange,
        };
    }

    override createTableRecord(recordIndex: Integer, eventHandlers: TableRecord.EventHandlers): TableRecord {
        const result = new TableRecord(recordIndex, eventHandlers);
        const exchange = this.list.getAt(recordIndex);

        const fieldSources = this.activeFieldSources;
        const sourceCount = fieldSources.length;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldSources[i];
            const fieldSourceDefinition = fieldSource.definition;
            const fieldSourceDefinitionTypeId = fieldSourceDefinition.typeId as ExchangeListTableRecordSourceDefinition.FieldSourceDefinitionTypeId;
            if (this.allowedFieldSourceDefinitionTypeIds.includes(fieldSourceDefinitionTypeId)) {
                switch (fieldSourceDefinitionTypeId) {
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    case TableFieldSourceDefinition.TypeId.Exchange: {
                        const valueSource = new ExchangeTableValueSource(result.fieldCount, exchange);
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
        return ExchangeListTableRecordSourceDefinition.defaultFieldSourceDefinitionTypeIds;
    }
}
