import { Integer } from './types-api';

/** @public */
export interface SourceTzOffsetDate {
    readonly utcMidnight: Date; // This must always be midnight
    readonly offset: Integer;
}
