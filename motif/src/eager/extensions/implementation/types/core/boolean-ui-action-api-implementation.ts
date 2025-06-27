import { BooleanUiAction } from '@pbkware/ui-action';
import { BooleanUiAction as BooleanUiActionApi } from '../../../api';
import { UiActionImplementation } from './ui-action-api-implementation';

export class BooleanUiActionImplementation extends UiActionImplementation implements BooleanUiActionApi {
    constructor(private readonly _booleanActual: BooleanUiAction) {
        super(_booleanActual);
    }

    get booleanActual() { return this._booleanActual; }

    get value() { return this._booleanActual.value; }
    get definedValue() { return this._booleanActual.definedValue; }

    public pushValue(value: boolean | undefined) {
        this._booleanActual.pushValue(value);
    }
}
