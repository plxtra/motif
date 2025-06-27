import { BooleanUiAction } from '@pbkware/ui-action';
import { Checkbox as CheckboxApi } from '../../../api';
import { FactoryComponent, FactoryComponentRef } from '../component/internal-api';
import { BooleanUiActionImplementation } from '../core/internal-api';

export class CheckboxImplementation extends BooleanUiActionImplementation implements CheckboxApi, FactoryComponent {
    constructor(private readonly _factoryComponentRef: FactoryComponentRef, uiAction: BooleanUiAction) {
        super(uiAction);
    }

    get factoryComponentRef() { return this._factoryComponentRef; }
    get rootHtmlElement() { return this._factoryComponentRef.rootHtmlElement; }
}
