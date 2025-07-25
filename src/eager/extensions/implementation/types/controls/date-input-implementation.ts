import { DateUiAction } from '@pbkware/ui-action';
import { DateInput as DateInputApi } from '../../../api';
import { FactoryComponent, FactoryComponentRef } from '../component/internal-api';
import { DateUiActionImplementation } from '../core/internal-api';

export class DateInputImplementation extends DateUiActionImplementation implements DateInputApi, FactoryComponent {
    constructor(private readonly _factoryComponentRef: FactoryComponentRef, uiAction: DateUiAction) {
        super(uiAction);
    }

    get factoryComponentRef() { return this._factoryComponentRef; }
    get rootHtmlElement() { return this._factoryComponentRef.rootHtmlElement; }
}
