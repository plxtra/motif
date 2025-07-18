import { SymbolField } from '@plxtra/motif-core';
import { SymbolField as SymbolFieldApi, SymbolFieldHandle, SymbolFieldSvc } from '../../../api';
import { SymbolFieldImplementation } from '../../types/internal-api';

export class SymbolFieldSvcImplementation implements SymbolFieldSvc {
    toName(field: SymbolFieldApi): string {
        const id = SymbolFieldImplementation.fromApi(field);
        return SymbolField.idToJsonValue(id);
    }

    toDisplay(field: SymbolFieldApi): string {
        const id = SymbolFieldImplementation.fromApi(field);
        return SymbolField.idToDisplay(id);
    }

    toDescription(field: SymbolFieldApi): string {
        const id = SymbolFieldImplementation.fromApi(field);
        return SymbolField.idToDescription(id);
    }

    toHandle(field: SymbolFieldApi): SymbolFieldHandle {
        return SymbolFieldImplementation.fromApi(field);
    }

    fromHandle(handle: SymbolFieldHandle): SymbolFieldApi {
        return SymbolFieldImplementation.toApi(handle);
    }

    handleToName(handle: SymbolFieldHandle): string {
        return SymbolField.idToJsonValue(handle);
    }

    handleToDisplay(handle: SymbolFieldHandle): string {
        return SymbolField.idToDisplay(handle);
    }

    handleToDescription(handle: SymbolFieldHandle): string {
        return SymbolField.idToDescription(handle);
    }
}
