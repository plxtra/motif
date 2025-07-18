import { DataIvemIdUiAction } from '@plxtra/motif-core';
import { DataIvemIdSelect as DataIvemIdSelectApi } from '../../../api';
import { FactoryComponent, FactoryComponentRef } from '../component/internal-api';
import { DataIvemIdUiActionImplementation } from '../core/internal-api';

export class DataIvemIdSelectImplementation extends DataIvemIdUiActionImplementation implements DataIvemIdSelectApi, FactoryComponent {
    constructor(private readonly _factoryComponentRef: FactoryComponentRef, uiAction: DataIvemIdUiAction) {
        super(uiAction);
    }

    get factoryComponentRef() { return this._factoryComponentRef; }
    get rootHtmlElement() { return this._factoryComponentRef.rootHtmlElement; }
}
