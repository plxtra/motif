import { Integer, LockOpenListItem, Ok, Result, UnreachableCaseError } from '@pbkware/js-utils';
import {
    CorrectnessBadness,
    LockOpenListTableRecordSource,
    LockOpenNotificationChannel,
    LockOpenNotificationChannelList,
    NotificationChannelsService,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactory,
    TableRecord,
    TextFormatterService
} from '@plxtra/motif-core';
import { RevSourcedFieldCustomHeadings } from 'revgrid';
import { LockOpenNotificationChannelListTableRecordSourceDefinition } from './lock-open-notification-channel-list-table-record-source-definition';
import { LockOpenNotificationChannelTableRecordDefinition } from './lock-open-notification-channel-table-record-definition';
import { LockOpenNotificationChannelTableValueSource } from './lock-open-notification-channel-table-value-source';

export class LockOpenNotificationChannelListTableRecordSource extends LockOpenListTableRecordSource<LockOpenNotificationChannel, LockOpenNotificationChannelList> {
    declare readonly definition: LockOpenNotificationChannelListTableRecordSourceDefinition;

    constructor(
        private readonly _notificationChannelsService: NotificationChannelsService,
        textFormatterService: TextFormatterService,
        gridFieldCustomHeadingsService: RevSourcedFieldCustomHeadings,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        correctnessBadness: CorrectnessBadness,
        definition: LockOpenNotificationChannelListTableRecordSourceDefinition,
    ) {
        super(
            textFormatterService,
            gridFieldCustomHeadingsService,
            tableFieldSourceDefinitionCachingFactory,
            correctnessBadness,
            definition,
            definition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    override createDefinition(): LockOpenNotificationChannelListTableRecordSourceDefinition {
        return LockOpenNotificationChannelListTableRecordSourceDefinition.create(
            this.customHeadings,
            this.tableFieldSourceDefinitionCachingFactory,
        )
    }

    override createRecordDefinition(idx: Integer): LockOpenNotificationChannelTableRecordDefinition {
        const lockOpenNotificationChannel = this.recordList.getAt(idx);
        return {
            typeId: TableFieldSourceDefinition.TypeId.LockOpenNotificationChannel,
            mapKey: LockOpenNotificationChannel.name,
            record: lockOpenNotificationChannel,
        };
    }

    override createTableRecord(recordIndex: Integer, eventHandlers: TableRecord.EventHandlers): TableRecord {
        const result = new TableRecord(recordIndex, eventHandlers);
        const lockerScanAttachedNotificationChannel = this.recordList.getAt(recordIndex);

        const fieldSources = this.activeFieldSources;
        const sourceCount = fieldSources.length;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldSources[i];
            const fieldSourceDefinition = fieldSource.definition;
            const fieldSourceDefinitionTypeId = fieldSourceDefinition.typeId as LockOpenNotificationChannelListTableRecordSourceDefinition.FieldSourceDefinitionTypeId;
            if (this.allowedFieldSourceDefinitionTypeIds.includes(fieldSourceDefinitionTypeId)) {
                switch (fieldSourceDefinitionTypeId) {
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    case TableFieldSourceDefinition.TypeId.LockOpenNotificationChannel: {
                        const valueSource = new LockOpenNotificationChannelTableValueSource(result.fieldCount, lockerScanAttachedNotificationChannel);
                        result.addSource(valueSource);
                        break;
                    }
                    default:
                        throw new UnreachableCaseError('SFEFCLTRSCTR19909', fieldSourceDefinitionTypeId);
                }
            }
        }

        return result;
    }

    override async tryLock(locker: LockOpenListItem.Locker): Promise<Result<void>> {
        const result = await this._notificationChannelsService.getLoadedList(false);
        if (result.isErr()) {
            return result.createType();
        } else {
            // Ignore returned list - just want to make sure it has been loaded
            return Ok.createResolvedPromise(undefined);
        }
    }


    protected override getDefaultFieldSourceDefinitionTypeIds() {
        return LockOpenNotificationChannelListTableRecordSourceDefinition.defaultFieldSourceDefinitionTypeIds;
    }

    protected override subscribeList(_opener: LockOpenListItem.Opener): LockOpenNotificationChannelList {
        return this._notificationChannelsService.list;
    }

    protected override unsubscribeList(opener: LockOpenListItem.Opener, list: LockOpenNotificationChannelList): void {
        // nothing to do
    }
}
