import { ExtensionRegistrar, ExtensionSvc } from '@plxtra/motif';
import * as npmPackage from '../package.json';
import { TsDemoExtension } from './ts-demo-extension';

// Declare global interface to extend the Window object for the extension registrar.
// Motif will ensure window.plxtraMotifExtensionRegistrar is defined before it loads any extension.
// #region plxtraMotifExtensionRegistrar
declare global {
    interface Window {
        plxtraMotifExtensionRegistrar: ExtensionRegistrar;
    }
}
// #endregion plxtraMotifExtensionRegistrar

// Creates a request to load the TsDemo extension.
// The string properties in the Request interface must match the values in the Motif configuration for this extension.
// #region functionaddExtensionLoadRequest
export function addExtensionLoadRequest() {
    const { version } = npmPackage;
    const request: ExtensionRegistrar.Request = {
        publisherType: 'Organisation',
        publisherName: 'Plxtra',
        name: 'TsDemo',
        version,
        apiVersion: '3',
        loadCallback: (extensionSvc) => loadCallback(extensionSvc)
    };
    window.plxtraMotifExtensionRegistrar.register(request);
}
// #endregion functionaddExtensionLoadRequest

// loadCallback() is called by Motif after it has received and accepted the extension load request.
// Motif passes an ExtensionSvc parameter which the extension can use to access Motif services.
// loadCallback() needs to return the instance of the extension class.
// #region functionloadCallback
export function loadCallback(extensionSvc: ExtensionSvc) {
    const extension = new TsDemoExtension(extensionSvc);
    // Call initialise() after contructing the extension as it is async.
    const promise = extension.initialise();
    promise.catch((error) => {
        console.error('TsDemoExtension initialisation failed:', error);
        throw error;
    });
    return extension;
}
// #endregion functionloadCallback

// Call addExtensionLoadRequest() when the script is loaded to register the extension with Motif.
// #region addExtensionLoadRequest
addExtensionLoadRequest();
// #endregion addExtensionLoadRequest
