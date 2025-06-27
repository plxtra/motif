import { IntervalHistorySequencer } from '../../types';

/** @public */
export interface IntervalHistorySequencerSvc {
    unitToJsonValue(value: IntervalHistorySequencer.UnitEnum): string;
    unitFromJsonValue(value: string): IntervalHistorySequencer.UnitEnum | undefined;
}
