import { ChangeSubscribableComparableList, Integer, UnreachableCaseError } from '@pbkware/js-utils';
import {
    MarketBoard,
    RecordListTableRecordSource,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactory,
    TableRecord,
    TextFormatterService
} from '@plxtra/motif-core';
import { RevSourcedFieldCustomHeadings } from 'revgrid';
import { MarketBoardListTableRecordSourceDefinition } from './market-board-list-table-record-source-definition';
import { MarketBoardTableRecordDefinition } from './market-board-table-record-definition';
import { MarketBoardTableValueSource } from './market-board-table-value-source';

export class MarketBoardListTableRecordSource extends RecordListTableRecordSource<MarketBoard> {
    declare readonly definition: MarketBoardListTableRecordSourceDefinition;
    declare readonly list: ChangeSubscribableComparableList<MarketBoard>;

    constructor(
        textFormatterService: TextFormatterService,
        customHeadingsService: RevSourcedFieldCustomHeadings,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        definition: MarketBoardListTableRecordSourceDefinition,
    ) {
        super(
            textFormatterService,
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactory,
            definition,
            definition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    override get recordList() { return super.recordList as ChangeSubscribableComparableList<MarketBoard>; }

    override createDefinition(): MarketBoardListTableRecordSourceDefinition {
        return new MarketBoardListTableRecordSourceDefinition(
            this.customHeadings,
            this.tableFieldSourceDefinitionCachingFactory,
            this.list.clone()
        )
    }

    override createRecordDefinition(idx: Integer): MarketBoardTableRecordDefinition {
        const marketBoard = this.list.getAt(idx);
        return {
            typeId: TableFieldSourceDefinition.TypeId.MarketBoard,
            mapKey: marketBoard.zenithCode,
            record: marketBoard,
        };
    }

    override createTableRecord(recordIndex: Integer, eventHandlers: TableRecord.EventHandlers): TableRecord {
        const result = new TableRecord(recordIndex, eventHandlers);
        const marketBoard = this.list.getAt(recordIndex);

        const fieldSources = this.activeFieldSources;
        const sourceCount = fieldSources.length;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldSources[i];
            const fieldSourceDefinition = fieldSource.definition;
            const fieldSourceDefinitionTypeId = fieldSourceDefinition.typeId as MarketBoardListTableRecordSourceDefinition.FieldSourceDefinitionTypeId;
            if (this.allowedFieldSourceDefinitionTypeIds.includes(fieldSourceDefinitionTypeId)) {
                switch (fieldSourceDefinitionTypeId) {
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    case TableFieldSourceDefinition.TypeId.MarketBoard: {
                        const valueSource = new MarketBoardTableValueSource(result.fieldCount, marketBoard);
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
        return MarketBoardListTableRecordSourceDefinition.defaultFieldSourceDefinitionTypeIds;
    }
}
