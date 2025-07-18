import { ChangeSubscribableComparableList, Integer, UnreachableCaseError } from '@pbkware/js-utils';
import {
    RecordListTableRecordSource,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactory,
    TableRecord,
    TextFormatterService,
    TradingMarket
} from '@plxtra/motif-core';
import { RevSourcedFieldCustomHeadings } from 'revgrid';
import { TradingMarketListTableRecordSourceDefinition } from './trading-market-list-table-record-source-definition';
import { TradingMarketTableRecordDefinition } from './trading-market-table-record-definition';
import { TradingMarketTableValueSource } from './trading-market-table-value-source';

export class TradingMarketListTableRecordSource extends RecordListTableRecordSource<TradingMarket> {
    declare readonly definition: TradingMarketListTableRecordSourceDefinition;
    declare readonly list: ChangeSubscribableComparableList<TradingMarket>;

    constructor(
        textFormatterService: TextFormatterService,
        customHeadingsService: RevSourcedFieldCustomHeadings,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        definition: TradingMarketListTableRecordSourceDefinition,
    ) {
        super(
            textFormatterService,
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactory,
            definition,
            definition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    override get recordList() { return super.recordList as ChangeSubscribableComparableList<TradingMarket>; }

    override createDefinition(): TradingMarketListTableRecordSourceDefinition {
        return new TradingMarketListTableRecordSourceDefinition(
            this.customHeadings,
            this.tableFieldSourceDefinitionCachingFactory,
            this.list.clone()
        )
    }

    override createRecordDefinition(idx: Integer): TradingMarketTableRecordDefinition {
        const tradingMarket = this.list.getAt(idx);
        return {
            typeId: TableFieldSourceDefinition.TypeId.TradingMarket,
            mapKey: tradingMarket.mapKey,
            record: tradingMarket,
        };
    }

    override createTableRecord(recordIndex: Integer, eventHandlers: TableRecord.EventHandlers): TableRecord {
        const result = new TableRecord(recordIndex, eventHandlers);
        const tradingMarket = this.list.getAt(recordIndex);

        const fieldSources = this.activeFieldSources;
        const sourceCount = fieldSources.length;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldSources[i];
            const fieldSourceDefinition = fieldSource.definition;
            const fieldSourceDefinitionTypeId = fieldSourceDefinition.typeId as TradingMarketListTableRecordSourceDefinition.FieldSourceDefinitionTypeId;
            if (this.allowedFieldSourceDefinitionTypeIds.includes(fieldSourceDefinitionTypeId)) {
                switch (fieldSourceDefinitionTypeId) {
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    case TableFieldSourceDefinition.TypeId.TradingMarket: {
                        const valueSource = new TradingMarketTableValueSource(result.fieldCount, tradingMarket);
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
        return TradingMarketListTableRecordSourceDefinition.defaultFieldSourceDefinitionTypeIds;
    }
}
