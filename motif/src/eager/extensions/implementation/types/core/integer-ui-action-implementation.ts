import { IntegerUiAction } from '@pbkware/ui-action';
import { IntegerUiAction as IntegerUiActionApi } from '../../../api';
import { NumberUiActionImplementation } from './number-ui-action-implementation';

export class IntegerUiActionImplementation extends NumberUiActionImplementation implements IntegerUiActionApi {
    constructor(private readonly _integerActual: IntegerUiAction) {
        super(_integerActual);
    }

    get integerActual() { return this._integerActual; }
}
