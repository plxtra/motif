/** @public */
export const enum ModifierKeyEnum {
    Alt = 'Alt',
    Ctrl = 'Ctrl',
    Meta = 'Meta',
    Shift = 'Shift',
}
/** @public */
export type ModifierKey = keyof typeof ModifierKeyEnum;

/** @public */
export type ModifierKeys = ModifierKey[];
