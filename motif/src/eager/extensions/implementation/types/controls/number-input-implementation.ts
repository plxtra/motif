import { NumberUiAction } from '@pbkware/ui-action';
import { NumberInput as NumberInputApi } from '../../../api';
import { FactoryComponent, FactoryComponentRef } from '../component/internal-api';
import { NumberUiActionImplementation } from '../core/internal-api';

export class NumberInputImplementation extends NumberUiActionImplementation implements NumberInputApi, FactoryComponent {
    constructor(private readonly _factoryComponentRef: FactoryComponentRef, uiAction: NumberUiAction) {
        super(uiAction);
    }

    get factoryComponentRef() { return this._factoryComponentRef; }
    get rootHtmlElement() { return this._factoryComponentRef.rootHtmlElement; }
}
