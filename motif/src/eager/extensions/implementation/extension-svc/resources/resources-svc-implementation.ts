import { ExtensionHandle, ExtStrings } from '@plxtra/motif-core';
import { ResourcesSvc } from '../../../api';

export class ResourcesSvcImplementation implements ResourcesSvc {

    constructor(private readonly _extensionHandle: ExtensionHandle) {
    }

    setI18nStrings(value: string[]) {
        ExtStrings.setExtensionStrings(this._extensionHandle, value);
    }

    clearI18nStrings(value: string[]) {
        ExtStrings.clearExtensionStrings(this._extensionHandle);
    }
}
