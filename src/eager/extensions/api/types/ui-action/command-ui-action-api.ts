import { BooleanUiAction } from './boolean-ui-action-api';
import { Command } from './command-api';

/** @public */
export interface CommandUiAction extends BooleanUiAction {
    readonly command: Command;
    readonly accessKey: string;
    readonly accessibleCaption: CommandUiAction.AccessibleCaption;

    pushAccessKey(accessKey: string): void;
}

/** @public */
export namespace CommandUiAction {
    export interface AccessibleCaption {
        readonly preAccessKey: string;
        readonly accessKey: string;
        readonly postAccessKey: string;
    }
}
