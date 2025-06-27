import { ChangeSubscribableComparableList, Integer, UnreachableCaseError } from '@pbkware/js-utils';
import {
    DataMarket,
    RecordListTableRecordSource,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactory,
    TableRecord,
    TextFormatterService
} from '@plxtra/motif-core';
import { RevSourcedFieldCustomHeadings } from 'revgrid';
import { DataMarketListTableRecordSourceDefinition } from './data-market-list-table-record-source-definition';
import { DataMarketTableRecordDefinition } from './data-market-table-record-definition';
import { DataMarketTableValueSource } from './data-market-table-value-source';

export class DataMarketListTableRecordSource extends RecordListTableRecordSource<DataMarket> {
    declare readonly definition: DataMarketListTableRecordSourceDefinition;
    declare readonly list: ChangeSubscribableComparableList<DataMarket>;

    constructor(
        textFormatterService: TextFormatterService,
        customHeadingsService: RevSourcedFieldCustomHeadings,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        definition: DataMarketListTableRecordSourceDefinition,
    ) {
        super(
            textFormatterService,
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactory,
            definition,
            definition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    override get recordList() { return super.recordList as ChangeSubscribableComparableList<DataMarket>; }

    override createDefinition(): DataMarketListTableRecordSourceDefinition {
        return new DataMarketListTableRecordSourceDefinition(
            this.customHeadings,
            this.tableFieldSourceDefinitionCachingFactory,
            this.list.clone()
        )
    }

    override createRecordDefinition(idx: Integer): DataMarketTableRecordDefinition {
        const dataMarket = this.list.getAt(idx);
        return {
            typeId: TableFieldSourceDefinition.TypeId.DataMarket,
            mapKey: dataMarket.zenithCode,
            record: dataMarket,
        };
    }

    override createTableRecord(recordIndex: Integer, eventHandlers: TableRecord.EventHandlers): TableRecord {
        const result = new TableRecord(recordIndex, eventHandlers);
        const dataMarket = this.list.getAt(recordIndex);

        const fieldSources = this.activeFieldSources;
        const sourceCount = fieldSources.length;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldSources[i];
            const fieldSourceDefinition = fieldSource.definition;
            const fieldSourceDefinitionTypeId = fieldSourceDefinition.typeId as DataMarketListTableRecordSourceDefinition.FieldSourceDefinitionTypeId;
            if (this.allowedFieldSourceDefinitionTypeIds.includes(fieldSourceDefinitionTypeId)) {
                switch (fieldSourceDefinitionTypeId) {
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    case TableFieldSourceDefinition.TypeId.DataMarket: {
                        const valueSource = new DataMarketTableValueSource(result.fieldCount, dataMarket);
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
        return DataMarketListTableRecordSourceDefinition.defaultFieldSourceDefinitionTypeIds;
    }
}
