import { DecimalUiAction } from '@pbkware/ui-action';
import { DecimalInput as DecimalInputApi } from '../../../api';
import { FactoryComponent, FactoryComponentRef } from '../component/internal-api';
import { DecimalUiActionImplementation } from '../core/internal-api';

export class DecimalInputImplementation extends DecimalUiActionImplementation implements DecimalInputApi, FactoryComponent {
    constructor(private readonly _factoryComponentRef: FactoryComponentRef, uiAction: DecimalUiAction) {
        super(uiAction);
    }

    get factoryComponentRef() { return this._factoryComponentRef; }
    get rootHtmlElement() { return this._factoryComponentRef.rootHtmlElement; }
}
