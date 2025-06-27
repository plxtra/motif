import { Handle, Integer } from './types-api';

/** @public */
export const enum UsableListChangeTypeEnum {
    Unusable = 'Unusable',
    PreUsableAdd = 'PreUsableAdd',
    PreUsableClear = 'PreUsableClear',
    Usable = 'Usable',
    Insert = 'Insert',
    BeforeReplace = 'BeforeReplace',
    AfterReplace = 'AfterReplace',
    BeforeMove = 'BeforeMove',
    AfterMove = 'AfterMove',
    Remove = 'Remove',
    Clear = 'Clear',
}

/** @public */
export type UsableListChangeType = keyof typeof UsableListChangeTypeEnum;

/** @public */
export type UsableListChangeHandle = Handle;

/** @public */
export namespace UsableListChangeType {
    export interface MoveParameters {
        fromIndex: Integer;
        toIndex: Integer;
        count: Integer;
    }
}
