import { BadnessComparableList } from '@plxtra/motif-core';
import {
    BadnessComparableList as BadnessComparableListApi,
    Correctness as CorrectnessApi
} from '../../../api';
import { ChangeSubscribableComparableListImplementation } from './change-subscribable-comparable-list-implementation';
import { CorrectnessImplementation } from './correctness-implementation';

export class BadnessComparableListImplementation<T extends U, U = T> extends ChangeSubscribableComparableListImplementation<T, U> implements BadnessComparableListApi<T, U> {
    declare protected readonly _actual: BadnessComparableList<T, U>;

    override get actual() {
        return this._actual;
    }

    get usable(): boolean { return this._actual.usable; }
    get correctness(): CorrectnessApi { return CorrectnessImplementation.toApi(this._actual.correctnessId); }

    override clone(): BadnessComparableListApi<T, U> {
        const actualClone = this._actual.clone();
        return BadnessComparableListImplementation.badnessListToApi(actualClone);
    }
}

export namespace BadnessComparableListImplementation {
    export function badnessListToApi<T extends U, U = T>(value: BadnessComparableList<T, U>): BadnessComparableListApi<T, U> {
        return new BadnessComparableListImplementation(value);
    }

    export function badnessListFromApi<T extends U, U = T>(value: BadnessComparableListApi<T, U>) {
        const implementation = value as BadnessComparableListImplementation<T, U>;
        return implementation.actual;
    }
}
