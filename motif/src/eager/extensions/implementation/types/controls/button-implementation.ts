import { ButtonUiAction } from '@plxtra/motif-core';
import { Button as ButtonApi } from '../../../api';
import { FactoryComponent, FactoryComponentRef } from '../component/internal-api';
import { ButtonUiActionImplementation } from '../core/internal-api';

export class ButtonImplementation extends ButtonUiActionImplementation implements ButtonApi, FactoryComponent {
    constructor(private readonly _factoryComponentRef: FactoryComponentRef, uiAction: ButtonUiAction) {
        super(uiAction);
    }

    get factoryComponentRef() { return this._factoryComponentRef; }
    get rootHtmlElement() { return this._factoryComponentRef.rootHtmlElement; }
}
