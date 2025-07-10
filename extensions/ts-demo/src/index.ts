import { ExtensionRegistrar, ExtensionSvc } from '@plxtra/motif';
import * as npmPackage from '../package.json';
import { TsDemoExtension } from './ts-demo-extension';

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
        name: 'TsDemo',
        version,
        apiVersion: '3',
        loadCallback: (extensionSvc) => loadCallback(extensionSvc)
    };
    window.motifExtensionRegistrar.register(request);
}

export function loadCallback(extensionSvc: ExtensionSvc) {
    const extension = new TsDemoExtension(extensionSvc);
    extension.initialise();
    return extension;
}

addExtensionLoadRequest();
