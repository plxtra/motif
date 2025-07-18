/** @public */
export const enum TimezoneModeEnum {
    Utc = 'Utc',
    Local = 'Local',
    Source = 'Source',
}

/** @public */
export type TimezoneMode = keyof typeof TimezoneModeEnum;
