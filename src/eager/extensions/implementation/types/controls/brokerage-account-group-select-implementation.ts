import { BrokerageAccountGroupUiAction } from '@plxtra/motif-core';
import { BrokerageAccountGroupSelect as BrokerageAccountGroupSelectApi } from '../../../api';
import { FactoryComponent, FactoryComponentRef } from '../component/internal-api';
import { BrokerageAccountGroupUiActionImplementation } from '../core/internal-api';

export class BrokerageAccountGroupSelectImplementation extends BrokerageAccountGroupUiActionImplementation
    implements BrokerageAccountGroupSelectApi, FactoryComponent {

    constructor(private readonly _factoryComponentRef: FactoryComponentRef, uiAction: BrokerageAccountGroupUiAction) {
        super(uiAction);
    }

    get factoryComponentRef() { return this._factoryComponentRef; }
    get rootHtmlElement() { return this._factoryComponentRef.rootHtmlElement; }
}
