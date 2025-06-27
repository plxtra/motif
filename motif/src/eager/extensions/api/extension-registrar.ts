import { Extension } from './extension';
import { ExtensionSvc } from './extension-svc/extension-svc';
import { PublisherType } from './types';

/** @public */
export interface ExtensionRegistrar {
    register(request: ExtensionRegistrar.Request): void;
}

/** @public */
export namespace ExtensionRegistrar {
    export type ApiVersion = '3';

    export interface Request {
        publisherType: PublisherType;
        publisherName: string;
        name: string;
        version: string;
        apiVersion: ApiVersion;
        loadCallback: Request.LoadCallback;
    }

    export namespace Request {
        export type LoadCallback = (this: void, extension: ExtensionSvc) => Extension;
    }

    export const windowPropertyName = 'motifExtensionRegistrar';
}

