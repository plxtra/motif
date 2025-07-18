import { IvemId } from '@plxtra/motif-core';
import { IvemId as IvemIdApi, JsonElement as JsonElementApi } from '../../../../api';
import { JsonElementImplementation } from '../../sys/internal-api';
import { ExchangeImplementation } from '../markets/internal-api';

export class IvemIdImplementation implements IvemIdApi {
    constructor(readonly actual: IvemId) { }

    get code() { return this.actual.code; }
    get exchange() { return ExchangeImplementation.toApi(this.actual.exchange); }
    get name() { return this.actual.name; }
    get mapKey() { return this.actual.mapKey; }

    createCopy(): IvemIdApi {
        const actualCopy = this.actual.createCopy();
        return IvemIdImplementation.toApi(actualCopy);
    }

    saveToJson(elementApi: JsonElementApi) {
        const element = JsonElementImplementation.fromApi(elementApi);
        this.actual.saveToJson(element);
    }
}

export namespace IvemIdImplementation {
    export function toApi(actual: IvemId) {
        return new IvemIdImplementation(actual);
    }

    export function fromApi(ivemIdApi: IvemIdApi) {
        const implementation = ivemIdApi as IvemIdImplementation;
        return implementation.actual;
    }

    export function arrayToApi(actualArray: readonly IvemId[]): IvemIdApi[] {
        const count = actualArray.length;
        const result = new Array<IvemIdApi>(count);
        for (let i = 0; i < count; i++) {
            const actual = actualArray[i];
            result[i] = toApi(actual);
        }
        return result;
    }

    export function arrayFromApi(ivemIdArrayApi: readonly IvemIdApi[]): IvemId[] {
        const count = ivemIdArrayApi.length;
        const result = new Array<IvemId>(count);
        for (let i = 0; i < count; i++) {
            const ivemIdApi = ivemIdArrayApi[i];
            result[i] = fromApi(ivemIdApi);
        }
        return result;
    }
}
