/** @public */
export const enum CorrectnessEnum {
    Good = 'Good',
    Usable = 'Usable',
    Suspect = 'Suspect',
    Error = 'Error',
}

/** @public */
export type Correctness = keyof typeof CorrectnessEnum;
