import { FeedClass, Integer } from '../../types';

/** @public */
export interface FeedClassSvc {
    toName(id: FeedClass): string;
    toDisplay(id: FeedClass): string;

    toHandle(id: FeedClass): FeedClassHandle;
    fromHandle(handle: FeedClassHandle): FeedClass | undefined;

    handleToName(handle: FeedClassHandle): string;
    handleToDisplay(handle: FeedClassHandle): string;
}

/** @public */
export type FeedClassHandle = Integer;
