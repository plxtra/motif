import { DataIvemIdUiAction } from '@plxtra/motif-core';
import { DataIvemId as DataIvemIdApi, DataIvemIdUiAction as DataIvemIdUiActionApi } from '../../../api';
import { DataIvemIdImplementation } from '../adi/symbol-id/internal-api';
import { DataIvemIdParseDetailsImplementation } from './data-ivem-id-parse-details-implementation';
import { UiActionImplementation } from './ui-action-api-implementation';

export class DataIvemIdUiActionImplementation extends UiActionImplementation implements DataIvemIdUiActionApi {
    constructor(private readonly _dataIvemIdActual: DataIvemIdUiAction) {
        super(_dataIvemIdActual);
    }

    get dataIvemIdActual() { return this._dataIvemIdActual; }

    get value() {
        const dataIvemId = this._dataIvemIdActual.value;
        if (dataIvemId === undefined) {
            return undefined;
        } else {
            return DataIvemIdImplementation.toApi(dataIvemId);
        }
    }

    get definedValue() {
        const dataIvemId = this._dataIvemIdActual.definedValue;
        return DataIvemIdImplementation.toApi(dataIvemId);
    }

    get parseDetails() {
        const parseDetails = this._dataIvemIdActual.parseDetails;
        if (parseDetails === undefined) {
            return undefined;
        } else {
            return DataIvemIdParseDetailsImplementation.toApi(parseDetails);
        }
    }

    public pushValue(value: DataIvemIdApi | undefined) {
        const dataIvemId = value === undefined ? undefined : DataIvemIdImplementation.fromApi(value);
        this._dataIvemIdActual.pushValue(dataIvemId);
    }
}
