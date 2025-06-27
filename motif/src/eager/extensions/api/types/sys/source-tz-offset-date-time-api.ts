import { Integer } from './types-api';

/** @public */
export interface SourceTzOffsetDateTime {
    readonly utcDate: Date;
    readonly offset: Integer;
}
