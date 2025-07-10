import { AssertInternalError } from '@pbkware/js-utils';
import { ExtensionRegistrar, ExtensionSvc } from '@plxtra/motif';
import * as npmPackage from '../package.json';
import { HighchartsExtension } from './highcharts-extension';

declare global {
    interface Window {
        motifExtensionRegistrar: ExtensionRegistrar;
    }
}

export function addExtensionLoadRequest() {
    const { version } = npmPackage;
    const request: ExtensionRegistrar.Request = {
        publisherType: 'Organisation',
        publisherName: 'Plxtra',
        name: 'Highcharts',
        version,
        apiVersion: '3',
        loadCallback: (extensionSvc) => loadCallback(extensionSvc)
    };
    window.motifExtensionRegistrar.register(request);
}

export function loadCallback(extensionSvc: ExtensionSvc) {
    const extension = new HighchartsExtension(extensionSvc);
    const initialisePromise = extension.initialise();
    AssertInternalError.throwErrorIfPromiseRejected(initialisePromise, 'HighchartsExtension initialisation failed');
    return extension;
}

addExtensionLoadRequest();
