import { JsonElement } from '../../sys';
import { Exchange } from '../markets';

/** @public */
export interface IvemId {
    readonly code: string;
    readonly exchange: Exchange;

    readonly mapKey: string;
    readonly name: string;

    createCopy(): IvemId;
    saveToJson(element: JsonElement): void;
}
