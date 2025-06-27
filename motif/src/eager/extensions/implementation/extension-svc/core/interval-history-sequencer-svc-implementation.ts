import {
    IntervalHistorySequencer
} from '@plxtra/motif-core';
import {
    IntervalHistorySequencer as IntervalHistorySequencerApi,
    IntervalHistorySequencerSvc
} from '../../../api';
import {
    IntervalHistorySequencerImplementation
} from '../../types/internal-api';

export class IntervalHistorySequencerSvcImplementation implements IntervalHistorySequencerSvc {
    unitToJsonValue(value: IntervalHistorySequencerApi.UnitEnum): string {
        const typeId = IntervalHistorySequencerImplementation.UnitId.fromApi(value);
        return IntervalHistorySequencer.Unit.idToJsonValue(typeId);
    }

    unitFromJsonValue(value: string): IntervalHistorySequencerApi.UnitEnum | undefined {
        const typeId = IntervalHistorySequencer.Unit.tryJsonValueToId(value as IntervalHistorySequencer.Unit.JsonValue);
        if (typeId === undefined) {
            return undefined;
        } else {
            return IntervalHistorySequencerImplementation.UnitId.toApi(typeId);
        }
    }
}
