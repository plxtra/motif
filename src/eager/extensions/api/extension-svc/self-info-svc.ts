import { PublisherType } from '../types';

/** @public */
export interface SelfInfoSvc {
    readonly publisherType: PublisherType;
    readonly publisherName: string;
    readonly name: string;
    readonly version: string;
    readonly shortDescription: string;
    readonly longDescription: string;
}
