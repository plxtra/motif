/** @public */
export const enum FeedStatusEnum {
    Initialising = 'Initialising',
    Active = 'Active',
    Closed = 'Closed',
    Inactive = 'Inactive',
    Impaired = 'Impaired',
    Expired = 'Expired',
}

/** @public */
export type FeedStatus = keyof typeof FeedStatusEnum;
