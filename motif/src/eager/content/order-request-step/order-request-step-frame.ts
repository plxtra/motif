import { ContentFrame } from '../content-frame';

export class OrderRequestStepFrame extends ContentFrame {
    constructor(private _stepId: OrderRequestStepFrame.StepId) {
        super();
    }

    get stepId() { return this._stepId; }
}

export namespace OrderRequestStepFrame {
    export enum StepId {
        Pad,
        Review,
        Result,
    }
}
