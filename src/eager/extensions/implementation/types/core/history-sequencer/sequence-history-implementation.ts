import { SequenceHistory } from '@plxtra/motif-core';
import { SequenceHistory as SequenceHistoryApi } from '../../../../api';
import { BadnessImplementation } from '../../sys/internal-api';

export abstract class SequenceHistoryImplementation implements SequenceHistoryApi {
    badnessChangeEventer: SequenceHistoryApi.BadnessChangeEventHandler | undefined;

    constructor(private readonly _baseActual: SequenceHistory) {
        this._baseActual.badnessChangedEvent = () => this.handleBadnessChangedEvent();
    }

    get actual() { return this._baseActual; }

    get badness() { return BadnessImplementation.toApi(this._baseActual.badness); }
    get good() { return this._baseActual.good; }
    get usable() { return this._baseActual.usable; }

    finalise() {
        this.badnessChangeEventer = undefined;
    }

    private handleBadnessChangedEvent() {
        if (this.badnessChangeEventer !== undefined) {
            this.badnessChangeEventer();
        }
    }
}
