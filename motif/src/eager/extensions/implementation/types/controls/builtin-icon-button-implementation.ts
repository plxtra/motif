import { IconButtonUiAction } from '@plxtra/motif-core';
import { BuiltinIconButton as BuiltinIconButtonApi } from '../../../api';
import { FactoryComponent, FactoryComponentRef } from '../component/internal-api';
import { BuiltinIconButtonUiActionImplementation } from '../core/internal-api';

export class BuiltinIconButtonImplementation extends BuiltinIconButtonUiActionImplementation
    implements BuiltinIconButtonApi, FactoryComponent {

    constructor(private readonly _factoryComponentRef: FactoryComponentRef, uiAction: IconButtonUiAction) {
        super(uiAction);
    }

    get factoryComponentRef() { return this._factoryComponentRef; }
    get rootHtmlElement() { return this._factoryComponentRef.rootHtmlElement; }
}
