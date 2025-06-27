import { DateUiAction } from '@pbkware/ui-action';
import { DateUiAction as DateUiActionApi } from '../../../api';
import { UiActionImplementation } from './ui-action-api-implementation';

export class DateUiActionImplementation extends UiActionImplementation implements DateUiActionApi {
    constructor(private readonly _dateActual: DateUiAction) {
        super(_dateActual);
    }

    get dateActual() { return this._dateActual; }

    get value() { return this._dateActual.value; }
    get definedValue() { return this._dateActual.definedValue; }

    public pushValue(value: Date | undefined) {
        this._dateActual.pushValue(value);
    }
}
