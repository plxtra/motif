import { ButtonUiAction } from '@plxtra/motif-core';
import { ButtonUiAction as ButtonUiActionApi } from '../../../api';
import { CommandUiActionImplementation } from './command-ui-action-api-implementation';

export class ButtonUiActionImplementation extends CommandUiActionImplementation implements ButtonUiActionApi {
    constructor(private readonly _buttonActual: ButtonUiAction) {
        super(_buttonActual);
    }

    get buttonActual() { return this._buttonActual; }

    public pushUnselected() {
        this._buttonActual.pushValue(false);
    }

    public pushSelected() {
        this._buttonActual.pushValue(true);
    }
}
