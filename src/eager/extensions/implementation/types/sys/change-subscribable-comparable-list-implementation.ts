import { ChangeSubscribableComparableList } from '@pbkware/js-utils';
import {
    ChangeSubscribableComparableList as ChangeSubscribableComparableListApi,
    MultiEvent as MultiEventApi,
} from '../../../api';
import { ComparableListImplementation } from './comparable-list-implementation';
import { UsableListChangeTypeImplementation } from './usable-list-change-type-implementation';

export class ChangeSubscribableComparableListImplementation<T extends U, U = T> extends ComparableListImplementation<T, U> implements ChangeSubscribableComparableListApi<T, U> {
    declare protected readonly _actual: ChangeSubscribableComparableList<T, U>;

    override get actual() {
        return this._actual;
    }

    override clone(): ChangeSubscribableComparableListApi<T, U> {
        const actualClone = this._actual.clone();
        return ChangeSubscribableComparableListImplementation.changeSubscribableToApi(actualClone);
    }

    subscribeListChangeEvent(handler: ChangeSubscribableComparableListApi.ListChangeEventHandler): MultiEventApi.DefinedSubscriptionId {
        return this._actual.subscribeListChangeEvent((actualListChangeTypeId, idx, count) => {
            const usableListChangeType = UsableListChangeTypeImplementation.toApi(actualListChangeTypeId);
            handler(usableListChangeType, idx, count);
        });
    }

    unsubscribeListChangeEvent(subscriptionId: MultiEventApi.SubscriptionId): void {
        this._actual.unsubscribeListChangeEvent(subscriptionId);
    }
}

export namespace ChangeSubscribableComparableListImplementation {
    export function changeSubscribableToApi<T extends U, U = T>(value: ChangeSubscribableComparableList<T, U>): ChangeSubscribableComparableListApi<T, U> {
        return new ChangeSubscribableComparableListImplementation(value);
    }

    export function changeSubscribableFromApi<T extends U, U = T>(value: ChangeSubscribableComparableListApi<T, U>) {
        const implementation = value as ChangeSubscribableComparableListImplementation<T, U>;
        return implementation.actual;
    }
}
