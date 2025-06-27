import { Correctness, FeedStatus, Integer } from '../../types';

/** @public */
export interface FeedStatusSvc {
    toCorrectness(status: FeedStatus): Correctness;
    toDisplay(status: FeedStatus): string;

    toHandle(status: FeedStatus): FeedStatusHandle;
    fromHandle(handle: FeedStatusHandle): FeedStatus | undefined;

    handleToDisplay(handle: FeedStatusHandle): string;
}

/** @public */
export type FeedStatusHandle = Integer;
