import { ChangeSubscribableComparableList } from './change-subscribable-comparable-list-api';
import { Correctness } from './correctness-api';

/** @public */
export interface BadnessComparableList<out T extends U, in U = T> extends ChangeSubscribableComparableList<T, U> {
    readonly usable: boolean;
    readonly correctness: Correctness;

    clone(): BadnessComparableList<T, U>;
}
