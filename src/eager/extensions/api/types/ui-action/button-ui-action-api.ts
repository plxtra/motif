import { CommandUiAction } from './command-ui-action-api';

/** @public */
export interface ButtonUiAction extends CommandUiAction {
    pushUnselected(): void;
    pushSelected(): void;
}
