import { Integer, SymbolField } from '../../types';

/** @public */
export interface SymbolFieldSvc {
    toName(field: SymbolField): string;
    toDisplay(field: SymbolField): string;
    toDescription(field: SymbolField): string;

    toHandle(field: SymbolField): SymbolFieldHandle;
    fromHandle(handle: SymbolFieldHandle): SymbolField;

    handleToName(handle: SymbolFieldHandle): string;
    handleToDisplay(handle: SymbolFieldHandle): string;
    handleToDescription(handle: SymbolFieldHandle): string;
}

/** @public */
export type SymbolFieldHandle = Integer;
