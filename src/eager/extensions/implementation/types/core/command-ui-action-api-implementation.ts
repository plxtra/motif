import { CommandUiAction } from '@plxtra/motif-core';
import { CommandUiAction as CommandUiActionApi } from '../../../api';
import { BooleanUiActionImplementation } from './boolean-ui-action-api-implementation';
import { CommandImplementation } from './command-api-implementation';

export class CommandUiActionImplementation extends BooleanUiActionImplementation implements CommandUiActionApi {
    constructor(private readonly _commandActual: CommandUiAction) {
        super(_commandActual);
    }

    get commandActual() { return this._commandActual; }

    get command() { return CommandImplementation.toApi(this._commandActual.command); }
    get accessKey() { return this._commandActual.accessKey; }
    get accessibleCaption() { return this._commandActual.accessibleCaption; }

    public pushAccessKey(accessKey: string) {
        this._commandActual.pushAccessKey(accessKey);
    }
}
