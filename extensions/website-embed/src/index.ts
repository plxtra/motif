import { ExtensionRegistrar, ExtensionSvc } from '@plxtra/motif';
import * as npmPackage from '../package.json';
import { WebsiteEmbedExtension } from './website-embed-extension';

declare global {
    interface Window {
        plxtraMotifExtensionRegistrar: ExtensionRegistrar;
    }
}

export function addExtensionLoadRequest() {
    const { version } = npmPackage;
    const request: ExtensionRegistrar.Request = {
        publisherType: 'Organisation',
        publisherName: 'Plxtra',
        name: 'Website Embed',
        version,
        apiVersion: '3',
        loadCallback: (extensionSvc) => loadCallback(extensionSvc)
    };
    window.plxtraMotifExtensionRegistrar.register(request);
}

export function loadCallback(extensionSvc: ExtensionSvc) {
    const extension = new WebsiteEmbedExtension(extensionSvc);
    extension.initialise();
    return extension;
}

addExtensionLoadRequest();
