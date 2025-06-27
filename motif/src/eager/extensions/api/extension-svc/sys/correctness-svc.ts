import { Correctness } from '../../types';

/** @public */
export interface CorrectnessSvc {
    isUsable(correctness: Correctness): boolean;
    isUnusable(correctness: Correctness): boolean;
    isIncubated(correctness: Correctness): boolean;
}
