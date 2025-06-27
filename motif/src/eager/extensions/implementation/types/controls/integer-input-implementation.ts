import { IntegerUiAction } from '@pbkware/ui-action';
import { IntegerInput as IntegerInputApi } from '../../../api';
import { FactoryComponent, FactoryComponentRef } from '../component/internal-api';
import { IntegerUiActionImplementation } from '../core/internal-api';

export class IntegerInputImplementation extends IntegerUiActionImplementation implements IntegerInputApi, FactoryComponent {
    constructor(private readonly _factoryComponentRef: FactoryComponentRef, uiAction: IntegerUiAction) {
        super(uiAction);
    }

    get factoryComponentRef() { return this._factoryComponentRef; }
    get rootHtmlElement() { return this._factoryComponentRef.rootHtmlElement; }
}
