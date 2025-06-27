import { ComparableList } from './comparable-list-api';
import { MultiEvent } from './multi-event-api';
import { Integer } from './types-api';
import { UsableListChangeType } from './usable-list-change-type-api';

/** @public */
export interface ChangeSubscribableComparableList<out T extends U, in U = T> extends ComparableList<T, U> {
    clone(): ChangeSubscribableComparableList<T, U>;
    subscribeListChangeEvent(handler: ChangeSubscribableComparableList.ListChangeEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void;
}

/** @public */
export namespace ChangeSubscribableComparableList {
    export type ListChangeEventHandler = (this: void, listChangeTypeId: UsableListChangeType, idx: Integer, count: Integer) => void;
}
