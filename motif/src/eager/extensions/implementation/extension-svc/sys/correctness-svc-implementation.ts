import { Correctness } from '@plxtra/motif-core';
import { Correctness as CorrectnessApi, CorrectnessSvc } from '../../../api';
import { CorrectnessImplementation } from '../../types/internal-api';

export class CorrectnessSvcImplementation implements CorrectnessSvc {
    isUsable(correctness: CorrectnessApi) {
        return Correctness.idIsUsable(CorrectnessImplementation.fromApi(correctness));
    }

    isUnusable(correctness: CorrectnessApi) {
        return Correctness.idIsUnusable(CorrectnessImplementation.fromApi(correctness));
    }

    isIncubated(correctness: CorrectnessApi) {
        return Correctness.idIsIncubated(CorrectnessImplementation.fromApi(correctness));
    }
}
